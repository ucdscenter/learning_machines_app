import os

from datetime import datetime
from elasticsearch import Elasticsearch as ES, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from botocore.session import Session
from collections import namedtuple

from learningmachines.public_credentials import AWS_PROFILE
from learningmachines.cfg import ES_MAX_SIZE, ES_SCROLL_SIZE
from learningmachines.es_fields import ES_FIELDS, MAX_NUM_DOC_VIS
from .pre_processing import  get_min_term_occurrence, TextHandler
import sys
from gensim.models.doc2vec import TaggedDocument

sys.setrecursionlimit(5000)

class SearchResults_ES:
        def __init__(self, database, qry_obj=None, cm=None, tokenized=False, cleaned=False, rand=False, taggedDoc=False):
                #aws_auth = AWS4Auth(AWS_PROFILE['ACCESS_KEY'], AWS_PROFILE['SECRET_KEY'], 'us-east-2', 'es', session_token=AWS_PROFILE['SESSION_TOKEN'])
                credentials = Session().get_credentials()
                aws_auth = AWS4Auth(region='us-east-2', service='es', refreshable_credentials=credentials)
                aws_host = AWS_PROFILE['AWS_HOST']
                self.database = database
                self.es_index = ES_FIELDS['index'][database]
                self.qry_obj = qry_obj
                self.cm = cm
                self.tokenized = tokenized
                self.es = ES(
                        hosts=[{'host': aws_host, 'port': 443}],
                        http_auth=aws_auth,
                        use_ssl=True,
                        verify_certs=True,
                        connection_class=RequestsHttpConnection,
                        timeout=300
                )
                self.esDoc = namedtuple('esDoc', ['doc_id', 'journal_title', 'article_title', 'authors', 'date', 'text', 'doi'])
                self.page_hits = None
                self.num_docs = 0
                self.scroll_id = None
                self.scroll_size = None
                self.num_scroll = 0
                self.total_docs = 0
                self.taggedDoc=taggedDoc
                self.rand = rand
                
                if self.qry_obj != None:
                        self.th = TextHandler(self.qry_obj)
                        if 'rand' in self.qry_obj:
                                self.rand = self.qry_obj['rand']
                
                self.cleaned = cleaned
                if self.qry_obj != None:
                        self.total_hits = int(self.qry_obj.get('maximum_hits') if self.qry_obj.get('maximum_hits').isdigit() else ES_MAX_SIZE)
                        self.qry_obj['f_start'] = int(self.qry_obj['f_start']) if 'f_start' in qry_obj else -1
                        self.qry_obj['f_end'] = int(self.qry_obj['f_end']) if 'f_end' in qry_obj else -1
                        self.qry_obj['min_occurrence'] = int(self.qry_obj['min_occurrence']) if 'min_occurrence' in qry_obj else -1
                        self.qry_obj['max_occurrence'] = int(self.qry_obj['max_occurrence']) if 'max_occurrence' in qry_obj else -1
                else:
                        self.qry_obj = None

                        

        def __iter__(self):
                return self
        def _stop_and_reset(self):
                self.scroll_id = None
                self.num_docs = 0
                self.page_hits = None
                self.scroll_size = None
                self.num_scroll = 0
                self.total_docs = 0

        def __next__(self):
                if self.page_hits == None:
                        self.do_search()
                if self.total_docs >= self.total_hits or self.total_docs >= MAX_NUM_DOC_VIS[self.database]:
                        self._stop_and_reset()
                        raise StopIteration
                if self.scroll_size < 1000 and self.num_docs >= self.scroll_size:
                        self._stop_and_reset()
                        raise StopIteration
                if self.num_docs >= self.scroll_size:
                        self.do_search()
                retdoc = self._process_hit(self.page_hits[self.num_docs])
                self.num_docs += 1
                self.total_docs += 1

                
                if self._sub_dates(retdoc) == False:
                        return self.__next__()
                elif self._min_count(retdoc) == False:
                        return self.__next__()
                else:
                        if self.cleaned:
                                final_doc = None
                                if self.cm == None:
                                        final_doc = self.th.clean_text(retdoc)
                                else:
                                        final_doc =  self.cm._clean_text(retdoc)
                                #for doc2vec iter
                                if self.taggedDoc:
                                        final_doc = TaggedDocument(final_doc, [self.total_docs])
                                return final_doc


                        elif self.tokenized:
                                return self.cm.doc2bow(retdoc)
                        else:
                                return retdoc

        def get_doc(self, doc_id):
                doc = {
                        "query": {
                                "term": {
                                        ES_FIELDS['id'][self.database]: str(doc_id)
                                }
                        }
                }
                es_qry = self.es.search(index=self.es_index, doc_type='document', body=doc)
                hits = es_qry['hits']['hits']
                return self._process_hit(hits[0])

        def _process_hit(self, hit):
                source= hit["_source"]
                doc_id = source[ES_FIELDS['id'][self.database]]
                full_text = source.get(ES_FIELDS['full_text'][self.database])

                article_title = source[ES_FIELDS['doc_title'][self.database]] if ES_FIELDS['doc_title'][self.database] in source else ''
                journal_title = source[u'JournalTitle'] if 'JournalTitle' in source else ''
                date = source.get(ES_FIELDS['date'][self.database]) if ES_FIELDS['date'][self.database] in source else ''
                doi = source["doi"] if "doi" in source else ""
                authors = []
                if self.database in ES_FIELDS['author']:
                        if ES_FIELDS['author'][self.database] in source:
                                authors = source[ES_FIELDS['author'][self.database]]
                                if isinstance(authors, list):
                                        authors=authors
                                else:
                                        if authors == None:
                                                authors = ""
                                        else:
                                                authors = authors.split(';')

                return self.esDoc(
                        doc_id=doc_id,
                        journal_title=journal_title,
                        article_title=article_title,
                        authors=authors,
                        text=full_text,
                        date=date,
                        doi=doi
                )
        def _sub_dates(self, doc):
                if self.qry_obj['f_start'] == -1:
                        return True
                if doc.date == None:
                        return False
                doc_year = int(doc.date.split('-')[0])
                if doc_year > self.qry_obj['f_start'] and doc_year < self.qry_obj['f_end']:
                        return True
                return False

        def _min_count(self, doc):
                terms = self.qry_obj['qry'].replace("+", " ").split(" ")
                terms_count = get_min_term_occurrence(terms, doc.text) if doc.text != None else 0
                if self.qry_obj == None:
                        return terms_count
                if self.qry_obj['min_occurrence'] == -1:
                        return terms_count
                else:
                        if terms_count >= self.qry_obj['min_occurrence'] and terms_count <= self.qry_obj['max_occurrence']:
                                return terms_count
                        else:
                                return False

        def format_qry(self):
                print(self.qry_obj)
                qry = self.qry_obj['qry'].replace('+', ' ')
                start = self.qry_obj['start'] if self.qry_obj['start'].split("-")[0].isdigit() else None
                end = self.qry_obj['end'] if self.qry_obj['end'].split("-")[0].isdigit() else None
                min_care_rating = self.qry_obj.get('min_care_rating')
                jurisdiction = self.qry_obj.get('jurisdiction')
                auth_qry = self.qry_obj.get('auth_s')
                family_keyword = self.qry_obj.get('family') if self.qry_obj.get('family') != 'both' else None
                journal = self.qry_obj.get('journal')

                dump_corpus = False
                time_range = {}
                must_terms = []
                if len(qry) != 0:
                        must_terms.append({
                  "query_string": {
                        "default_field" : ES_FIELDS['full_text'][self.database],
                        "query": qry
                  }
                })
                elif auth_qry != None and len(auth_qry) != 0:
                        must_terms.append({
                          "query_string": {
                                "default_field" : 'authors',
                                "query": auth_qry
                          }
                })


                if start:
                        if len(start.split('-')) == 3:
                                time_range['gte'] = '{}'.format(start)
                        else:
                                time_range['gte'] = '{}-01-01'.format(start)
                if end:
                        if len(end.split('-')) == 3:
                                time_range['lte'] = '{}'.format(end)
                        else:
                                time_range['lte'] = '{}-12-31'.format(end)
                if time_range:
                        must_terms.append({
                           'range': {
                                   ES_FIELDS['date'][self.database]: time_range
                           }
                        })
                must_not_terms = []
                if jurisdiction:
                        if jurisdiction == 'federal':
                                must_terms.append({
                                        'term': {'Jurisdiction': 'United States'}
                                })
                        elif jurisdiction == 'other':
                                must_not_terms.append({
                                        'term': {'Jurisdiction': 'United States'}
                                })
                if min_care_rating and min_care_rating != '-1':
                        must_terms.append({'term' : {'reviewRating' : min_care_rating}})
                if journal and journal != 'all':
                        must_terms.append({'term': {'JournalTitle': journal}})
                if family_keyword:
                        if family_keyword == 'false':
                                must_terms.append({
                                        'term': {'keyword': 'FALSE'}
                                })
                        elif family_keyword == 'true':
                                must_terms.append({
                                        'term': {'keyword': 'TRUE'}
                                })
                bool_terms = {}
                if must_terms:
                        bool_terms['must'] = must_terms
                if must_not_terms:
                        bool_terms['must_not'] = must_not_terms
                if bool_terms:
                        query = {'bool': bool_terms}
                else:
                        query = {'match_all': {}}

                if self.rand:
                        #query = {'function_score' : { "query" : query}, "random_score" : {}}
                        query = {"function_score": {
                                "query": query,
                                "random_score": {"seed": 10, "field": ES_FIELDS['id'][self.database]},
                                }}
                print(query)
                return query

        def do_search(self):
                database = self.qry_obj['database']
                print(self.total_hits)
                _max_hits = ES_SCROLL_SIZE
                self.num_docs = 0
                query = self.format_qry()
                doc = {'size': _max_hits,'query': query}
                print('search query', doc)
                if self.total_hits < _max_hits:
                        doc = {'size': self.total_hits,'query': query}
                        es_qry = self.es.search(index=self.es_index, doc_type='document', body=doc)
                        self.page_hits = es_qry['hits']['hits']        
                        self.scroll_size = len(self.page_hits)        
                else:
                        if self.scroll_id == None:
                                es_qry = self.es.search(index=self.es_index, scroll='5m', doc_type='document', body=doc)
                                self.page_hits = es_qry['hits']['hits']

                                self.scroll_id = es_qry['_scroll_id']
                                self.scroll_size = len(es_qry['hits']['hits'])
                                self.num_scroll = 0
                        else:
                                es_qry = self.es.scroll(scroll_id=self.scroll_id, scroll='5m')
                                self.scroll_id = es_qry['_scroll_id']
                                self.scroll_size = len(es_qry['hits']['hits'])
                                print('scroll', self.num_scroll, self.scroll_size)
                                self.page_hits = es_qry['hits']['hits']
                                self.num_scroll += 1





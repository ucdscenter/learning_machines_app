import warnings
warnings.filterwarnings('ignore')
from gensim import models
from gensim.corpora import Dictionary
import json
import os
import re
import itertools
import gzip
from .es_search import SearchResults_ES


class DfrAdapter:
    def __init__(self):
        #self.output_dir = output_dir
        #self.input_dir = input_dir
        self.model = None
        self.num_topics = None
        self.dct = None
        self.qry_str = None


    def move_metadata(self):
        from shutil import copyfile
        if not os.path.exists(self.output_dir):
            os.mkdir(self.output_dir)
        output_path = os.path.join(self.output_dir, 'meta.csv')
        open(output_path, 'w')
        copyfile(os.path.join(self.input_dir, 'metadata.csv'), output_path)
        return

    def convert_metadata(self, search_rslt):
        os.mkdir(self.output_dir)
        ## The column names are DOI, title, authors, journal_title, volume, issue, pulication-date, page range
        output_path = os.path.join(self.output_dir, 'meta.csv')
        meta_str = ""
        with open(output_path, 'w') as f:
            for hit in search_rslt:
                title = hit['article_title']
                #year = hit['year']
                #year_str = '{}-06-01T00:00:00Z '.format(year)
                date = '{}T00:00:00Z'.format(hit['date']) if hit['date'] else ''
                journal = hit['journal_title']
                authors = hit['authors'] if hit['authors'] else 'NA'
                doi = hit['doi']
                volume = hit['volume']
                issue = hit['issue']
                pages = hit['pages']

                newrow = '"{DOI}","{title}","{authors}","{journal_title}","{volume}","{issue}","{date}","{page_range}","{fla}"\n'.format(
                    DOI=doi,
                    title=title,
                    authors=authors,
                    journal_title=journal,
                    volume=volume,
                    issue=issue,
                    date=date,
                    page_range=pages,
                    fla='fla'
                )
                meta_str = meta_str + newrow
        return meta_str


    def write_numerical_data(self, model, qry_str, dct):
        self.model = model
        self.qry_str = qry_str
        self.num_topics = qry_str["num_topics"]
        self.dct = dct

        if self.num_topics == 'automatic':
            print("CHANGING")
            self.num_topics = int(int(self.qry_str['maximum_hits']) / 10)
        else:
            self.num_topics = int(self.num_topics)
        tw = self.convert_tw()
        dt = self.convert_dt()
        info = self.write_info()
        return {
            "tw" : tw,
            "dt" : dt,
            "info" : info
        }

    def convert_tw(self):
        topics = self.model.print_topics(num_topics=self.num_topics, num_words=50)
        pattern = r'0.\d{3}\*"\w+"'
        topic_weight = []
        for topic in topics:
            topic_string = re.findall(pattern, topic[1])
            words = []
            weights = []
            for t in topic_string:
                word = t.split('"')[1]
                weight = round(float(t.split('*')[0]), 10)
                words.append(word)
                weights.append(weight)
            topic_weight.append({'words': words, 'weights': weights})
        alpha = list(self.model.alpha)
        ## TODO This is tricky. When x * 1, it's a json seriable number
        round_alpha = [x * 1 for x in alpha]
        tw = {'alpha': round_alpha, 'tw': topic_weight}
        
        return json.dumps(tw)

    def convert_dt(self):
        corpus = SearchResults_ES(database=self.qry_str['database'], dictionary=self.dct, qry_obj=self.qry_str, tokenized=True)
        i = [[] for k in range(self.num_topics)] #doc_idx
        x = [[] for k in range(self.num_topics)] #weights
        for doc_idx, bow in enumerate(corpus):
            weights = self.model.get_document_topics(bow)
            for weight in weights:
                i[weight[0]].append(doc_idx)
                #x[weight[0]].append(format(weight[1], '.3f'))
                ## TODO This weights times 10000 because weights in dt can only be integer
                ## TODO This should be number of tokens, try if we can get it from somewhere else
                x[weight[0]].append(int(weight[1] * 10000))
        p_len = [0] + [len(item) for item in i]
        p = [sum(p_len[: k + 1]) for k in range(len(p_len))]
        dt = {'p': p,
              'i': list(itertools.chain(*i)),
              'x': list(itertools.chain(*x))
              }
       
        return json.dumps(dt)

    def write_info(self):
        info = {
            "title": "Topics for : " + self.qry_str['qry'],
            "meta_info": "This site is the working demo for <a href=\"http://agoldst.github.io/dfr-browser\">dfr-browser</a>, a browsing interface for topic models of journal articles or other text.",
            "VIS": {
                "condition": {
                    "type": "time",
                    "spec": {
                        "unit": "year",
                        "n": 1
                    }
                },
                "bib_sort": {
                    "major": "year",
                    "minor": "alpha"
                },
                "model_view": {
                    "plot": {
                        "words": 6,
                        "size_range": [6, 14]
                    }
                }
            }
        }
        return json.dumps(info)

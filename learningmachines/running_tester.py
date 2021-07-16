import os
from searcher.es_search import SearchResults_ES
from searcher.corpus_manager import CorpusManager
#from searcher.models import QueryRequest, VisRequest
#from searcher.query_handler import QueryHandler
from searcher.corpus_manager import CorpusManager
from searcher.nlp_model_manager import NLPModelManager
from searcher.formatted_data_manager import FormattedDataManager
import json


def test_es_search(qry_str):
	e = SearchResults_ES(qry_str['database'], qry_str, cleaned=False, rand=False)
	x = 0
	docs = []
	for doc in e:
		print(doc)
		x += 1
		docs.append(doc)

	print(x)
	#print("THROUGH ONCE")
	#for doc in e:
	#	print(doc)
	json.dump(docs, open('mayerson_docs.json', 'w'))
	return

def test_ngrams(qry_str):
	cm = CorpusManager(qry_str)
	cm.create_ngrams(n=3)
	dct = cm.create_dict()
	"""for x in dct.keys():
			print(x)
			print(dct[x])
	"""
	e = SearchResults_ES(qry_str['database'], qry_str, cleaned=True)

	for doc in e:
		bow = dct.doc2bow(cm.trigram_model[cm.bigram_model[doc]])
		rehydrated = [dct[x[0]] for x in bow]
		print(rehydrated)

	return

def test_cleaning(qry_str):
	from searcher.pre_processing import TextHandler

	e = SearchResults_ES(qry_str['database'], qry_str)
	th = TextHandler(qry_str)
	for doc in e:
		print(doc)
		print(th.clean_text(doc))


def test_run_model(qry_str):
	#qh = QueryHandler(q_pk=q_pk)
	qh = None
	q_pk = None
	#r = qh.update_status("Fetching Documents")
	r = "SOMETHING"
	if r == "Cancelled":
		return "CANCEL"
	
	#r = qh.update_status("Learning Ngrams")
	if r == "Cancelled":
		return "CANCEL"
	corpus_manager = CorpusManager(qry_str)
	corpus_manager.create_ngrams()

	#r = qh.update_status("Creating Dictionary")
	if r == "Cancelled":
		return "CANCEL"	
	corpus_manager.create_dict()
	#r = qh.update_status("Running Model")
	if r == "Cancelled":
		return "CANCEL"
	nlp_model_manager = NLPModelManager(qry_str, cm=corpus_manager, q_pk=q_pk, qh=qh)
	model = nlp_model_manager.create_model()
	print("MODEL")
	print(model)
	#r = qh.update_status("Formatting Data")
	if r == "Cancelled":
		return "CANCEL"
	formatted_manager = FormattedDataManager(qry_str, cm=corpus_manager, q_pk=q_pk, qh=qh, model=model)
	formatted_manager.create_data()
	#r = qh.update_status("Uploading Data")
	if r == "Cancelled":
		return "CANCEL"
	"""formatted_manager.upload_data()
	r = qh.update_status("Finished", finished=True)
	if r == "Cancelled":
		return "CANCEL!"
	"""
	return 



if __name__ == '__main__':
	test_qry_obj = {'start': 'year', 'end': 'year', 'f_start': '-1', 'f_end': '-1', 'qry': '', 'maximum_hits': '1000', 'method': 'multilevel_lda', 'stop_words': '', 'replacement': '', 'phrases': '', 'level_select': 'article', 'num_topics': 10, 'passes': '20', 'database': '', 'journal': 'all', 'jurisdiction_select': 'all', 'auth_s': '', 'family_select': 'both', 'min_occurrence': '-1', 'max_occurrence': '-1', 'doc_count': '500', 'ngrams' : False, 'model_name' : 'test'}

	#test_qry_obj = {'start': 'year', 'end': 'year', 'f_start': '-1', 'f_end': '-1', 'qry': 'restaurant', 'ngrams': True, 'tfidf': False, 'maximum_hits': '100', 'method': 'DFR browser', 'stop_words': 'restaurant, restaurants', 'replacement': '', 'phrases': 'multivariate analyses, catered event', 'level_select': 'article', 'num_topics': '20', 'passes': '20', 'database': 'Pubmed', 'journal': 'all', 'jurisdiction_select': 'all', 'auth_s': '', 'family_select': 'both', 'min_occurrence': '-1', 'max_occurrence': '-1', 'doc_count': '100'}
	"""test_qry_obj = {'start': 'year', 'end': 'year', 'f_start': '-1', 'f_end': '-1', 'qry': 'restaurant', 'ngrams': True, 'tfidf': False, 'maximum_hits': '100', 'method': 'DFR browser', 'stop_words': '', 'replacement': '', 'phrases': '', 'level_select': 'article', 'num_topics': '20', 'passes': '20', 'database': 'Pubmed', 'journal': 'all', 'jurisdiction_select': 'all', 'auth_s': '', 'family_select': 'both', 'min_occurrence': '-1', 'max_occurrence': '-1', 'doc_count': '100'}
	"""
	test_es_search(test_qry_obj)
	#test_run_model(test_qry_obj)

	#test_cleaning(test_qry_obj) 
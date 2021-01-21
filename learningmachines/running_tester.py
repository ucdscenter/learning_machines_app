import os
from searcher.es_search import SearchResults_ES
from searcher.corpus_manager import CorpusManager




def test_es_search(qry_str):
	print(os.getcwd())
	
	e = SearchResults_ES(qry_str['database'], qry_str, cleaned=True)
	for doc in e:
		print(doc)
	print("THROUGH ONCE")
	for doc in e:
		print(doc)
	print("THROUGH TWICE")
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

if __name__ == '__main__':
	test_qry_obj = {'start': '1809', 'end': '2017', 'f_start': '-1', 'f_end': '-1', 'qry': 'apple', 'maximum_hits': '500', 'method': 'multilevel_lda', 'stop_words': '', 'replacement': '', 'phrases': '', 'level_select': 'article', 'num_topics': 'automatic', 'passes': '20', 'database': 'Pubmed', 'journal': 'all', 'jurisdiction_select': 'all', 'auth_s': '', 'family_select': 'both', 'min_occurrence': '-1', 'max_occurrence': '-1', 'doc_count': '500'}
	test_qry_obj = {'start': 'year', 'end': 'year', 'f_start': '-1', 'f_end': '-1', 'qry': 'restaurant', 'ngrams': True, 'tfidf': False, 'maximum_hits': '100', 'method': 'DFR browser', 'stop_words': 'restaurant, restaurants', 'replacement': '', 'phrases': 'multivariate analyses, catered event', 'level_select': 'article', 'num_topics': '20', 'passes': '20', 'database': 'Pubmed', 'journal': 'all', 'jurisdiction_select': 'all', 'auth_s': '', 'family_select': 'both', 'min_occurrence': '-1', 'max_occurrence': '-1', 'doc_count': '100'}

	"""test_qry_obj = {'start': 'year', 'end': 'year', 'f_start': '-1', 'f_end': '-1', 'qry': 'restaurant', 'ngrams': True, 'tfidf': False, 'maximum_hits': '100', 'method': 'DFR browser', 'stop_words': '', 'replacement': '', 'phrases': '', 'level_select': 'article', 'num_topics': '20', 'passes': '20', 'database': 'Pubmed', 'journal': 'all', 'jurisdiction_select': 'all', 'auth_s': '', 'family_select': 'both', 'min_occurrence': '-1', 'max_occurrence': '-1', 'doc_count': '100'}
	"""



	test_cleaning(test_qry_obj) 

import logging
import random

from django.conf import settings
from learningmachines.celery import app as celery_app
from celery import shared_task, chain
from .es_search import SearchResults_ES
from .models import QueryRequest, VisRequest
from .query_handler import QueryHandler
from .corpus_manager import CorpusManager
from .nlp_model_manager import NLPModelManager
from .formatted_data_manager import FormattedDataManager


@celery_app.task(bind=True, name='searcher.tasks.run_model', max_retries=3)
def run_model(self, qry_str, q_pk=None):
	qh = QueryHandler(q_pk=q_pk)
	r = qh.update_status("Fetching Documents")
	if r == "Cancelled":
		return "CANCEL"
	
	r = qh.update_status("Learning Ngrams")
	if r == "Cancelled":
		return "CANCEL"
	corpus_manager = CorpusManager(qry_str)
	corpus_manager.create_trigrams()

	r = qh.update_status("Creating Dictionary")
	if r == "Cancelled":
		return "CANCEL"

	
	learned_dict = corpus_manager.create_dict()
	"""
	r = qh.update_status("Running Model")
	if r == "Cancelled":
		return "CANCEL"
	nlp_model_manager = NLPModelManager(qry_str, dct=learned_dict, q_pk=q_pk, qh=qh)
	model = nlp_model_manager.create_model()
	print("MODEL")
	print(model)
	r = qh.update_status("Formatting Data")
	if r == "Cancelled":
		return "CANCEL"
	formatted_manager = FormattedDataManager(qry_str, dct=learned_dict, q_pk=q_pk, qh=qh, model=model)
	formatted_manager.create_data()
	r = qh.update_status("Uploading Data")
	if r == "Cancelled":
		return "CANCEL"
	formatted_manager.upload_data()
	r = qh.update_status("Finished", finished=True)
	if r == "Cancelled":
		return "CANCEL!"
	"""
	return

@celery_app.task(bind=True, name='searcher.tasks.get_docs', max_retries=3)
def get_docs(self, qry_str, q_pk=None):
	from .pre_processing import get_min_term_occurrence
	print(qry_str)
	print(q_pk)

	qh = QueryHandler(q_pk=q_pk)
	#self.update_state(state="Started", meta={'progress' : 1})

	r = qh.update_status("Fetching Documents")
	if r == "Cancelled":
		return "CANCEL"
	es = SearchResults_ES(database=qry_str['database'], qry_obj=qry_str)
	rslt_json = []
	terms = qry_str['qry'].replace("+", " ").split(" ")
	count = 0
	for doc in es:
		if doc.text:
			num_occur = es._min_count(doc.text)
		else:
			num_occur = 0
		doc_obj = {
			"id" : doc.doc_id,
			"journal_title" : doc.journal_title,
			"article_title" : doc.article_title,
			"authors" : doc.authors,
			"date" : doc.date,
			"min_term_occurrence" : num_occur
 		}
		rslt_json.append(doc_obj)
		count += 1
		r = qh.get_status()
		if r == "Cancelled":
			return "CANCEL"
	rslts = {
		'results': rslt_json,
		'info': {'rawHits': 0, 'totalHits': count}
	}
	r = qh.update_status("Finished", finished=True)
	if r == "Cancelled":
		return "CANCEL!"
	return rslts


@celery_app.task(bind=True, name='searcher.tasks.test_run_model', max_retries=3)
def test_run_model(self, qry_str):
	import time
	self.update_state(state="TASK STARTED", meta={'progress': 20})
	time.sleep(5)
	self.update_state(state="TASK ENDED", meta={'progress': 80})
	return -1



if __name__ == '__main__':
	test_qry_obj = {'start': '1809', 'end': '2017', 'f_start': '-1', 'f_end': '-1', 'qry': 'apple', 'maximum_hits': '500', 'method': 'multilevel_lda', 'stop_words': '', 'replacement': '', 'phrases': '', 'level_select': 'article', 'num_topics': 'automatic', 'passes': '20', 'database': 'Pubmed', 'journal': 'all', 'jurisdiction_select': 'all', 'auth_s': '', 'family_select': 'both', 'min_occurrence': '-1', 'max_occurrence': '-1', 'doc_count': '500'}

	run_model(test_qry_obj)



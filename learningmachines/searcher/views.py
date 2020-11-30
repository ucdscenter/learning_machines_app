from django.shortcuts import render

import json
import logging

from django.conf import settings
from django.http import HttpResponse, HttpRequest
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404, render

from .es_search import SearchResults_ES
from .query_handler import QueryHandler
from .decorators import access_required

from .models import Profile
from .models import QueryRequest, VisRequest, DocFilter
from celery.result import AsyncResult


def index(request):
	ctxt = {}
	return render(request, 'searcher/index.html', ctxt)

def home(request):
	ctxt = {}
	return render(request, 'searcher/home.html', ctxt)

@access_required('all')
def search_page(request):
	accesses = request.user.access_set.all()
	special_access = []
	for a in accesses:
		print(a)
		if a.endpoint == 'foster':
			special_access.append(0)
		if a.endpoint == 'med_apps':
			special_access.append(1)
	ctxt = {'special_access' : special_access}
	return render(request, 'searcher/search_template.html', ctxt)

@access_required('all')
def process_search(request):
	from .tasks import get_docs
	qry_str = {k: v[0] for k, v in dict(request.GET).items()}
	#task = get_docs.apply_async(args=[qry_str])
	#rslts = task.get()
	rslts = get_docs(qry_str)
	return HttpResponse(json.dumps(rslts), content_type="application/json")

@access_required('all')
def get_doc(request):
	qry_str = {k: v[0] for k, v in dict(request.GET).items()}
	es = SearchResults_ES(database=qry_str['database'])
	rslt = es.get_doc(qry_str['doc_id'])
	if rslt is None:
		return HttpResponse("Could not find doc", status=404)
	rslt_obj = {
		'data': rslt.text if rslt.text is not None else "",
		'summary' : {
			'journal_title'  : rslt.journal_title,
			'article_title'  : rslt.article_title,
			'year': rslt.date,
			'author' : ', '.join(rslt.authors),
			'n_sentences' : len(rslt.text.split('. ')),
		}
	}
	return HttpResponse(json.dumps(rslt_obj), content_type="application/json")

@access_required('all')
def show_models(request):
	from .params_helper import prepare_model_listing
	if request.user.is_anonymous:
		return redirect('/accounts/login/')

	user = request.user
	query_requests = QueryRequest.objects.filter(user=user).all()
	running_models = []
	saved_models = []
	recent_models = []
	#cancelled_models = []
	for q in query_requests:	
		vis_request = VisRequest.objects.get(query=q)
		if vis_request.status == 'Cancelled':
			recent_models.append(prepare_model_listing(vis_request, q))
		#	q.delete()
		elif not vis_request.is_finished:
			running_models.append(prepare_model_listing(vis_request, q))
		elif vis_request.is_saved:
			saved_models.append(prepare_model_listing(vis_request, q))
		else:
			recent_models.append(prepare_model_listing(vis_request, q))

		
	qry_str = {k: v[0] for k, v in dict(request.POST).items()}

	ctxt = { 'running_models' : running_models,
			'saved_models' : saved_models,
			'recent_models' : recent_models}

	ctxt = {"data" : json.dumps(ctxt)}
	return render(request, 'searcher/models.html', ctxt)

@access_required('all')
def start_model_run(request):
	from .tasks import run_model
	from .params_helper import random_string, get_now

	qry_str = {k: v[0] for k, v in dict(request.POST).items()}


	query_request = QueryRequest(
		query_str=qry_str['qry'],
		database=qry_str['database'],
		created_time = get_now(ret_string=False))

	if not request.user.is_anonymous:
		query_request.user = request.user

	doc_filter = DocFilter(
		method = qry_str['method'],
		min_occur = qry_str['min_occurrence'],
		max_occur = qry_str['max_occurrence'],
		stop_words = qry_str['stop_words'],
		orig_start_year = qry_str['start'],
		orig_end_year = qry_str['end'],
		start_year = qry_str['f_start'],
		end_year = qry_str['f_end'],
		doc_number = qry_str['doc_count'],
		max_hits = qry_str['maximum_hits'],
		level_select = qry_str['level_select'],
		passes = qry_str['passes'],
		phrases = qry_str['phrases'],
	  	replacement = qry_str['replacement'],
	  	num_topics = qry_str['num_topics'],
	  	#remove_digits = 
		#tfidf =
		#para_filter_terms = 
		auth_s = qry_str['auth_s'],
		ml_keywords = qry_str['family_select'],
		journal = qry_str['journal'],
		jurisdiction = qry_str['jurisdiction_select']
		)

	model_name = '{query}_{time}_{random_str}'.format(
					query=qry_str['qry'],
					time=get_now(),
					random_str=random_string())

	vis = VisRequest(
		model_name=model_name,
		method=qry_str['method'],
		query=query_request,
		docfilter=doc_filter,
		#task_id=task.id,
		)

	query_request.save()
	doc_filter.save()
	vis.save()
	qry_str["model_name"] = model_name
	
	print(query_request.pk)
	task = run_model.apply_async(args=[qry_str], kwargs={'q_pk' : query_request.pk})
	rsp_obj = { 
		"task_id" : task.id
	}
	#run_model(qry_str,q_pk=query_request.pk)
	#rsp_obj = { "hi" : "there"}
	return HttpResponse(json.dumps(rsp_obj))


def delete_query(request):
	q_pk = request.GET.get('q_pk')
	qh = QueryHandler(q_pk=q_pk)
	return HttpResponse(qh.delete_query(), status=200)

def save_query(request):
	q_pk = request.GET.get('q_pk')
	qh = QueryHandler(q_pk=q_pk)
	return HttpResponse(qh.save_query(), status=200)

def cancel_task(request):
	q_pk = request.GET.get('q_pk')
	qh = QueryHandler(q_pk=q_pk)
	return HttpResponse(qh.cancel_task(), status=200)


def poll_tasks(request):

	print(request.GET.get('q_pks'))

	return HttpResponse("Task_info", status=200)



import email
from django.shortcuts import render
from learningmachines.settings import EMAIL_HOST_USER
from django.core.mail import send_mail

import json
import logging

from django.conf import settings
from django.http import HttpResponse, HttpRequest
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import get_object_or_404, render

from .es_search import SearchResults_ES
from .query_handler import QueryHandler
from .decorators import access_required

from .models import Profile
from .models import QueryRequest, VisRequest, DocFilter, Annotation
from celery.result import AsyncResult
from learningmachines.cfg import TEMP_MODEL_FOLDER
import os

from django.views.decorators.clickjacking import xframe_options_exempt


# SEND_WORKER = True
SEND_WORKER = False

"""
'Med_Applications': 'family_medicine',
'Mayerson' : 'mayerson',
'Mayerson_qna' : 'mayerson_qna'
'foster': 'foster_care_note',
'foster_encounter': 'foster_care_encounter',
'CCHMC' : 'cchmc_notes',
"""

def permiss(doc_db, req):
	protected_list = ['Med_Applications', 'Mayerson', 'Mayerson_qna', 'foster', 'foster_encounter', 'CCHMC']
	allow_access = False
	if doc_db in protected_list:
		if req.user.is_anonymous:
			return allow_access
		accesses = req.user.access_set.all()
		special_access = []
		print(accesses)
		for a in accesses:
			print(a)
			if a.endpoint == 'foster':
				if doc_db == 'foster' or doc_db == 'foster_care_note':
					allow_access = True
			if a.endpoint == 'med_apps':
				if doc_db == 'Med_Applications' or doc_db == 'CCHMC':
					allow_access = True
			if a.endpoint == 'mayerson_transcripts':
				if doc_db == 'Mayerson' or doc_db == 'Mayerson_qna':
					allow_access = True
		return allow_access
	else:
		return True

def index(request, exception=None):
	ctxt = {}
	return render(request, 'searcher/index.html', ctxt)

def home(request):
	ctxt = {}
	return render(request, 'searcher/home.html', ctxt)

@xframe_options_exempt
def projects(request):
	from learningmachines.external_projects import PROJECTS

	project_name = request.GET.get('name')
	html = 'searcher/projects.html'
	if project_name == 'blm':
		thetype = request.GET.get('type')
		if thetype == 'basic-aug':	
			html = 'searcher/projects/blm-basic-stats-aug.html'
		if thetype == 'basic-novdec':
			html = 'searcher/projects/blm-basic-stats-nov-dec.html'
		if thetype == 'networks-aug' :
			html = 'searcher/projects/blm-all-vis-aug.html'
		if thetype == 'networks-novdec' :
			html = 'searcher/projects/blm-all-vis-nov-dec.html'
	if project_name == 'debates':
		html = 'searcher/projects/debates_paper.html'
	if project_name == 'dapl':
		html = 'searcher/projects/DAPL-vis-range.html'
	if project_name == 'library_docs':
		html = 'searcher/projects/library_docs.html'
	if project_name == 'insta_art':
		html = 'searcher/projects/insta_projector.html'
	if project_name == 'climate_maps':
		html = 'searcher/projects/climate_maps.html'
	if project_name == 'vent_notes':
		html = 'searcher/projects/vent_notes.html'

	return render(request, html, {'projects': PROJECTS})

def proxy_static(request):
	print(request)
	f = request.GET.get('f')
	if f[-2:] != 'js':
		return render(request, "searcher/error_page.html", ctxt)
	static_f = open('searcher/templates/searcher/' + f, 'r')
	return HttpResponse(static_f.read(), content_type="text/javascript")

@access_required('all')
def search_page(request):
	accesses = request.user.access_set.all()
	special_access = []
	for a in accesses:
		#special_access.append(str(a.endpoint))
		print(a)
		if a.endpoint == 'foster':
			special_access.append(0)
		if a.endpoint == 'med_apps':
			special_access.append(1)
		if a.endpoint == 'mayerson_transcripts':
			special_access.append(2)
			special_access.append(3)
	ctxt = {'special_access' : special_access}
	return render(request, 'searcher/search_template.html', ctxt)


def show_vis(request):
	ctxt = { "hi" : "there"}
	method = request.GET.get("method")
	print(method)
	if request.GET.get('model') != None and method == 'multilevel_lda':
		return render(request, "searcher/multi_vis_proj.html")
	html_path = "searcher/error_page.html"
	if method == "word2vec":
		html_path = 'searcher/2d_word2vec.html'
	if method == "doc2vec":
		html_path = 'searcher/2d_doc2vec.html'
	if method == 'pyLDAvis':
		html_path = 'searcher/pylda.html'
	if method == 'DFR browser':
		html_path = 'searcher/dfr_index.html'
	if method == 'multilevel_lda' or method == 'hdsr':
		html_path = 'searcher/hdsr_multi_vis_proj.html'
	if method == 'sentiment':
		html_path = 'searcher/sentiment.html'
	return render(request, html_path, ctxt)

@access_required('all')
def process_search(request):
	from .tasks import get_docs
	qry_str = {k: v[0] for k, v in dict(request.GET).items()}
	print(qry_str)
	#task = get_docs.apply_async(args=[qry_str])
	#rslts = task.get()
	rslts = get_docs(qry_str)
	return HttpResponse(json.dumps(rslts), content_type="application/json")


#@access_required('all')
def get_doc(request):
	qry_str = {k: v[0] for k, v in dict(request.GET).items()}
	if permiss(qry_str['database'], request) == False:
		return HttpResponse(json.dumps("No permissions"), status=403)

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
	from learningmachines.settings import DEBUG
	from datetime import datetime
	if request.user.is_anonymous:
		return redirect('/accounts/login/')

	user = request.user
	query_requests = QueryRequest.objects.filter(user=user).filter(created_time__gte='2021-05-30').all()#[:2]
	running_models = []
	saved_models = []
	recent_models = []
	#cancelled_models = []
	for q in query_requests:
		
		try:
			vis_request = VisRequest.objects.get(query=q)
		except:
			continue
		
		#for legacy handling, deals with visrequests that have no docfilter
		try:
			dfilter = vis_request.docfilter
			if vis_request.status == 'Cancelled':
				recent_models.append(prepare_model_listing(vis_request, q))
			#	q.delete()
			elif not vis_request.is_finished:
				running_models.append(prepare_model_listing(vis_request, q))
			elif vis_request.is_saved:
				saved_models.append(prepare_model_listing(vis_request, q))
			else:
				recent_models.append(prepare_model_listing(vis_request, q))
		except:
			continue
		
		
	qry_str = {k: v[0] for k, v in dict(request.POST).items()}

	ctxt = { 'running_models' : running_models,
			'saved_models' : saved_models,
			'recent_models' : recent_models,
			'development' : DEBUG}

	ctxt = {"data" : json.dumps(ctxt)}
	return render(request, 'searcher/models.html', ctxt)

@access_required('all')
def show_history(request):
	if request.user.is_anonymous:
		return redirect('/accounts/login/')
	user = request.user
	vis_requests = VisRequest.objects.filter(user=user).filter(created_time__lte='2021-06-01').all().order_by('-created_time')[:50]
	request_records = []
	for v in vis_requests:
		request_records.append({
		'query_id' : -1,
		'time' : v.created_time,
		'parameters' : '',
		'search_url' : '',
		'vis_requests' : [{
			'url' : v.url,
			'name' : v.url.split('?')[1].replace('%2C', ',').replace('+', ' ').replace('&', ' ')
		}]
		})
	
	html = 'searcher/history.html'
	return render(request, html, {'requests': request_records})

@access_required('all')
def start_model_run(request):
	from .tasks import run_model
	from .params_helper import random_string, get_now

	qry_str = {k: v[0] for k, v in dict(request.POST).items()}

	if qry_str['ngrams'] == 'true':
		qry_str['ngrams'] = True
	else:
		qry_str['ngrams'] = False
	if qry_str['tfidf'] == 'true':
		qry_str['tfidf'] = True
	else:
		qry_str['tfidf'] = False

	query_request = QueryRequest(
		query_str=qry_str['qry'],
		database=qry_str['database'],
		created_time = get_now(ret_string=False))
	if not request.user.is_anonymous:
		query_request.user = request.user

	print(qry_str)
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
	  	num_clusters = qry_str['num_clusters'],
	  	#remove_digits = 
		#tfidf =
		#para_filter_terms = 
		#ngrams = 
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
	if SEND_WORKER:
		task = run_model.apply_async(args=[qry_str], kwargs={'q_pk' : query_request.pk})
		rsp_obj = { 
					"task_id" : task.id
		}

	else:
		run_model(qry_str,q_pk=query_request.pk)


	rsp_obj = { "hi" : "there"}
	return HttpResponse(json.dumps(rsp_obj))


def load_formatted(request):
	from .s3_client import S3Client
	q_pk = request.GET.get('q_pk')
	modelname = request.GET.get('model')
	if modelname == 'undefined' or modelname == None:
		qh = QueryHandler(q_pk=q_pk)
		vis_request = VisRequest.objects.get(query=qh.q)
		print("DOC NUM")
		print(vis_request.docfilter.doc_number)
		model_display_info = {
			"corpus" : qh.q.database,
			"term" : qh.q.query_str,
			"docs" : vis_request.docfilter.doc_number,
			"stopwords" : vis_request.docfilter.stop_words,
			"ys" :  vis_request.docfilter.orig_start_year if vis_request.docfilter.orig_start_year != '-1' else 'Not set',
			"ye" : vis_request.docfilter.orig_end_year if vis_request.docfilter.orig_end_year != '-1' else 'Not set',
			"topics" : vis_request.docfilter.num_topics
		}
		modelname = vis_request.model_name.replace('*', '"')
		method = vis_request.method.replace(" ", "+");
	else:
		model_display_info = {}
		method = request.GET.get('method').replace(" ", "+");

	if method == 'hdsr':
		method = "multilevel_lda"
	f_file_name = method + "_formatted.json"
	print(method)
	f_path = os.path.join(modelname, f_file_name)
	model_dir = os.path.join(TEMP_MODEL_FOLDER, modelname)
	if 'corpus' in model_display_info:
		if permiss(model_display_info['corpus'], request) == False:
			return HttpResponse(json.dumps("No permissions"), status=403)
	s3 = S3Client()
	
	if s3.check_file_exists(os.path.join(f_path)):
		data_obj =  s3.read_fileobj(f_path)
		data_obj.set_socket_timeout(300)
		data_str = data_obj.read()
		data_obj.close()
		the_data = json.loads(data_str.decode('utf-8'))
		rsp_obj = {"model_info" : model_display_info, "data" : the_data, "meta": {"vis_request_id": vis_request.pk}}
		rsp_str = json.dumps(rsp_obj)
		return HttpResponse(rsp_str, content_type="application/json")
	else:
		return HttpResponse(json.dumps("No file"), status=400)
	rsp_obj = {"error" : "something went wrong"}
	return HttpResponse(json.dumps(rsp_obj), status=400)

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
	rsp = qh.cancel_task()
	print(rsp)
	return HttpResponse(rsp, status=200)


def poll_tasks(request):

	print(request.GET.get('q_pks'))

	return HttpResponse("Task_info", status=200)

def searcher(request):
	sub = forms.Searcher()
	if request.method == 'POST':
		sub = forms.Searcher(request.POST)
		subject = 'Reset your Password'
		message = 'Please follow the steps for reset your password'
		recepient = str(sub['Email'].value())
		send_mail(subject, 
			message, EMAIL_HOST_USER, [recepient], fail_silently = False)
		return render(request, 'searcher/success.html', {'recepient': recepient})
	return render(request, 'searcher/index2.html', {'form':sub})

def get_annotations(request):
	print(request)
	try:
		vis_request = request.GET.get('vis_request_id')
		print(vis_request)
		if not vis_request:
			return HttpResponse('Invalid request id', 400)
		#TODO: Populate activeTopic after storing in DB
		annotations = Annotation.objects.filter(vis_request = vis_request)

		if(annotations.count() == 0):
			return HttpResponse(status=404)

		response = { 'notes': [], 'activeTopic': ''}
		for annotation in annotations:
			formatted = {
				'nodes': annotation.nodes_and_edges['nodes'],
				'edges': annotation.nodes_and_edges['edges'],
				'labelPosition':{
									'x': annotation.label_position_x, 
									'y': annotation.label_position_y
								},
				'labelText': annotation.label_text,
				'labelColor': annotation.label_color,
				'labelId': annotation.note_id,
				'activeTopic': annotation.active_topic,
				'visRequest': annotation.vis_request.pk,
				'pk': annotation.pk,
				'canEdit': annotation.user == request.user or (annotation.user is not None and annotation.user.email == request.user.email)
			}
			response['notes'].append(formatted)

		return HttpResponse(json.dumps(response), status = 200, content_type="application/json")
	except Exception as e:
		print(e)
		return HttpResponse('Error while fetching annotations', status = 500)

def save_annotations(request):
	try:
		user = request.user
		print(request)
		#TODO: Validation
		pk = request.POST.get('pk')
		nodes = request.POST.getlist('nodes[]')
		edges = request.POST.getlist('edges[]')
		label_id = request.POST.get('labelId')
		label_position_x = float(request.POST.get('labelPosition[x]'))
		label_position_y = float(request.POST.get('labelPosition[y]'))
		label_text = request.POST.get('labelText')
		label_color = request.POST.get('labelColor')
		if(pk):
			annotation = Annotation.objects.get(pk = pk)
			if annotation.nodes_and_edges != dict(nodes = nodes, edges = edges): 
				annotation.nodes_and_edges = dict(nodes = nodes, edges = edges)
			if annotation.note_id  != label_id:
				annotation.note_id  = label_id
			if annotation.label_position_x != label_position_x:
				annotation.label_position_x = label_position_x
			if annotation.label_position_y != label_position_y:
				annotation.label_position_y = label_position_y
			if annotation.label_text != label_text:
				annotation.label_text = label_text
			if annotation.label_color != label_color:
				annotation.label_color = label_color
			annotation.user = user
			annotation.save()
			return HttpResponse(status = 200)
		else:
			annotation = Annotation(nodes_and_edges = dict(nodes = nodes, edges = edges), 
				note_id  = label_id,
				label_position_x = label_position_x,
				label_position_y = label_position_y,
				label_text = label_text,
				label_color = label_color,
				vis_request = VisRequest.objects.get(pk=request.POST.get('vis_request_id')),user = user)
			annotation.save()
			return HttpResponse(status = 201)
	except Exception as e:
		print(e)
		return HttpResponse('Error while saving annotations', status = 500)

def delete_annotation(request):
	try:
		vis_request_id = request.GET.get('vis_request_id')
		note_id = request.GET.get('note_id')

		if(vis_request_id == None or note_id == None):
			return HttpResponse(status = 404)

		annotation = Annotation.objects.get(vis_request = vis_request_id, note_id = note_id)
		annotation.delete()
		return HttpResponse(status = 200)
	except Annotation.DoesNotExist as e:
		print(e)
		return HttpResponse(status = 404)
	except Exception as e:
		print(e)
		return HttpResponse('Error while deleting annotations', 500)


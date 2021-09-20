""" 
from django.shortcuts import render_to_response
from whatever.models import whatever
from django.core.context_processors import csrf
from django.utils import timezone
from whatever.forms import WhateverForm
from django.http import HttpResponse, HttpResponseRedirect

def whatever(request):
	args = {}
	args.update(csrf(request))
	args['whatever'] = Whatever.objects.all()

	return render_to_response('index.html', args)

def add(request):
	if request.POST:
		form = WhateverForm(request.POST, request.FILES)
		if form.is_valid():
			form.save()
			return HttpResponseRedirect('/')
	else:
		form = WhateverForm()

	args = {}
	args.update(csrf(request))
	args['form'] = form
	return render_to_response('add.html', args) 
    """
from django.test import SimpleTestCase, Client
from django.urls import reverse
from searcher.models import Profile, Access, Request, QueryRequest, DocFilter, VisRequest
import json

class TestViews(SimpleTestCase):

	""" def setUp(self):
		self.client = Client()
		self.projects_url = reverse('projects')
		self.detail_url = reverse('detail', args=['project1'])

 """
	def test_projects_blm(self):
		client = Client()

		response = client.get(reverse('projects'))

		self.assertEquals(response.status_code, 200)
		self.assertTemplateUsed(response, 'searcher/projects.html')

	""" def test_proxy_static_JS(self):
		response = self.client.js(self.detail_url)

		self.assertEquals(response.status_code, 200)
		self.assertTemplateUsed(response, 'searcher/proxy_static.html')

 """


from django.http import HttpResponse
from django.shortcuts import render, redirect
import json
import re
import os
import sys

def get_page(request):
	if request.method == 'GET':
		print("request")
		print(request)
		html = 'debates_paper.html'
		return render(request, html, {})

def get_blm_page(request):
	if request.method == 'GET':
		print("request")
		thetype = request.GET.get('type')
		if thetype == 'basic-aug':	
			html = 'blm-basic-stats-aug.html'
		if thetype == 'basic-novdec':
			html = 'blm-basic-stats-nov-dec.html'
		if thetype == 'networks-aug' :
			html = 'blm-all-vis-aug.html'
		if thetype == 'networks-novdec' :
			html = 'blm-all-vis-nov-dec.html'

		return render(request, html, {})


def get_dapl_page(request):
	if request.method == 'GET':
		print(request)
		print('request')
		html = 'DAPL-vis-range.html'
		return render(request,html, {})
	
def get_library_auths(request):
	if request.method == 'GET':
		print(request)
		print('request')
		html = 'library_docs.html'
		return render(request,html, {})


def get_insta_art(request):
	if request.method == 'GET':
		print(request)
		print('request')
		html = 'insta_projector.html'
		return render(request, html, {})


def get_climate_maps(request):
	if request.method == 'GET':
		print(request)
		print('request')
		html = 'climate_maps.html'
		return render(request, html, {})



def get_vent_notes(request):
	if request.method == 'GET':
		print(request)
		html = 'vent_notes.html'
		return render(request, html, {})

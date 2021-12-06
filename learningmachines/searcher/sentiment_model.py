import pickle
import pandas as pd
#from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import requests
import json

SENTIMENT_URL = 'http://18.118.241.206:8080/sentiment'

class DummyPandasSeries:
	def __init__(self, dummy):
		self.data = dummy

	def tolist(self):
		return self.data

class SentimentModel:
	def __init__(self, trained_on=None):
		self.trained_on=trained_on
		self.model=None
		self.docs=None
		#self.clean_text=None
		self.cleaned_docs = []


	def convert_text(self, docs):
		for d in docs:
			for s in d.text.split(". "):
				self.cleaned_docs.append(s)

	def norm_score(self, doc_score):
		lower, upper = -1, 1
		l_norm =(doc_score['compound'] - lower)/(upper - lower)
		dd = DummyPandasSeries([l_norm, doc_score['compound']])
		return dd

	def predict(self, docs):
		self.convert_text(docs)


		self.predictions = []
		for cleaned_d in self.cleaned_docs:
			post_data = {'text_field' : cleaned_d}
			r = requests.post(SENTIMENT_URL, data=post_data)
			print(r.text)
			#self.predictions.append(self.norm_score(self.model.polarity_scores(cleaned_d)))
		return self.predictions
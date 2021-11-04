import pickle
import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


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

	def load_model(self):
		self.model = SentimentIntensityAnalyzer()
	def norm_score(self, doc_score):
		lower, upper = -1, 1
		l_norm =(doc_score['compound'] - lower)/(upper - lower)
		dd = DummyPandasSeries([l_norm, doc_score['compound']])
		return dd

	def predict(self, docs):
		self.convert_text(docs)
		self.load_model()
		self.predictions = []
		for cleaned_d in self.cleaned_docs:
			self.predictions.append(self.norm_score(self.model.polarity_scores(cleaned_d)))
		return self.predictions
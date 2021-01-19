from gensim.corpora import Dictionary
from .es_search import SearchResults_ES
import string
from .pre_processing import clean_text
from gensim.models import Phraser, Phrases
class CorpusManager:
	def __init__(self, qry_str, q_pk=None):
		self.qry_str = qry_str
		self.q_pk = q_pk
		self.ngrams_model = None
		self.rmchars = string.punctuation + "º"
		self.ngram_model = None

	def _clean_text(self, doc):
		return clean_text(doc)

	def create_dict(self, min_filter=1, max_filter=.7):
		es_iter = SearchResults_ES(database=self.qry_str['database'], qry_obj=self.qry_str)
		dct = Dictionary(documents=None, prune_at=1000000)
		
		for x in es_iter:
			if self.ngram_model != None:
				dct.add_documents([self.ngram_model[self._clean_text(x)]])
			else:
				dct.add_documents([self._clean_text(x)])

		dct.filter_extremes(no_below=min_filter, no_above=max_filter, keep_n=1000000)
		print(len(dct.keys()))
		print(self.qry_str)
		return dct

	def create_ngrams(self, n=2):
		es_iter = SearchResults_ES(database=self.qry_str['database'], qry_obj=self.qry_str, cleaned=True)
		bigram = Phrases(es_iter, min_count=1, threshold=1) # higher threshold fewer phrases.
		print("LEARNED BIGRAMS!!")
		if n > 2:
			trigram = Phrases(bigram[es_iter], threshold=100)
			self.ngram_model = Phraser(trigram)
		else:
			self.ngram_model = Phraser(bigram)

		for doc in es_iter:
			for phrase, score in self.ngram_model.export_phrases([doc]):
				print(phrase)
				print(score)
		return -1

	
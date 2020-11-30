from gensim.corpora import Dictionary
from .es_search import SearchResults_ES
import string
from .pre_processing import clean_text

class CorpusManager:
	def __init__(self, qry_str, q_pk=None):
		self.qry_str = qry_str
		self.q_pk = q_pk
		self.ngrams_model = None
		self.rmchars = string.punctuation + "º"

	def _clean_text(self, doc):
		return clean_text(doc)

	def create_dict(self, min_filter=1, max_filter=.7):
		es_iter = SearchResults_ES(database=self.qry_str['database'], qry_obj=self.qry_str)
		dct = Dictionary(documents=None, prune_at=1000000)
		
		for x in es_iter:
			dct.add_documents([self._clean_text(x)])

		dct.filter_extremes(no_below=min_filter, no_above=max_filter, keep_n=1000000)
		print(len(dct.keys()))
		print(self.qry_str)
		return dct

	def learn_ngrams(self, ngrams):
		return -1

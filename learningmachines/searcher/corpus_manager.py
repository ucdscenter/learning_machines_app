from gensim.corpora import Dictionary
from .es_search import SearchResults_ES
import string
from .pre_processing import TextHandler
from gensim.models.phrases import Phraser, Phrases

class CorpusManager:
	def __init__(self, qry_str, q_pk=None, query_handler=None):
		self.qry_str = qry_str
		self.q_pk = q_pk
		self.ngrams_model = None
		self.rmchars = string.punctuation + "º"
		self.bigram_model = None
		self.trigram_model = None
		self.dct = None
		self.th = TextHandler(self.qry_str)
		self.query_handler = query_handler
		

	def _clean_text(self, doc):
		if self.bigram_model != None:
			if self.trigram_model != None:
				return self.trigram_model[self.bigram_model[self.th.clean_text(doc)]]
			else:
				return self.bigram_model[self.th.clean_text(doc)]
		else:	
			return self.th.clean_text(doc)
		return self.th.clean_text(doc)
	
	def doc2bow(self, doc):
		return self.dct.doc2bow(self._clean_text(doc))

	def create_dict(self, min_filter=1, max_filter=.7):
		es_iter = SearchResults_ES(database=self.qry_str['database'], qry_obj=self.qry_str)
		dct = Dictionary(documents=None, prune_at=200000)
		iter_count = 0
		for x in es_iter:
			dct.add_documents([self._clean_text(x)])
			if self.query_handler != None:
				if iter_count % 1000 == 0:
					if self.query_handler.get_status() == "Cancelled":
						return
			iter_count += 1

		dct.filter_extremes(no_below=min_filter, no_above=max_filter, keep_n=200000)
		print("dict length")
		print(len(dct.keys()))

		self.dct = dct

	def create_ngrams(self, n=3, show=False):
		if self.qry_str["ngrams"] == False:
			return
		es_iter = SearchResults_ES(database=self.qry_str['database'], qry_obj=self.qry_str, cleaned=True)
		bigram = Phrases(es_iter, min_count=1, threshold=100) # higher threshold fewer phrases.
		if n > 2:
			trigram = Phrases(bigram[es_iter], min_count=1, threshold=100)
			self.trigram_model = Phraser(trigram)
		self.bigram_model = Phraser(bigram)

		if show:
			for doc in es_iter:
				print(doc)
				for phrase, score in self.bigram_model.export_phrases([bigram[doc]]):
					print(phrase)
					print(score)
		return

	
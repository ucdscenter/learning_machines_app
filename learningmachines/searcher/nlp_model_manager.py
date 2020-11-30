import os
from gensim.models.callbacks import CallbackAny2Vec
from .es_search import SearchResults_ES
#from .s3_client import S3Client


"""{'start': '1809', 'end': '2017', 'f_start': '-1', 'f_end': '-1', 'qry': 'apple', 'maximum_hits': '500', 'method': 'DFR browser', 'stop_words': '', 'replacement': '', 'phrases': '', 'level_select': 'article', 'num_topics': 'automatic', 'passes': '20', 'database': 'Pubmed', 'journal': 'all', 'jurisdiction_select': 'all', 'auth_s': '', 'family_select': 'both', 'min_occurrence': '-1', 'max_occurrence': '-1', 'doc_count': '500', 'model_name': 'apple_2020-11-20-19-27-52_6JZVI9179R'}"""

"""
class EpochLogger(CallbackAny2Vec):
	def __init__(self, qh, num_passes=5):
		self.epoch = 0
		self.logger=None
		self.title=None
		self.qh = qh
		self.num_passes = num_passes
	def on_epoch_end(self, model):
		print(self.qh)
		self.epoch = self.epoch + 1
"""

class NLPModelManager:
	def __init__(self, qry_str, dct=None, q_pk=None, qh=None, save=False):
		self.qry_str = qry_str
		self.dct = dct
		self.q_pk = q_pk
		self.qh = qh
		self.model = None
		self.method = qry_str['method'] if qry_str['method'] is not 'hdsr' else 'multilevel_lda'
		self.save = save

	def create_model(self):
		print(self.qry_str)
		print(self.method)
		f_file_name = self.method + "_formatted.json"
		f_path = os.path.join(self.qry_str['model_name'], f_file_name)
		"""
		s3 = S3Client(AWS_PROFILE, S3_BUCKET)
		if s3.check_file_exists(os.path.join(f_path)):
			print(f_path)
			return(HttpResponse(json.dumps("File Exists")))
		"""
		if self.method == 'multilevel_lda':
			self.mlmom_run()
		if self.method == 'DFR+browser':
			self.dfr_run()
		if self.method == 'pyLDAvis':
			self.pylda_run()
		if self.method == 'word2vec':
			self.w2v_run()
		if self.method == 'doc2vec':
			self.d2v_run()
		return self.model

	def mlmom_run(self):
		return 
	def dfr_run(self):
		return 
	def pylda_run(self):
		return 
	def w2v_run(self, num_features=200, min_count=1, window=5, max_vocab=10000):
		from gensim.models import Word2Vec
		docs = SearchResults_ES(database=self.qry_str['database'], qry_obj=self.qry_str, cleaned=True)
		self.model = Word2Vec(
				docs,
				workers=1,
				size=num_features,
				min_count=min_count,
				max_final_vocab=max_vocab)
				#callbacks=callback)
		if self.save:
			self.dct.save('tempmodeldata/' + self.qry_str['model_name'] + "_w2v_dict")
			self.model.save('tempmodeldata/' + self.qry_str['model_name'] + "_w2v")
		return 
	def d2v_run(self):
		return 
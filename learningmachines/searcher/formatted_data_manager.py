import os
from gensim.models.callbacks import CallbackAny2Vec
from .es_search import SearchResults_ES
#from .s3_client import S3Client

class FormattedDataManager:
	def __init__(self, qry_str, dct=None, q_pk=None, qh=None, model=None):
		self.qry_str = qry_str
		self.dct = dct
		self.q_pk = q_pk
		self.qh = qh
		self.model = None
		self.method = qry_str['method'] if qry_str['method'] is not 'hdsr' else 'multilevel_lda'

	def create_data(self):
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

	def upload_data
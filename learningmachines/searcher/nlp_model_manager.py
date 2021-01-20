import os
from gensim.models.callbacks import CallbackAny2Vec
 
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from learningmachines.cfg import TEMP_MODEL_FOLDER
from .es_search import SearchResults_ES
#from .s3_client import S3Client


"""{'start': '1809', 'end': '2017', 'f_start': '-1', 'f_end': '-1', 'qry': 'apple', 'maximum_hits': '500', 'method': 'DFR browser', 'stop_words': '', 'replacement': '', 'phrases': '', 'level_select': 'article', 'num_topics': 'automatic', 'passes': '20', 'database': 'Pubmed', 'journal': 'all', 'jurisdiction_select': 'all', 'auth_s': '', 'family_select': 'both', 'min_occurrence': '-1', 'max_occurrence': '-1', 'doc_count': '500', 'model_name': 'apple_2020-11-20-19-27-52_6JZVI9179R'}"""

"""
TODO implement per-pass check on database to see if model status has been cancelled
class EpochLogger(CallbackAny2Vec):
	def __init__(self, qh, num_passes=2):
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
	def __init__(self, qry_str, cm=None, q_pk=None, qh=None, save=False):
		self.qry_str = qry_str
		self.cm = cm
		self.q_pk = q_pk
		self.qh = qh
		self.model = None
		self.method = qry_str['method'] if qry_str['method'] is not 'hdsr' else 'multilevel_lda'
		self.num_topics = qry_str['num_topics'] 
		self.save = save
		self.doc_count = 0

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
		if self.method == 'DFR browser':
			self.dfr_run()
		if self.method == 'pyLDAvis':
			self.pylda_run()
		if self.method == 'word2vec':
			self.w2v_run()
		if self.method == 'doc2vec':
			self.d2v_run()
		return self.model

	def mlmom_run(self):
		from gensim.models import LdaModel
		docs = SearchResults_ES(database=self.qry_str['database'], cm=self.cm, qry_obj=self.qry_str, tokenized=True)
		corpus_docs = []
		print("NUM TOPICS")
		print(self.num_topics)
		if self.num_topics == 'automatic':
			print("CHANGING")
			self.num_topics = int(self.qry_str['maximum_hits']) / 20
		for d in docs:
			corpus_docs.append(d)
		print(os.listdir("."))
		if os.path.exists(TEMP_MODEL_FOLDER + "/" + self.qry_str["model_name"]):
			return
		else:
			os.mkdir(TEMP_MODEL_FOLDER + "/" + self.qry_str["model_name"])
		for seed in range(0, 600, 100):
			self.model = LdaModel(corpus_docs, num_topics=self.num_topics, id2word=self.cm.dct, alpha='symmetric', passes=2, random_state=seed)
			self.model.save(TEMP_MODEL_FOLDER +'/' + self.qry_str['model_name'] +  "/model_" + str(seed))
		self.cm.dct.save(TEMP_MODEL_FOLDER +'/' + self.qry_str['model_name'] + "/lda_dict")
		self.model = None
		return 

	def taggedDocIter(self):
		print(self.qry_str)
		docs = SearchResults_ES(database=self.qry_str['database'], cm=self.cm, qry_obj=self.qry_str, cleaned=True)
		self.doc_count = 0
		for i, doc in enumerate(docs):
			self.doc_count += 1
			yield TaggedDocument(doc, [i])

	def dfr_run(self, seed=100):
		from gensim.models import LdaModel
		docs = SearchResults_ES(database=self.qry_str['database'], cm=self.cm, qry_obj=self.qry_str, tokenized=True)
		corpus_docs = []
		print("NUM TOPICS")
		print(self.num_topics)
		if self.num_topics == 'automatic':
			print("CHANGING")
			self.num_topics = int(self.qry_str['maximum_hits']) / 10
		for d in docs:
			corpus_docs.append(d)
		self.model = LdaModel(corpus_docs, num_topics=self.num_topics, id2word=self.cm.dct, alpha='symmetric', passes=2, random_state=seed)
		if self.save:
			self.cm.dct.save(TEMP_MODEL_FOLDER +'/' + self.qry_str['model_name'] + "_lda_dict")
			self.model.save(TEMP_MODEL_FOLDER +'/' + self.qry_str['model_name'] + "_pylda")
		return 
	
	def pylda_run(self, seed=100):
		from gensim.models import LdaModel
		docs = SearchResults_ES(database=self.qry_str['database'], cm=self.cm, qry_obj=self.qry_str, tokenized=True)
		corpus_docs = []
		print("NUM TOPICS")
		print(self.num_topics)
		if self.num_topics == 'automatic':
			print("CHANGING")
			self.num_topics = int(self.qry_str['maximum_hits']) / 10
		for d in docs:
			corpus_docs.append(d)
		self.model = LdaModel(corpus_docs, num_topics=self.num_topics, id2word=self.cm.dct, alpha='symmetric', passes=2, random_state=seed)
		if self.save:
			self.cm.dct.save(TEMP_MODEL_FOLDER +'/' + self.qry_str['model_name'] + "_lda_dict")
			self.model.save(TEMP_MODEL_FOLDER +'/' + self.qry_str['model_name'] + "_pylda")
		return 

	def w2v_run(self, num_features=200, min_count=1, window=5, max_vocab=10000):
		from gensim.models import Word2Vec
		docs = SearchResults_ES(database=self.qry_str['database'], cm=self.cm, qry_obj=self.qry_str, cleaned=True)
		self.model = Word2Vec(
				docs,
				workers=1,
				size=num_features,
				min_count=min_count,
				max_final_vocab=max_vocab)
				#callbacks=callback)
		if self.save:
			self.cm.dct.save(TEMP_MODEL_FOLDER +'/' + self.qry_str['model_name'] + "_w2v_dict")
			self.model.save(TEMP_MODEL_FOLDER +'/' + self.qry_str['model_name'] + "_w2v")
		return 

	def d2v_run(self, num_features=200, min_count=1, window=5, max_vocab=10000):
		tagged_docs = self.taggedDocIter()
		self.model = Doc2Vec(vector_size=num_features, window=window, min_count=min_count, epochs=20)
		total_count = self.doc_count
		self.model.build_vocab(self.taggedDocIter())
		self.model.train(self.taggedDocIter(), total_examples=self.model.corpus_count, epochs=self.model.epochs)
		if self.save:
			self.cm.dct.save(TEMP_MODEL_FOLDER +'/' + self.qry_str['model_name'] + "_d2v_dict")
			self.model.save(TEMP_MODEL_FOLDER +'/' + self.qry_str['model_name'] + "_d2vv")
		return 
	
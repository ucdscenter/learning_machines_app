import os
from gensim.models.callbacks import CallbackAny2Vec
from .es_search import SearchResults_ES
from sklearn.cluster import AffinityPropagation
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from .s3_client import S3Client
import numpy as np
import json

class FormattedDataManager:
	def __init__(self, qry_str, dct=None, q_pk=None, qh=None, model=None, save=False):
		self.qry_str = qry_str
		self.dct = dct
		self.q_pk = q_pk
		self.qh = qh
		self.model = model
		self.meta_str = ""
		self.method = qry_str['method'].replace(" ", "+") if qry_str['method'] is not 'hdsr' else 'multilevel_lda'
		self.formatted_data = None
		self.f_path = None

	def create_data(self):
		print(self.qry_str)
		print(self.method)
		f_file_name = self.method + "_formatted.json"
		self.f_path = os.path.join(self.qry_str['model_name'].replace('*', '"'), f_file_name)
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
		import pyLDAvis
		import pyLDAvis.gensim
		docs = SearchResults_ES(database=self.qry_str['database'], dictionary=self.dct, qry_obj=self.qry_str, tokenized=True)
		tokenized_corpus = []
		for d in docs:
			tokenized_corpus.append(d)
		ldavis_data = pyLDAvis.gensim.prepare(self.model, tokenized_corpus, self.dct)
		self.formatted_data = ldavis_data.to_json()
		"""
		def pyLDAvis_data(self, model_dir):
			import pyLDAvis
			method = 'pyLDAvis'
			modelname = model_dir
			f_file_name = method + "_formatted.json"
			f_path = os.path.join(modelname, f_file_name)
			lda_params = {
				'num_topics': -1,
				'passes': -1,
				'do_tfidf': False
			}
			if not model_dir:
				return HttpResponse(json.dumps({'error': 'Folder is empty'}), status=400)
			model_rslt = clusters_lda.load_lda_result(model_dir, lda_params=lda_params)
			lda_ctxt = model_rslt.model_ctxt
			ldavis_data = pyLDAvis.gensim.prepare(model_rslt.lda, lda_ctxt.corpus, lda_ctxt.dictionary)

			s3 = S3Client(AWS_PROFILE, S3_BUCKET)
			s3.upload_str(ldavis_data.to_json(), f_path)
			return 1
		"""
		return 

	def w2v_run(self, top_n=25):
		self.create_meta()
		word_top_docs = self._calc_word_docs()

		w_embs = np.zeros((1,1))
		index= 0
		for word_obj in self.model.wv.vocab:
			if index == 0:
				w_embs = np.zeros((len(self.model.wv.vocab), len(self.model.wv[word_obj])))
			w_embs[index] = self.model.wv[word_obj]
			index += 1
		
		normalized_embs = StandardScaler().fit_transform(w_embs)
		clustering = AffinityPropagation(random_state=0).fit(w_embs)
		pca_result = PCA(n_components=2)
	
		pca_result.fit(normalized_embs)
		pca_result = pca_result.transform(normalized_embs)
		emb_list = pca_result.tolist()

		data_dict = dict()
		index = 0

		for word_obj in self.model.wv.vocab:
			sims = self.model.wv.most_similar(word_obj, topn=top_n)
			sims_list = []
			for s in sims:
				sims_list.append([s[0], s[1]])
			proj = emb_list[index]
			count = self.model.wv.vocab[word_obj].count
			data_dict[word_obj] = {
				"proj" : proj,
				"sims" : sims,
				"count" : count,
				"cluster" : clustering.labels_[index].item()
			}
			index+=1
		w2v_data = {
			"dict_data" : data_dict,
			"metadata" : self.meta_str,
			"word_top_docs" : word_top_docs
		}
		self.formatted_data = w2v_data
		return

	def d2v_run(self):
		self.create_meta()
		doc_no = len(self.meta_str.split("\n")) - 1
		d_embs = np.zeros((1,1))
		for x in range(0, doc_no):
			if x == 0:
				d_embs = np.zeros((doc_no, len(self.model.docvecs[x])))
			d_embs[x] = self.model.docvecs[x]

		normalized_embs = StandardScaler().fit_transform(d_embs)
		clustering = AffinityPropagation(random_state=0).fit(d_embs)
		pca_result = PCA(n_components=2)
	
		pca_result.fit(normalized_embs)
		pca_result = pca_result.transform(normalized_embs)
		emb_list = pca_result.tolist()
		data_dict = dict()
		index = 0
		split_docs = SearchResults_ES(database=self.qry_str['database'], qry_obj=self.qry_str, cleaned=True)
		for doc in split_docs:
			#new_vec = self.model.infer_vector(doc)
			sims = self.model.docvecs.most_similar([index], topn=10)
			sims = sims[1:]
			sims_list = []
			for s in sims:
				sims_list.append([s[0].item(), s[1]])
			proj = emb_list[index]
			data_dict[index] = {
				"proj" : proj,
				"sims" : sims_list,
				"cluster" : clustering.labels_[index].item()
			}
			index+=1

		d2v_data = {
			"dict_data" : data_dict,
			"metadata" : self.meta_str,
			"word_top_docs" : []
		}
		self.formatted_data = d2v_data
		return 


	def create_meta(self):
		docs = SearchResults_ES(database=self.qry_str['database'], qry_obj=self.qry_str)
		for doc in docs:
			meta_row = '"{DOI}","{title}","{authors}","{journal_title}","{volume}","{issue}","{date}","{page_range}","{art_id}"\n'.format( DOI=doc.doi,
					title=doc.article_title,
					authors=doc.authors,
					journal_title=doc.journal_title,
					volume='',
					issue='',
					date=doc.date,
					page_range='',
					art_id=doc.doc_id)
			self.meta_str = self.meta_str + meta_row

	def _calc_word_docs(self, num_top_docs=10):
		import operator
		tokenized_docs = SearchResults_ES(database=self.qry_str['database'], qry_obj=self.qry_str, cleaned=True)
		res = {}
		word_docs_dict = {}
		doc_index = 0
		for word_idx, word in self.dct.items():
			res[word] = []
		for doc in tokenized_docs:
			doc_bow = self.dct.doc2bow(doc)
			for word_pair in doc_bow:
				res[self.dct[word_pair[0]]].append([doc_index, word_pair[1]])
			doc_index += 1
		for word_idx, word in self.dct.items():
			res[word] = list(map(lambda x: x[0], sorted(res[word], key=operator.itemgetter(1), reverse=True)[0:num_top_docs]))
		return res

	def upload_data(self):
		s3 = S3Client()
		s3.upload_str(json.dumps(self.formatted_data), self.f_path)
		return

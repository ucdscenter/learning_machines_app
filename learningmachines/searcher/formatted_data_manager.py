import os
from gensim.models.callbacks import CallbackAny2Vec
from .es_search import SearchResults_ES
from sklearn.cluster import AffinityPropagation, KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from .s3_client import S3Client
from learningmachines.cfg import TEMP_MODEL_FOLDER
import numpy as np
import json

class FormattedDataManager:
	def __init__(self, qry_str, cm=None, q_pk=None, qh=None, model=None, save=False):
		self.qry_str = qry_str
		self.cm = cm
		self.q_pk = q_pk
		self.qh = qh
		self.model = model
		self.meta_str = ""
		self.method = qry_str['method'].replace(" ", "+") if qry_str['method'] is not 'hdsr' else 'multilevel_lda'
		self.formatted_data = None
		self.f_path = None
		self.save = save

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
		if self.method == 'sentiment':
			self.sm_run()
		return self.model
	def rm_stored_folder(self):
		import shutil
		shutil.rmtree(TEMP_MODEL_FOLDER + "/" + self.qry_str["model_name"])
		return

	def mlmom_run(self):
		from .mlmom_adapter import MLMOMFormatter
		self.create_meta()
		mlformatter = MLMOMFormatter(self.qry_str, self.cm, qh=self.qh)
		mlformatter.create()
		if self.qh.get_status() == "Cancelled":
			return
		formatted_d = mlformatter.get_data()
		formatted_d["metadata"] = self.meta_str
		self.formatted_data = formatted_d
		if self.save == False:
			self.rm_stored_folder()
		return 

	def dfr_run(self):
		from gensim.models import LdaModel
		from .dfr_adapter import DfrAdapter
		self.create_meta()
		adapter = DfrAdapter()
		print(self.model)
		dfr_obj = adapter.write_numerical_data(self.model, self.qry_str, self.cm)
		dfr_data = {
			"info" : dfr_obj["info"],
			"dt" : dfr_obj["dt"],
			"tw" : dfr_obj["tw"],
			"meta" : self.meta_str
		}
		self.formatted_data = dfr_data
		return 

	def pylda_run(self):
		import pyLDAvis
		import pyLDAvis.gensim
		docs = SearchResults_ES(database=self.qry_str['database'], cm=self.cm, qry_obj=self.qry_str, tokenized=True)
		tokenized_corpus = []
		for d in docs:
			tokenized_corpus.append(d)
		
		if self.qh.get_status() == "Cancelled":
			return
		ldavis_data = pyLDAvis.gensim.prepare(self.model, tokenized_corpus, self.cm.dct)
		self.formatted_data = ldavis_data.to_json()
		return 

	def w2v_run(self, top_n=25):
		self.create_meta()
		if self.qh.get_status() == "Cancelled":
			return
		word_top_docs = self._calc_word_docs()

		w_embs = np.zeros((1,1))
		index= 0
		for word_obj in self.model.wv.index_to_key:
			print(word_obj)
			if index == 0:
				w_embs = np.zeros((len(self.model.wv.index_to_key), len(self.model.wv[word_obj])))
			w_embs[index] = self.model.wv[word_obj]
			index += 1
		if self.qh.get_status() == "Cancelled":
			return
		normalized_embs = StandardScaler().fit_transform(w_embs)
		#clustering = AffinityPropagation(random_state=0).fit(w_embs)
		clustering = KMeans(n_clusters=int(self.qry_str['num_clusters']), random_state=0).fit(w_embs)
		pca_result = PCA(n_components=2)
		if self.qh.get_status() == "Cancelled":
			return
		pca_result.fit(normalized_embs)
		pca_result = pca_result.transform(normalized_embs)
		emb_list = pca_result.tolist()

		data_dict = dict()
		index = 0
		for word_obj in self.model.wv.index_to_key:
			sims = self.model.wv.most_similar(word_obj, topn=top_n)
			sims_list = []
			for s in sims:
				sims_list.append([s[0], s[1]])
			proj = emb_list[index]
			count = 1 #self.model.wv[word_obj].count
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
		if self.qh.get_status() == "Cancelled":
			return
		doc_no = len(self.meta_str.split("\n")) - 1
		d_embs = np.zeros((1,1))
		for x in range(0, doc_no):
			if x == 0:
				d_embs = np.zeros((doc_no, len(self.model.docvecs[x])))
			d_embs[x] = self.model.dv[x]

		normalized_embs = StandardScaler().fit_transform(d_embs)
		#clustering = AffinityPropagation(random_state=0).fit(d_embs)
		clustering = KMeans(n_clusters=int(self.qry_str['num_clusters']), random_state=0).fit(d_embs)
		pca_result = PCA(n_components=2)
		if self.qh.get_status() == "Cancelled":
			return
		pca_result.fit(normalized_embs)
		pca_result = pca_result.transform(normalized_embs)
		emb_list = pca_result.tolist()
		data_dict = dict()
		index = 0
		split_docs = SearchResults_ES(database=self.qry_str['database'], cm=self.cm, qry_obj=self.qry_str, cleaned=True)
		if self.qh.get_status() == "Cancelled":
			return
		for doc in split_docs:
			#new_vec = self.model.infer_vector(doc)
			sims = self.model.docvecs.most_similar([index], topn=10)
			sims = sims[1:]
			sims_list = []
			for s in sims:
				sims_list.append([s[0], s[1]])
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

	def sm_run(self):
		docs = SearchResults_ES(database=self.qry_str['database'], cm=self.cm, qry_obj=self.qry_str, cleaned=False)
		predictions = self.model.predict(docs)

		sm_data = []
		for i, doc in enumerate(docs):
			#sm_data.append({ 'document': doc, 'pos': predictions[i][0],'neg': predictions[i][1] })
			sm_data.append({ 'document': doc, 'score': predictions[i].tolist() })
		self.formatted_data=sm_data
	
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
		for word_idx, word in self.cm.dct.items():
			res[word] = []
		for doc in tokenized_docs:
			doc_bow = self.cm.dct.doc2bow(doc)
			for word_pair in doc_bow:
				res[self.cm.dct[word_pair[0]]].append([doc_index, word_pair[1]])
			doc_index += 1
		for word_idx, word in self.cm.dct.items():
			res[word] = list(map(lambda x: x[0], sorted(res[word], key=operator.itemgetter(1), reverse=True)[0:num_top_docs]))
		return res

	def upload_data(self):
		s3 = S3Client()
		s3.upload_str(json.dumps(self.formatted_data), self.f_path)
		if self.save:
			if os.path.exists(TEMP_MODEL_FOLDER + "/" + self.qry_str["model_name"]):
				return
			else:
				os.mkdir(TEMP_MODEL_FOLDER + "/" + self.qry_str["model_name"])
			wf = open(TEMP_MODEL_FOLDER + "/" + self.f_path, "w")
			json.dump(self.formatted_data, wf)

		return

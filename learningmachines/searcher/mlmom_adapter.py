import pandas as pd
import json
import os
import sys
import bz2
import string
import gensim
from gensim.models import LdaModel
import datetime
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import Normalizer
import numpy as np
from .es_search import SearchResults_ES
from learningmachines.cfg import TEMP_MODEL_FOLDER

class MLMOMFormatter:
	def __init__(self, qry_str, cm=None, qh=None):
		self.qry_str = qry_str
		self.model_name = qry_str['model_name']
		self.num_topics = qry_str['num_topics']
		self.cm = cm
		self.qh = qh
		if self.num_topics == 'automatic':
			print("CHANGING")
			self.num_topics = int(int(self.qry_str['maximum_hits']) / 10)
		else:
			self.num_topics = int(self.num_topics)
		
		#initialize data
		self.formatted_m = []
		self.graph = {"nodes" : [], "links" : []}
		self.multi_data = None

	def get_data(self):
		return self.multi_data

	def create(self):

		save_fp = TEMP_MODEL_FOLDER + "/" + self.model_name + "/model_"
		for x in range(0, 600, 100):
			x1 = int(x / 100)
			model_info_json = {
				"name" : "m" + str(x1),
				"diffs" : []
				}
			lda1 = gensim.models.LdaModel.load(save_fp + str(x))

			for y in range(x, 600, 100):
				y1 = int(y / 100)
				lda2 = gensim.models.LdaModel.load(save_fp + str(y))
				mdiff, annotation = lda1.diff(lda2, distance='hellinger')
				model_info_json["diffs"].append({
						"name" : "m" + str(y1),
						"scores": mdiff.tolist()
					})
			topics = lda1.show_topics(num_topics = self.num_topics)
			t1_a = []
			for x in topics:
				try:
					t1_a.append((x[0].item(), x[1]))
				except:
					t1_a.append((x[0], x[1]))

			topic_weights = []
			for t in lda1.state.sstats:
				score = 0
				for w in t: 
					score = score + w
				topic_weights.append(score)
			model_info_json["topic_weights"] = topic_weights
			model_info_json["topics"] = t1_a
			model_info_json["level"] = '1'
			self.formatted_m.append(model_info_json)

		if self.qh.get_status() == "Cancelled":
			return

		doc_graphlinks = {}
		linksdict = {}
		model_index = 0

		corpus_iterator = SearchResults_ES(database=self.qry_str['database'], cm=self.cm, qry_obj=self.qry_str, tokenized=True)

		for x in range(0, 600, 100):
			save_fp = TEMP_MODEL_FOLDER + "/" + self.model_name + "/model_"
			lda1 = gensim.models.LdaModel.load(save_fp + str(x))
			doc_index = 0
			if self.qh.get_status() == "Cancelled":
				return
			
			for doc in corpus_iterator:
				topics_in_doc = lda1.get_document_topics(doc, minimum_probability=0.01)
				for t in topics_in_doc:
					model_topic_name = self.formatted_m[model_index]["name"] + ":" + str(t[0])
					if doc_index not in doc_graphlinks:
						doc_graphlinks[doc_index] = []

					doc_graphlinks[doc_index].append([model_topic_name, t[1]])
				doc_index+=1
			model_index += 1

		for x in doc_graphlinks:
			for i in range(0, len(doc_graphlinks[x]) - 1):
				mname = doc_graphlinks[x][i][0]
				for j in range(i + 1, len(doc_graphlinks[x])):
					dname = doc_graphlinks[x][j][0]

					linkname = mname + "&" + dname
					reverse_linkname = dname + "&" + mname
					if linkname in linksdict:
						linksdict[linkname]["weight"] += 1
						#linksdict[linkname]["docs"].append(x)
					elif reverse_linkname in linksdict:
						linksdict[reverse_linkname]["weight"] += 1
						#linksdict[reverse_linkname]["docs"].append(x)
					else:
						linksdict[linkname] = {
							"id" : linkname,
							"source" : mname,
							"target" : dname,
							"weight" : 1,
							#"docs" : [x]
						}
		self.graph["links"] = list(linksdict.values())
		base_nps = []
		for x in range(0, 600, 100):
			lda1 = gensim.models.LdaModel.load(save_fp + str(x))
			if x == 0:
				base_nps = lda1.get_topics()
			else:
				base_nps = np.concatenate((base_nps, lda1.get_topics()), axis=0)

		scaler = Normalizer()
		base_nps = scaler.fit_transform(base_nps)
		pca = PCA(n_components=2)
		pca_result = pca.fit_transform(base_nps)
		if self.qh.get_status() == "Cancelled":
			return

		#clustering = AffinityPropagation().fit(base_nps)
		clustering = KMeans(n_clusters=self.num_topics).fit(base_nps)
		if self.qh.get_status() == "Cancelled":
			return
		print("AP finished")
		data = []
		print_dict = dict()
		for t in clustering.labels_:
			print_dict[t] = []

		mcount = 0
		tcount = 0

		for x in range(0, 600, 100):
			
			lda1 = gensim.models.LdaModel.load(save_fp + str(x))
			if self.qh.get_status() == "Cancelled":
				return
			model_obj = {}
			corpus_obj = {}

			model_obj["level"] = 1
			model_obj["top_words"] = []
			model_obj["locations"] = []
			model_obj["clusters"] = []
			model_obj["topic_weights"] = []
			model_obj["docs"] = []

			topics = lda1.show_topics(num_topics=self.num_topics, num_words=10, formatted=True)
			for t in lda1.state.sstats:
				score = 0
				for w in t: 
					score = score + w
				model_obj["topic_weights"].append(score)


			for t in topics:
				model_obj["docs"].append([])
				model_obj["top_words"].append(t[1])
				print_dict[clustering.labels_[tcount]].append(t[1])
				model_obj["locations"].append([pca_result[tcount][0].item(), pca_result[tcount][1].item()])
				model_obj["clusters"].append(clustering.labels_[tcount].item())
				tcount += 1


			mcount += 1
			dcount = 0
			corpus_iterator = SearchResults_ES(database=self.qry_str['database'], cm=self.cm, qry_obj=self.qry_str, tokenized=True)
			for doc in corpus_iterator:

				doc_topics = lda1.get_document_topics(doc)
				for topic_score in doc_topics:
					if topic_score[1] > .3:
						model_obj["docs"][topic_score[0]].append([[dcount, -1], topic_score[1].item()])

				dcount += 1
			print(dcount)
			data.append(model_obj)

		multi_data = {
			"formatted" : self.graph,
			"formatted_proj" : data,
			"metadata" : ""
		}
		self.multi_data = multi_data


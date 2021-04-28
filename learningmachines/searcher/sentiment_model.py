import pickle
import pandas as pd
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Bidirectional, Flatten, GRU


class SentimentModel:

	def __init__(self, trained_on=None):
		self.trained_on=trained_on
		self.model=None
		self.docs=None
		#self.clean_text=None
		self.cleaned_docs = []

	def load_tokenizer(self):
		if self.trained_on=='reviews':
			f = open('searcher/trained_models/yelp_tokenizer_10000.pickle', 'rb')
			self.tokenizer=pickle.load(f)

	def clean_text(self, text):
		cleaned = text.replace("\\n", " ")
		cleaned = cleaned.replace("\'", "'")
		cleaned = cleaned.replace("\\r", " ")
		cleaned = cleaned.replace("\\""", " ")
		cleaned = ' '.join([x.strip() for x in cleaned.split()])
		return cleaned

	def convert_text_to_padded(self, docs):
		self.load_tokenizer()
		for text in docs:
			self.cleaned_docs.append(self.clean_text(text))
		#self.cleaned_docs=[self.clean_text(text) for text in docs]
		self.sequences=self.tokenizer.texts_to_sequences(self.cleaned_docs)
		self.padded=pad_sequences(self.sequences, maxlen=200)


	def load_model(self):
		if self.trained_on=='reviews':
			self.model=tf.keras.models.load_model('searcher/trained_models/yelp_lstm_128_embed_300.h5')

	def predict(self, docs):
		self.convert_text_to_padded(docs)
		self.load_model()
		print("padded", self.padded[0])

		print("sequences", self.sequences[0])
		self.predictions=self.model.predict(self.padded)
		return self.predictions 
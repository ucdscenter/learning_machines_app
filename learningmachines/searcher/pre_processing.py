from nltk.tokenize import RegexpTokenizer
from nltk.stem.porter import PorterStemmer
from nltk.corpus import stopwords
import itertools
import os
import collections
import json
import math
import re

## TODO move to config
MIN_SENTENCE_LETTER_COUNT = 10
MIN_PARAGRAPH_LETTER_COUNT = 10


import string

##TODO word replacement
class TextHandler:
    def __init__(self, qry_str):
        self.qry_str = qry_str
        self.rmchars = string.punctuation + "º"
        self.rmchars = self.rmchars.replace("_", "").replace("-", "").replace("%", "")
        self.rm_words = set(stopwords.words('english'))
        addit_stops = self.qry_str['stop_words'].split(",") if 'stop_words' in self.qry_str else []
        #addit_stops = [x.strip() for x in addit_stops] 
        #self.rm_words = self.rm_words + addit_stops
        addit_stops = [x.strip() for x in addit_stops]
        self.rm_words = list(self.rm_words) + addit_stops
        self.phrases = self.qry_str['phrases'].split(",") if 'phrases' in self.qry_str else []
        self.phrases = [x.strip() for x in self.phrases]

    def rm_stops(self, doc_text):
        ret_text = [x for x in doc_text if x not in self.rm_words and len(x) > 1]
        return ret_text

    def replace_phrases(self, doc_text):
        repl_str = doc_text
        for phrase in self.phrases:
            repl_phrase = phrase.replace(" ", "_")
            repl_str = repl_str.replace(phrase, repl_phrase)

        return repl_str
            
    def clean_text(self, doc, ngram=False):
        if self.phrases != [""]:
            doc_text = self.replace_phrases(doc.text)
        else:
            doc_text = doc.text
            if doc_text == None:
                doc_text = "" 
        split_text = doc_text.lower().translate(str.maketrans("", "", self.rmchars))
        split_text = split_text.replace("-", " ").split(" ") if doc_text != None else []

        if len(split_text) > 40000:
            split_text = split_text[0:40000]
        cleaned_text = self.rm_stops(split_text)
        return cleaned_text

def clean_text(doc):
    return doc.text.lower().translate(str.maketrans("", "", rmchars)).split(" ") if doc.text != None else []

def parse_terms(terms):
    joined = ' '.join(terms)
    joined = joined.replace("(", "")
    joined = joined.replace(")", "")
    simpleterms = joined.split('"')
    results = []
    for s in simpleterms:
        subs = s.split(' ')
        if 'AND' in subs or 'OR' in subs or 'NOT' in subs:
            for sbs in subs:
                st = sbs.strip()
                if st != 'AND' and st != 'OR' and st != 'NOT' and len(st) != 0:
                    results.append(st)
        else:
            results.append(s)
    results = [x for x in results if x != '']
    return results
    
def get_min_term_occurrence(terms, doc):
    the_terms = parse_terms(terms)
    import re
    count = 0
    if len(terms[0]) == 0:
        return len(doc.split())
    try:
        for term in the_terms:
            count += len(re.findall(term, doc.lower()))
        return count
        #return min([len(re.findall(term, doc.lower())) for term in the_terms])
    except:
        return count

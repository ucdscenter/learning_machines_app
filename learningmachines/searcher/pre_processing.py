from nltk.tokenize import RegexpTokenizer
from nltk.stem.porter import PorterStemmer
#from stop_words import get_stop_words
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

rmchars = string.punctuation + "º"
class TextHandler:
    def __init__(self, qry_str):
        self.qry_str = qry_str

    def rm_stops(self):
        return
        
def clean_text(doc):
    return doc.text.lower().translate(str.maketrans("", "", rmchars)).split(" ") if doc.text is not None else []


def tokenize(text):
    tokenizer = RegexpTokenizer(r'\w+')
    text = text.lower() if text else ''
    tokens = tokenizer.tokenize(text)
    return tokens


def tokenize_article_level(text, customized_stops=[]):
    if not len(customized_stops):
        return stemming(remove_stop_words(tokenize(text)))
    #stemmed_stops = stemming(customized_stops)
    stemmed_stops = customized_stops
    return stemming(remove_stop_words(tokenize(text), customized_stops=stemmed_stops))


def tokenize_sentence_level(text, customized_stops=[]):
    pattern = r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s'
    sentences = re.split(pattern, text)
    #stemmed_stops = stemming(customized_stops)
    stemmed_stops = customized_stops
    sentence_tokens = [stemming(remove_stop_words(tokenize(sentence), customized_stops=customized_stops)) for sentence in sentences
                       if len(sentence) >= MIN_SENTENCE_LETTER_COUNT]
    sentence_tokens = [remove_stop_words(sentence, customized_stops=stemmed_stops) for sentence in sentence_tokens]
    return sentence_tokens


def format_article_meta_indexes(texts):
    meta_indexes = []
    count = 0
    for x in texts:
        meta_indexes.append([count, -1])
        count += 1
    return meta_indexes


def format_para_meta_indexes(texts):
    meta_indexes = []
    pattern = r'\n'
    count = 0
    for i in texts:
        para_index = 0
        if i is not None:
            paragraphs = re.split(pattern, i)
            for p in paragraphs:
                meta_indexes.append([count, para_index])
                para_index+= 1
        else:
             meta_indexes.append([count, 0])
        count += 1

    return meta_indexes

def parse_logic_for_paragaph_filter(terms):
    #TODO
    """
    NEEDS TO BE EXTENDED PAST SIMPLE THINGS FOR LOGIC SAKE
    """
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
    results = [x for x in results if x is not '']
    return results


def tokenize_paragraph_level(text, customized_stops=[], filter_terms=None, counter=0):
    if filter_terms:
        real_terms = parse_logic_for_paragaph_filter(filter_terms)
    else:
        real_terms = [' ']
    if real_terms == []:
        real_terms = [' ']
    pattern = r'\n'
    if text is not None:
        paragraphs = re.split(pattern, text)
    else:
        paragraphs = ['']
    p_meta_is = []
    if real_terms:
        filtered = []
        for idx, paragraph in enumerate(paragraphs):
            has_terms = False
            for term in filter_terms:
                if re.search(term, paragraph):
                    has_terms = True
            if has_terms:
                p_meta_is.append([counter, idx])
                filtered.append(paragraph)
        paragraphs = filtered
    #stemmed_stops = stemming(customized_stops)
    stemmed_stops = customized_stops
    paragraph_tokens = [stemming(remove_stop_words(tokenize(paragraph.lower()), customized_stops=customized_stops)) for paragraph in paragraphs if len(paragraph) >= MIN_PARAGRAPH_LETTER_COUNT ]
    paragraph_tokens = [remove_stop_words(sentence, customized_stops=stemmed_stops) for sentence in paragraph_tokens]
    return [paragraph_tokens, p_meta_is]


def remove_stop_words(text, customized_stops=[]):
    stops = get_stop_words('en')
    tokens = [x for x in text if x and x not in stops and len(x) > 2 and x not in customized_stops]
    return tokens


def stemming(text):

    porter_stemmer = PorterStemmer()
    tokens = [porter_stemmer.stem(x) for x in text]
    return tokens


def remove_low_frequent_words(text, min_count):
    path = os.path.join(os.getcwd(), 'data', 'word_count.json')
    with open(path) as f:
        word_count = json.load(f)
    res = [w for w in text if word_count[w] >= min_count]
    return res


def get_tfidf_collections():
    path = os.path.join(os.getcwd(), 'data\Folger_txt')
    words = []
    docs = []
    for file_name in os.listdir(path):
        with open(os.path.join(path, file_name)) as f:
            text = f.read()
        doc_list = re.split(r'Scene [0-9]{1,2}', text)
        for doc in doc_list:
            if len(doc) > 100:
                doc = stemming(tokenize(doc))
                docs.append(doc)
        text = tokenize(text)
        text = stemming(text)
        for word in text:
            if word not in words:
                words.append(word)
    print(len(docs))
    idfs = {}
    for word in words:
        count = 0
        for doc in docs:
            if word in doc:
                count += 1
        idfs[word] = math.log(len(docs) / (count + 1))
    with open(os.path.join(os.getcwd(), 'data\word_idf.json'), 'w') as f:
        json.dump(idfs, f, indent=4)


def get_tfidf_words(doc, cutoff):
    if not os.path.isfile(os.path.join(os.getcwd(), 'data\word_idf.json')):
        print('Building word frequency library')
        get_tfidf_collections()
    with open(os.path.join(os.getcwd(), 'data\word_idf.json')) as f:
        idfs = json.load(f)
    words = collections.Counter(doc)
    max_f = max([words[x] for x in words])
    res = []
    tfidf_dict = {}
    for word in words:
        tf = 0.5 + 0.5 * words[word] / max_f
        idf = idfs[word]
        if tf * idf > cutoff:
            res.append(word)
    #   tfidf_dict[word] = tf * idf
    #with open(os.path.join(os.getcwd(), 'data\word_tfidf.json'), 'w') as f:
    #   json.dump(tfidf_dict, f, indent=2)
    return res


def remove_lf_words(text, min_count):
    word_counter = collections.Counter(text)
    return [word for word, count in word_counter.items() if count >= min_count]


class WordProcessor:
    def __init__(self, tokens):
        self.tokens = tokens

    def replace(self, word_replacement):

        def replace_single_word(word):
            res = word_replacement[word] if word in word_replacement else word
            return res
        if type(word_replacement) == str:
            replace_dict = {}
            for pairs in word_replacement.split(','):
                if len(pairs.strip()) and len(re.findall(r'->', pairs)) == 1:
                    w1, w2 = pairs.split('->')[0].strip(), pairs.split('->')[1].strip()
                    replace_dict[stemming([w1])[0]] = stemming([w2])[0]
            word_replacement = replace_dict
        self.tokens = [replace_single_word(word) for word in self.tokens]

    def remove(self, stop_words):
        self.tokens = [word for word in self.tokens if word not in stop_words]

    def remove_digits(self):
        self.tokens = [word for word in self.tokens if not word.isdigit()]

    def pair(self, phrases):
        if len(phrases) == 0:
            return
        if type(phrases) == str:
            phrase_list = phrases.split(',')
            res = []
            for phrase in phrase_list:
                res.append(' '.join(stemming(phrase.split(' '))))
            phrases = res
        convertions = []
        n = len(self.tokens)
        max_phrase_length = max([len(phrase.split(' ')) for phrase in phrases])
        i = 0
        while i < n:
            if max_phrase_length >= 4 and i + 4 <= n:
                if ' '.join(self.tokens[i: i + 4]) in phrases:
                    convertions.append(
                        [i, i + 1, i + 2, i + 3]
                    )
                    i += 4
                    continue
            if max_phrase_length >= 3 and i + 3 <= n:
                if ' '.join(self.tokens[i: i + 3]) in phrases:
                    convertions.append(
                        [i, i + 1, i + 2]
                    )
                    i += 3
                    continue
            if max_phrase_length >= 2 and i + 2 <= n:
                if ' '.join(self.tokens[i: i + 2]) in phrases:
                    convertions.append(
                        [i, i + 1]
                    )
                    i += 2
                    continue
            i += 1
        convertion_idxs = list(itertools.chain(*convertions))
        new_tokens = [word for idx, word in enumerate(self.tokens) if idx not in convertion_idxs]
        for convertion in convertions:
            new_phrase = ' '.join([self.tokens[word_idx] for word_idx in convertion])
            new_tokens.append(new_phrase)

        self.tokens = new_tokens

    def remove_stop_phrases(self, stop_phrases):
        return [word for word in self.tokens if word not in stop_phrases]

    def get_tokens(self):
        return self.tokens


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
    results = [x for x in results if x is not '']
    return results
    
def get_min_term_occurrence(terms, doc):
    the_terms = parse_terms(terms)
    import re
    #print(min([len(re.findall(term, doc)) for term in terms]))
    count = 0
    if len(terms[0]) == 0:
        return len(doc)

    try:
        for term in the_terms:
            count += len(re.findall(term, doc.lower()))
        return count
        #return min([len(re.findall(term, doc.lower())) for term in the_terms])
    except:
        return count

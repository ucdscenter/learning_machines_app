import random
import datetime
import hashlib
import string
import json
import pytz
from django.utils import timezone

def random_string(size=10, chars=string.ascii_uppercase + string.digits):
    return "".join(random.choice(chars) for x in range(size))

def get_now(ret_string=True):
	print(timezone.localtime(timezone.now()))
	if ret_string:
		return timezone.localtime(timezone.now()).strftime("%Y-%m-%d-%H-%M-%S")
	else:
		return timezone.localtime(timezone.now())


def hash_params(params):
	params_str = []
	return int(hashlib.sha256(params_str.encode("utf-8")).hexdigest(), 16) % 10**8


def prepare_model_listing(the_obj, q):
	if the_obj.method == 'word2vec' or the_obj.method == 'doc2vec':
		num_topics = the_obj.docfilter.num_clusters
	else:
		num_topics = the_obj.docfilter.num_topics
	ret_obj = {
		"query" : ' ' if len(q.query_str) == 0 else q.query_str,
		"database" : q.database,
		"time" : timezone.localtime(q.created_time).strftime("%m/%d/%y %I:%M %p"),
		"topics" : num_topics,
		"time range" : str(the_obj.docfilter.orig_start_year) + "-" + str(the_obj.docfilter.orig_end_year),
		"sub time range" : str(the_obj.docfilter.start_year) + "-" + str(the_obj.docfilter.end_year),
		"documents" : the_obj.docfilter.doc_number,
		"stop words" : the_obj.docfilter.stop_words,
		"status" : the_obj.status,
		"vis_type" : the_obj.method,
		"links" : the_obj.model_name,
		"task_id" : the_obj.task_id,
		"q_pk" : q.pk
	}
	return ret_obj


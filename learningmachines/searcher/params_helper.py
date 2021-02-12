import random
import datetime
import hashlib
import string
import json


def random_string(size=10, chars=string.ascii_uppercase + string.digits):
    return "".join(random.choice(chars) for x in range(size))

def get_now(ret_string=True):
	if ret_string:
		return datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
	else:
		return datetime.datetime.now()


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
		"time" : datetime.datetime.strftime(q.created_time, "%m-%d-%y %H:%M"),
		"topics" : num_topics,
		"status" : the_obj.status,
		"vis_type" : the_obj.method,
		"links" : the_obj.model_name,
		"task_id" : the_obj.task_id,
		"q_pk" : q.pk
	}
	return ret_obj


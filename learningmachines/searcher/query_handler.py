import json
import os
from celery.result import AsyncResult
from celery.task.control import revoke
from .models import QueryRequest, VisRequest

class QueryHandler:
	def __init__(self, q_pk=None, task_id=None):
		self.task_id = task_id
		self.q_pk = q_pk
		self.q = None if q_pk is None else QueryRequest.objects.get(pk=q_pk)
		self.v = None
		
	def _init_v(self):
		self.v = VisRequest.objects.get(query=self.q)

	def delete_query(self):
		self.q.delete()
		return "Successfully Deleted"

	def save_query(self):
		if self.v is None:
			self._init_v()
		self.v.is_saved = True
		self.v.save()
		return "Marked as saved"

	def cancel_task(self):
		#Not implemented for SQS
		if self.task_id:
			revoke(self.task_id, terminate=True)
			data = {'rslt': self.task.result, 'state': self.task.state}
			return data
		else:
			self._init_v()
			self.v.status = "Cancelled"
			self.v.save()
			return "Marked for Cancellation"

	def get_status(self):
		if self.q_pk is None:
			return None
		if self.v == None:
			self._init_v()
		print(self.v.status)
		return self.v.status

	def update_status(self, new_state, finished=False, saved=False):
		if self.q_pk is None:
			return None
		if self.v == None:
			self._init_v()
		if self.v.status is "Cancelled":
			return "Cancelled"

		self.v.status = new_state
		if finished:
			self.v.is_finished = True
		if saved:
			self.v.is_saved = True
		self.v.save()
		return "Updated"


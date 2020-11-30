from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.models import User

def access_required(endpoint):

	def wrap(user):
		if user.is_anonymous:
			return False
		accesses = user.access_set.all()
		for access in accesses:
			if access.endpoint == endpoint:
				return True
		return False

	return user_passes_test(wrap)

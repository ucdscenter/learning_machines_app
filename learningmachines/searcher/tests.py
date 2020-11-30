#python manage.py test searcher
from django.test import TestCase
from django.utils import timezone

from .models import Profile


class QuestionModelTests(TestCase):

    def create_profile(self):
        """
        was_published_recently() returns False for questions whose pub_date
        is in the future.
        """
        self.assertIs(False, False)
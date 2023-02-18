""" from django.test import TestCase
from django.db import models

class testing(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.title
         """
from django.test import SimpleTestCase
from django.test import Client
from searcher.models import Profile, Access, Request, QueryRequest, DocFilter, VisRequest
from django.contrib.auth.models import User


class ProfileModelTest(SimpleTestCase):

    def test_string_representation(self):  

        user = User(email="srivasyi@mail.uc.edu")
        profile = Profile(user = user, first_name = 'Sri', last_name = 'Vasyi', institute = 'University', department = 'Aerospace Enineering')
        self.assertEqual(str(profile), 'Email:{} First_name:{} Last_name:{} Department:{} Institute:{}'.format(profile.user.email, profile.first_name, profile.last_name, profile.institute, profile.department))

class AccessModelTest(SimpleTestCase):

    def test_string_representation(self):
        access = Access(endpoint = 'abc')
        self.assertEqual(str(access), access.endpoint)

class RequestModelTest(SimpleTestCase):

    def test_string_representation(self):
        request = Request(url = 'www.any.com', created_time = '5:00')
        self.assertEqual(str(request), 'url:{} time:{}'.format(request.url, request.created_time))


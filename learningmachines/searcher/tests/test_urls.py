""" from django.test import SimpleTestCase
from django.urls import reverse, resolve
from searcher.views import index, home, projects


class TestUrls(SimpleTestCase):


    def test_main_url_is_resolved(self):
        url = reverse('main')
        print(resolve(url))
        
 """
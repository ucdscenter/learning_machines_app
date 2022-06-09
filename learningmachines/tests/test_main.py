from django.test import LiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


selenium = webdriver.Chrome()
# Create your tests here.
class SearchTest(LiveServerTestCase):

  def testhome(self):
    #Choose your url to visit
    selenium.get('http://127.0.0.1:8000/searcher/')

    #check result; page source looks at entire html document
    assert 'The modelofmodels.io tool was created with funding provided by the' in selenium.page_source

  def testsearch_nologin(self):
    
    selenium.get('http://127.0.0.1:8000/searcher/search')

    assert 'Login' in selenium.page_source


# Create your models here.

from email.policy import default
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User
from numpy import array
from django.contrib.postgres.fields import ArrayField


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    institute = models.CharField(max_length=200, null=True)
    department = models.CharField(max_length=200, null=True)

    first_name = models.CharField(max_length=200, null=True, blank=True)
    last_name = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return 'Email:{} First_Name:{} Last_Name:{} Department:{} Institute:{}'.format(self.user.email, self.first_name, self.last_name, self.institute, self.department)


class Access(models.Model):
    user = models.ManyToManyField(User)
    endpoint = models.CharField(
        max_length=20,
        choices=(
            ('pubmed', 'pubmed'),
            ('foster', 'foster'),
            ('med_apps', 'med_apps'),
            ('mayerson_transcripts', 'mayerson_transcripts'),
            ('all', 'all')
        ),
        unique=True
    )

    def __str__(self):
        return self.endpoint


class Request(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    created_time = models.DateTimeField(default=timezone.now)
    url = models.CharField(max_length=1000)
    class Meta:
        abstract = True
    def start(self):
        self.created_time = timezone.now()
        self.save()

    def __str__(self):
        return 'url:{} time:{}'.format(self.url, self.created_time)


class QueryRequest(Request):
    database = models.CharField(max_length=20, default='')
    query_str = models.CharField(max_length=1000, default='')
    favorites = models.IntegerField(default=0)


class DocFilter(models.Model):
    method = models.CharField(
        max_length=20,
        choices=(
            ('select', 'select'),
            ('unselect', 'unselect')
        ),
        default='unselect'
    )

    docs = models.CharField(max_length=200, default='')
    num_topics = models.CharField(default="20", max_length=10)
    num_clusters = models.CharField(default="20", max_length=10)
    min_occur = models.IntegerField(default=-1)
    max_occur = models.IntegerField(default=-1)
    stop_words = models.CharField(max_length=500, default='')
    orig_start_year = models.CharField(default='year', max_length=12)
    orig_end_year = models.CharField(default='year', max_length=12)
    start_year = models.CharField(default='year', max_length=12)
    end_year = models.CharField(default='year', max_length=12)
    doc_number = models.CharField(default='', max_length=6)
    phrases = models.CharField(default='', max_length=500)
    remove_digits = models.BooleanField(default=False, null=False)
    tfidf= models.BooleanField(default=False, null=False)
    replacement = models.CharField(default='', max_length=1000)
    level_select = models.CharField(default='', max_length=100)
    para_filter_terms = models.CharField(default='', max_length=200)
    passes = models.CharField(default='automatic', max_length=10)
    max_hits = models.IntegerField(default=-1)
    auth_s = models.CharField(default='', max_length=100)
    ml_keywords = models.CharField(default='', max_length=100)
    jurisdiction = models.CharField(default='', max_length=100)
    journal = models.CharField(default='', max_length=50)


class VisRequest(Request):
    model_name = models.CharField(max_length=200)
    method = models.CharField(
        max_length=20,
        choices=(
            ('pyLDAvis', 'pyLDAvis'),
            ('DFR browser', 'DFR'),
            ('mlmom', 'mlmom'),
            ('doc2vec', 'd2v'),
            ('word2vec', 'w2v'),
            ('sentiment', 'sentiment')
        )
    )
    query = models.ForeignKey(QueryRequest, on_delete=models.CASCADE)
    docfilter = models.OneToOneField(DocFilter, on_delete=models.CASCADE)
    task_id = models.CharField(max_length=50, default='none')
    status = models.CharField(max_length=100, default="Scheduled")
    is_saved = models.BooleanField(default=False, null=False)
    is_finished = models.BooleanField(default=False, null=False)

class Annotation(models.Model):
    #Note: We can use ArrayField if we are using postgres
    nodes_and_edges = models.JSONField(default = dict)
    label_position_x = models.FloatField(default=0)
    label_position_y =  models.FloatField(default=0)
    #TODO: Max notes length, DocumentId
    label_text = models.CharField(max_length=500, default='Note')
    label_color = models.CharField(max_length=20, default='')
    note_id = models.CharField(max_length=50, default='')
    active_topic = models.CharField(max_length=50, default='', blank=True)
    vis_request = models.ForeignKey(VisRequest, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True) 
    def __str__(self):
        return 'note_id:{} label_text:{}'.format(self.note_id, self.label_text)
   
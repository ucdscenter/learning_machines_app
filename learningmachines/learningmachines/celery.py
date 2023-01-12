import os
import typing

from celery import Celery
from kombu import Exchange, Queue
from .celeryconfig import CELERY_SETTINGS 
#from .celeryconfig import BROKER_URL, BROKER_TRANSPORT_OPTIONS, AWS_PROFILE
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learningmachines.settings')

app = Celery('learningmachines')

project_name="searcher_queue"

app.conf.update(
    CELERY_RESULT_BACKEND=CELERY_SETTINGS['CELERY_RESULT_BACKEND'],
    #uncomment and comment out below two lines to change from aws sqs queue to local redis queue
    BROKER_URL=CELERY_SETTINGS['BROKER_URL'],
    #BROKER_URL=BROKER_URL,
    #BROKER_TRANSPORT_OPTIONS=BROKER_TRANSPORT_OPTIONS,
    CELERY_IMPORTS=["searcher.tasks"],
)

"""
optional setting for queueing
CELERY_QUEUES=(
        Queue(
            project_name,
            Exchange(project_name),
            routing_key=project_name
        ),
    )
"""
app.autodiscover_tasks()
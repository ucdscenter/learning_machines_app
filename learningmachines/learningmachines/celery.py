import os
import typing

from celery import Celery
from kombu import Exchange, Queue
from .celeryconfig import CELERY_SETTINGS, BROKER_URL, BROKER_TRANSPORT_OPTIONS, AWS_PROFILE

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learningmachines.settings')

app = Celery('learningmachines')

project_name="searcher_queue"

app.conf.update(
    CELERY_RESULT_BACKEND=CELERY_SETTINGS['CELERY_RESULT_BACKEND'],
    #CELERY_RESULT_BACKEND='db+postgresql_psycopg2://dev_user:dev_password@localhost/dev_db',
    #s3_access_key_id = AWS_PROFILE["ACCESS_KEY"],
    #s3_secret_access_key=AWS_PROFILE['SECRET_KEY'],
    #s3_bucket='learningmachines-results-backend',
    #s3_base_path='/results',
    #s3_region='us-east-2',
    BROKER_URL=CELERY_SETTINGS['BROKER_URL'],
    #BROKER_URL=BROKER_URL,
    #BROKER_TRANSPORT_OPTIONS=BROKER_TRANSPORT_OPTIONS,
    #CELERY_SETTINGS['BROKER_URL'],
    #CELERY_RESULT_BACKEND="rpc://",
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
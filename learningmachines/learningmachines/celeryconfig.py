from kombu.utils.url import safequote
from .credentials import AWS_PROFILE, SQS_QUEUE_NAME

CELERY_SETTINGS = {
   'BROKER_URL': 'redis://localhost:6379/0',
   'CELERY_RESULT_BACKEND': 'redis://localhost:6379',

}


BROKER_URL = 'sqs://{access_key}:{secret_key}@'.format(
    access_key=safequote(AWS_PROFILE['ACCESS_KEY']),
    secret_key=safequote(AWS_PROFILE['SECRET_KEY']),
)

BROKER_TRANSPORT_OPTIONS = {
    'region': 'us-east-2',
    'visibility_timeout': 60,  # 1 minutes
    'polling_interval': 5,     # 5 seconds
    'queue_name_prefix': SQS_QUEUE_NAME
}

CELERY_TASK_DEFAULT_QUEUE = 'default'
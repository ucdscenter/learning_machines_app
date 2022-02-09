import os

try:
	from .credentials import AWS_PROFILE, DB_ENV, DEV_DB_PROFILE, DJANGO_SECRET, SQS_QUEUE_NAME, REDIS_IP, REDIS_URL, RDS_ENDPOINT, S3_OBJECT, EMAIL_INFO, DEBUG_SETTING
	print("credentials file found")

except:
	print("no credentials file found, searching system variables...")
	AWS_PROFILE = {
	    'ACCESS_KEY': '',
	    'SECRET_KEY': '',
	    'AWS_HOST': 'search-mellon-team-02-loxyxjaof7ypdgvufsulhomyuq.us-east-2.es.amazonaws.com',
	    'SESSION_TOKEN' : None
	}

	DB_ENV = 'PRODUCTION' #'LOCAL', 'PRODUCTION'

	DEV_DB_PROFILE = {
		'user' : 'zhaowezra',#'zhaowezra',
		'password' : os.environ['RDS_PASSWORD']
	}
	DEBUG_SETTING = True #False

	DJANGO_SECRET = os.environ['DJANGO_SECRET']

	RDS_ENDPOINT='mellon-db-01.cykdbek7llhv.us-east-2.rds.amazonaws.com'

	SQS_QUEUE_NAME = 'learning-machines-'
	#SQS_QUEUE_NAME = 'learning-machines-ez-local-'

	REDIS_IP = os.environ['REDIS_IP']

	REDIS_URL= 'redis://'+ REDIS_IP +':6379' # redis://'+ 'localhost' +':6379'

	S3_OBJECT = {
		'USE_S3' : True,
		'BUCKET_NAME' : 'learningmachines-static',
		'CUSTOM_DOMAIN' : f'learningmachines-static.s3.amazonaws.com'
	}


	EMAIL_INFO = {
		'EMAIL_NAME' : 'ezraedgerton@gmail.com',
		'EMAIL_PW' : os.environ['CLIENT_EMAIL_PW']
	}

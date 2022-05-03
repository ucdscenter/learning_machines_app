import os
import boto3 
import json 



try:
	#this is if you are using a user defined credentials.py file, it will override these values. 
	from .credentials import AWS_PROFILE, DB_ENV, DEV_DB_PROFILE, DJANGO_SECRET, SQS_QUEUE_NAME, REDIS_IP, REDIS_URL, RDS_ENDPOINT, S3_OBJECT, EMAIL_INFO, DEBUG_SETTING
	print("credentials file found")

except:
	#processing for docker deploy with aws secretsmanagerkey
	if 'DJANGO_SECRETS' in os.environ:
		print("django secrets found, setting system variables!")
		print(os.environ['DJANGO_SECRETS'])
		#client = boto3.client('secretsmanager', region_name='us-east-2')
		#response = client.get_secret_value(
    	#	SecretId=os.environ['DJANGO_SECRETS']
		#)
		#print(response)
		#database_secrets = json.loads(response['SecretString'])
		database_secrets = json.loads(os.environ['DJANGO_SECRETS'])
		#set variables
		rds_password = database_secrets['RDS_PASSWORD']
		django_secret = database_secrets['DJANGO_SECRET']
		redis_ip = database_secrets['REDIS_IP']
		client_email_pw = database_secrets['CLIENT_EMAIL_PW']
	else:
		print("no aws secret environment variables found, searching os files")
		#if no secrets ID, look for them as set environment variables
		rds_password = os.environ['RDS_PASSWORD']
		django_secret = os.environ['DJANGO_SECRET']
		redis_ip = os.environ['REDIS_IP']
		client_email_pw = os.environ['CLIENT_EMAIL_PW']


	AWS_PROFILE = {
	    'ACCESS_KEY': '',
	    'SECRET_KEY': '',
	    'AWS_HOST': 'search-mellon-team-02-loxyxjaof7ypdgvufsulhomyuq.us-east-2.es.amazonaws.com',
	    'SESSION_TOKEN' : None
	}


	DB_ENV = 'PRODUCTION' #'LOCAL', 'DEV'

	DEV_DB_PROFILE = {
		'user' : 'zhaowezra',#'zhaowezra',
		'password' : rds_password
	}

	DEBUG_SETTING = False

	DJANGO_SECRET = django_secret

	RDS_ENDPOINT='mellon-db-01.cykdbek7llhv.us-east-2.rds.amazonaws.com'

	SQS_QUEUE_NAME = 'learning-machines-'
	#SQS_QUEUE_NAME = 'learning-machines-ez-local-'

	REDIS_IP = redis_ip

	REDIS_URL= 'redis://'+ REDIS_IP +':6379' # redis://'+ 'localhost' +':6379'

	S3_OBJECT = {
		'USE_S3' : True,
		'BUCKET_NAME' : 'learningmachines-static',
		'CUSTOM_DOMAIN' : f'learningmachines-static.s3.amazonaws.com'
	}


	EMAIL_INFO = {
		'EMAIL_NAME' : 'ezraedgerton@gmail.com',
		'EMAIL_PW' : client_email_pw
	}

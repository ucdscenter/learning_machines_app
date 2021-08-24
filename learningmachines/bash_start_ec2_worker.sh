#!/bin/bash
CLIENT_EMAIL_PW=''
export CLIENT_EMAIL_PW
#aws configure set aws_access_key_id ""
#aws configure set aws_secret_access_key ""
#aws configure set region "us-east-2"
#aws configure set output "json"
celery -A learningmachines worker

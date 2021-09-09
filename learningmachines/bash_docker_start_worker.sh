#!/bin/bash
DJANGO_SECRET=''
export DJANGO_SECRET
CLIENT_EMAIL_PW=''
export CLIENT_EMAIL_PW
RDS_PASSWORD=''
export RDS_PASSWORD
celery -A learningmachines worker

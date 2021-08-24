#!/bin/bash
CLIENT_EMAIL_PW=''
export CLIENT_EMAIL_PW
celery -A learningmachines worker

#!/bin/bash
CLIENT_EMAIL_PW='vonuavmikworwqlb'
export CLIENT_EMAIL_PW
celery -A learningmachines worker

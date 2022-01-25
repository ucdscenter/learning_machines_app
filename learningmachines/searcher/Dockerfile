# pull official base image
FROM python:3.8.1-slim-buster

# set editable arg variable

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /docker_learningmachines
RUN apt-get update && apt-get -y upgrade
RUN apt install -y python3-pip
RUN apt install -y libcurl4-openssl-dev libssl-dev
RUN pip install --upgrade pip

ARG RDS_PASSWORD
ARG DJANGO_SECRET
ARG CLIENT_EMAIL_PW
ARG REDIS_IP
ENV RDS_PASSWORD=$RDS_PASSWORD
ENV DJANGO_SECRET=$DJANGO_SECRET
ENV CLIENT_EMAIL_PW=$CLIENT_EMAIL_PW
ENV REDIS_IP=$REDIS_IP

COPY ./learningmachines/requirements.txt  /docker_learningmachines/requirements.txt
RUN pip install -r requirements.txt
RUN pip install awscli
RUN python -c 'import nltk; nltk.download("stopwords")'

COPY . /docker_learningmachines/
EXPOSE 8001
CMD [ "bash" ]

#CMD ["bash", "learningmachines/bash_docker_start_app_local.sh"]

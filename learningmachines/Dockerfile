# pull official base image
FROM python:3.8.1-slim-buster

# set environment varibles
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /docker_learningmachines
RUN apt-get update && apt-get -y upgrade
RUN apt install -y python3-pip
RUN apt install -y libcurl4-openssl-dev libssl-dev
RUN pip install --upgrade pip

COPY requirements.txt /docker_learningmachines/requirements.txt
RUN pip install -r requirements.txt
RUN python -c 'import nltk; nltk.download("stopwords")'
COPY . /docker_learningmachines/
CMD celery -A learningmachines worker

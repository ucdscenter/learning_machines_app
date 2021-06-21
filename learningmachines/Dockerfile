# pull official base image
FROM python:3.8.1-alpine

# set environment varibles
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /docker_learningmachines

RUN apk add --no-cache gcc musl-dev linux-headers
RUN apk add --no-cache libcurl
RUN apk add postgresql-dev
ENV PYCURL_SSL_LIBRARY=openssl
RUN apk add --no-cache --virtual .build-dependencies build-base curl-dev



RUN pip install --upgrade pip

COPY requirements.txt /docker_learningmachines/requirements.txt
RUN pip install -r requirements.txt
RUN apk del .build-dependencies

COPY . /docker_learningmachines/
CMD celery -A learningmachines worker

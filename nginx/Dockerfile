FROM nginx:1.19.0-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf  /etc/nginx/conf.d
COPY ./nginx/uwsgi_params.config  /docker_learningmachines/
WORKDIR /docker_learningmachines

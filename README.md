# learning_machines_app
app repository for learning machines rebuild

#Development Environment

## Getting Started

Clone the repo, cd into learning_machines_app

Create a virtualenv, and activate it
```bash
python3 -m venv whatever_you_want_to_name_this
source whatever_you_want_to_name_this/bin/activate
```
Install the python package requirements to the virtual env.
```bash
pip install -r requirements.txt
```
If installing on an ubuntu machines, you might get the error:
```
“Could not run curl-config: [Errno 2] No such file or directory” when installing pycurl
```
In which case run:
```
sudo apt install libcurl4-openssl-dev libssl-dev
```
Follow the steps in README.npm.text to download frontend files:
1. update dependencies in package.json (or) run 'npm install <package> --save' (or) you can even give the github url
2. run 'npm install' from directory where package.json is present
3. update CSS array and JS array in assets.js
3. run 'npm run-script webpack' to load js to project's static folder.


Create a credentials.py file in the learningmachines folder

Contact the UC Digital Scholarship Center for elasticsearch IAM credentials, aws sqs, and template to the to fill in the credentials.py information, as well as connection to the dev database. 

In the SQS_QUEUE_NAME field, make a unique queue name for your local tasks to be sent to. The queue we use for development/production is 'learning-machines-celery', so just prepend your aws username plus "-" to this. For example, my local field is set to 'ez-learning-machines-celery'

### Set up/connect to Database

While working locally, general use your local automatically created sql db. To set that up:

Create db and make migrations, and migrate
```bash
python manage.py makemigrations
python manage.py migrate
```

Create a django admin user, with your account info
```bash
python manage.py createsuperuser
```
Then follow the steps to create an admin account.

#### Add access objects. 
Now that you've created a superuser locally, go to localhost:8000/admin/ and login with those credentials. Click the add button next to the accesses item, and then select your own user, select 'all' as the endpoint and save. Repeat this step with the pubmed access. 



####For connecting/testing on the development server:
In the learningmachines/settings.py file, comment out the DATABASES object marked as FOR LOCAL, and uncomment the DATABASES object marked FOR DEV, then restart your server.


### Run redis server
download redis: https://redis.io/
```
sudo apt install redis-server
```

Start redis:
```
redis-server
```
### Fixing redis.py bug
From the folder with manage.py in it, run:
```
mv ../venv/lib/python3.8/site-packages/celery/backends/async.py ../venv/lib/python3.8/site-packages/celery/backends/asynchronous.py 
```
Then open ../venv/lib/python3.8/site-packages/celery/backends/async.py ../venv/lib/python3.8/site-packages/celery/backends/redis.py and replace all occurrences of async with asynchronous

## Starting Servers

To view the worker logs as well as the server logs, open two terminal windows. Activate your virtual environment in both terminal windows.

### Server
In one terminal window, after activating your venv, cd into the folder that has the manage.py file, 

```bash
python manage.py runserver 8000
```

### Worker
In the other window, cd into the folder that has the celery.py file (learning_machines_app/learningmachines/learningmachines)

```bash
celery -A learningmachines worker -l INFO
```

If you want to run them in the background without the logs, run
```bash
celery -A learningmachines worker -l INFO --detach
```

## Setting up and running with uwsgi/nginx
These steps are not necessary for running locally, only for setting up development/production servers.
### uwsgi
run 
```
sudo apt-get install build-essential python
pip install uwsgi
```
#### Create file learning_machines_app/learningmachines/learningmachines/runserver.ini
##### Copy this to file and change the /home/ubuntu/ parts of all paths to wherever your project repo is located
```
[uwsgi]
socket = 127.0.0.1:8001
chdir           = /home/ubuntu/learning_machines_app/learningmachines
module          = cfg.wsgi
master          = true
processes       = 1

threads = 2
max-requests = 6000

daemonize = /home/ubuntu/learning_machines_app/learningmachines/etc/uwsgi/run.log
```
##### Create folder learning_machines_app/learningmachines/etc/uwsgi
```
mkdir learning_machines_app/learningmachines/etc
mkdir learning_machines_app/learningmachines/etc/uwsgi
touch learning_machines_app/learningmachines/etc/uwsgi/run.log
cd learning_machines_app/learningmachines
```
##### Start uwsgi
from the folder conaining manage.py
```
uwsgi --ini learningmachines/runserver.ini
```

If error when installing uwsgi, try
```
sudo pip install python3.6-dev
```
### Set up nginx
```
sudo apt-get install nginx
```
##### Open "/etc/nginx/sites-enabled/default"
```
sudo vi /etc/nginx/sites-enabled/default
```
##### Copy this to file and change the /home/ubuntu/ parts of all paths to wherever your project repo is located
```
upstream django {
        server 127.0.0.1:8001; #web socket
    }
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    index index.html index.htm index.nginx-debian.html;

    server_name _;

    location / {
        root /home/ubuntu/learning_machines_app/learningmachines;
        uwsgi_pass django;
        include /home/ubuntu/learning_machines_app/learningmachines/etc/uwsgi/uwsgi_params.config; #uwsgi_params
    }
    location /static {
        alias /home/ubuntu/learning_machines_app/learningmachines/searcher/static/;
    }
}
``` 
Create folder and file py-server/etc/uwsgi/uwsgi_params.config and copy the texts to it.
```
uwsgi_param  QUERY_STRING       $query_string;
uwsgi_param  REQUEST_METHOD     $request_method;
uwsgi_param  CONTENT_TYPE       $content_type;
uwsgi_param  CONTENT_LENGTH     $content_length;

uwsgi_param  REQUEST_URI        $request_uri;
uwsgi_param  PATH_INFO          $document_uri;
uwsgi_param  DOCUMENT_ROOT      $document_root;
uwsgi_param  SERVER_PROTOCOL    $server_protocol;
uwsgi_param  REQUEST_SCHEME     $scheme;
uwsgi_param  HTTPS              $https if_not_empty;

uwsgi_param  REMOTE_ADDR        $remote_addr;
uwsgi_param  REMOTE_PORT        $remote_port;
uwsgi_param  SERVER_PORT        $server_port;
uwsgi_param  SERVER_NAME        $server_name;
```
Start nginx
```
sudo service nginx start
```

##TODO

write instructions for https support with certbot, domain name work

bert topic modeling endpoint

basic sentiment analysis endpoint

pretrain and save elasticsearch index based ngram models/language models

build in rds based task cancellation

ensure elasticsearch connections don't fail/timeout during large queries, build in a retry element

accounts testing/password reset work

general application test suites

deploy tools (docker? jeckyl?)

backward compatability for non-mlmom links

transfer over static visualizations folder from old version

add in twitter as db option

Upgrading to celery v6 (wait until sqs compatable)

Troubleshooting celery:
https://stackoverflow.com/questions/51273659/trouble-in-setting-celery-tasks-backend-in-python






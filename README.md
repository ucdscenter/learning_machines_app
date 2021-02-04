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




##TODO
Upgrading to celery v6

Troubleshooting celery:
https://stackoverflow.com/questions/51273659/trouble-in-setting-celery-tasks-backend-in-python






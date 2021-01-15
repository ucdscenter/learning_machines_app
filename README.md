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
Follow the steps in README.npm.text to download frontend files:
1. update dependencies in package.json (or) run 'npm install <package> --save' (or) you can even give the github url
2. run 'npm install' from directory where package.json is present
3. update CSS array and JS array in assets.js
3. run 'npm run-script webpack' to load js to project's static folder.


Create a credentials.py file in the learningmachines folder

Contact the UC Digital Scholarship Center for elasticsearch IAM credentials, aws sqs, and template to the to fill in the credentials.py information, as well as connection to the dev database. 

If you are using a local postgres server you can do the following:

Create db and make migrations, and migrate
```bash
python manage.py makemigrations
python manage.py migrate
```

Create a django admin user
```bash
python manage.py createsuperuser
```
### Run redis server
download redis: https://redis.io/
Start redis:
```
redis-server
```

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


### Adding permissions

login to localhost:8000/admin with the credentials from your superuser account. Alter the Accesses you would like to add to different users.


##TODO
Troubleshooting celery:
https://stackoverflow.com/questions/51273659/trouble-in-setting-celery-tasks-backend-in-python

ADD in old model link reverse compatability

Ngrams, other corpus prep steps





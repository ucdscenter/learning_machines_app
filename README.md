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
Follow the steps in README.npm.text to download frontent files

Download redis (https://redis.io/)

Create a credentials.py file in the learningmachines folder

Contact the UC Digital Scholarship Center for elasticsearch IAM credentials and template to the to fill in the credentials.py information

Create db and make migrations, and migrate
```bash
python manage.py makemigrations
python manage.py migrate
```

Create a django admin user
```bash
python manage.py createsuperuser
```


## Starting Servers

To view the worker logs as well as the server logs, open two terminal windows. Activate your virtual environment in both terminal windows.

### Server
In one window, cd into the folder that has the manage.py file, 

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


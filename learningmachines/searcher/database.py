import json
db_json = open('C:/Users\Admin\learning_machines_app\learningmachines\learningmachines\database.json', 'r')
data = json.load(db_json)
db_json.close()
DATABASES = data
import json
db_json = open('learningmachines/database.json', 'r')
data = json.load(db_json)
db_json.close()
databases = data
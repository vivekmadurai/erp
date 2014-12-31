import json
import datetime

def get_list_json(results):
    return json.dumps([result.to_dict() for result in results], cls=ComplexEncoder)

def get_json(result):
    return json.dumps(result.to_dict(), cls=ComplexEncoder)

class ComplexEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            encoded_object = obj.isoformat()
        else:
            encoded_object =json.JSONEncoder.default(self, obj)
        return encoded_object
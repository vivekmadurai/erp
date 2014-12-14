import json
import datetime

def getListJsonString(results):
    return json.dumps([result.to_dict() for result in results], cls=ComplexEncoder)

def getJsonString(result):
    return json.dumps(result.to_dict(), cls=ComplexEncoder)

class ComplexEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            encoded_object = obj.isoformat()
        else:
            encoded_object =json.JSONEncoder.default(self, obj)
        return encoded_object
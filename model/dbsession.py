from datetime import datetime
import logging
import uuid

from google.appengine.ext import ndb

def generateUUID():
    return str(uuid.uuid1()).replace("-", "_") 

class DBSession:
    def __init__(self):
        self.createdList = list()
        self.updatedList = list()
        self.deleteList = list()
        self.user = None
        
    def set_user(self, user):
        self.user = user

    def create(self, modelClass, args):
        logging.info("creating new record for %s"%(modelClass.__name__))
        instanceId = args.get("instanceId") or generateUUID()
        if args.get("store") == None:
            args["store"] = self.user.get("store")
        instance = modelClass(id = instanceId)
        instance.instanceId = instanceId
        for name in args:
            instance._values[name] = args.get(name)
            
        self.createdList.append(instance)
        return instance
        
    def update(self, instance, args):
        logging.info(instance.__dict__)
        logging.info(args)
        for name in args:
            instance._values[name] = args.get(name)
            
        self.updatedList.append(instance)
        
    def delete(self, instanceKey):
        self.deleteList.append(instanceKey)

    def commit(self):
        #persist into db
        if len(self.createdList)>0:
            logging.info("Commiting %s record"%(len(self.createdList)))
            ndb.put_multi(self.createdList)
            
        if len(self.updatedList)>0:
            logging.info("Updating %s record"%(len(self.updatedList)))
            ndb.put_multi(self.updatedList)
        
        if len(self.deleteList)>0:
            logging.info("Deleting %s record"%(len(self.deleteList)))
            ndb.delete_multi(self.deleteList)
            
    def get(self, modelClass, instanceId, returnNone=False):
        result = ndb.Key(modelClass, instanceId).get()
        #result = modelClass.query(modelClass.instanceId==instanceId).get()
        if result:
            return result
        if returnNone:
            return None
        raise Exception("Unable to retrieve the record with id %s for the model %s"%(instanceId, modelClass.__name__))
        
    def count(self, modelClass):
        result = modelClass.query().count(100)
        logging.info("Count %s"%result)
        return result

    def query(self, modelClass, filterArgs, limit=1000, offset=0):
        query = modelClass.query()
        #TODO need to add filter params
        #...
        #execute the query
        logging.info("fetching record for %s"%(modelClass.__name__))
        results = query.fetch(limit, offset=offset)
        return results

    def strToDateFormat(self, date_str, time_str=None):
        if time_str:
            return datetime.strptime("%s %s"%(date_str, time_str), '%d/%m/%Y %H:%M')
        return datetime.strptime("%s"%(date_str), '%d/%m/%Y %H:%M')
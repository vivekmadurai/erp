from google.appengine.api import users
import webapp2
import logging
import importlib
import datetime


from controller.render import renderTemplate
from controller.command import create, read, update, delete, csv_import, csv_export
from model.serializer import getJsonString, getListJsonString
from controller.constant import JSON_RESPONSE, CSV_RESPONSE

class BaseHandler(webapp2.RequestHandler):

    def set_session(self, session):
        self.session = session
        
    def set_user(self, user):
        self.user = user
        
    def render_login(self):
        self.redirect(users.create_login_url(self.request.uri))
        
    def render_logout(self):
        self.redirect(users.create_logout_url("/"))
    
    def render_home(self):
        self.response.out.write(renderTemplate('sales.html', {"user": self.user}))
        
    def render_report(self):
        self.response.out.write(renderTemplate('report.html', {"user": self.user}))
        
    def render_inventory(self):
        self.response.out.write(renderTemplate('inventory.html', {"user": self.user}))
        
    def add_product(self):
        self.response.out.write(renderTemplate('addProduct.html', {"user": self.user}))
        
    def all_product(self):
        self.response.out.write(renderTemplate('allProduct.html', {"user": self.user}))
    
    
    def add_category(self):
        self.response.out.write(renderTemplate('addCategory.html', {"user": self.user}))     

        
    def render_category(self):
        self.response.out.write(renderTemplate('categoryList.html', {"user": self.user}))             
    
    def edit_product(self):
        self.response.out.write(renderTemplate('editProduct.html', {"user": self.user}))     
    
    def get_list(self, modelName):
        from model.products import productList
        self.response.write(json.dumps(productList))
        
    def create(self, modelName):
        modelClass = self.__get_model_class__(modelName)
        args = self.__get_request_args__(modelClass)
        instance = create(self.session, modelClass, args)
        self.__commit__()
        
        jsonStr = getJsonString(instance)
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write(jsonStr)
        
    def read(self, modelName, instanceId):
        modelClass = self.__get_model_class__(modelName)
        instance = read(self.session, modelClass, instanceId)
        
        jsonStr = getJsonString(instance)
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write(jsonStr)
        
    def update(self, modelName, instanceId):
        modelClass = self.__get_model_class__(modelName)
        args = self.__get_request_args__(modelClass)
        instance = update(self.session, modelClass, instanceId, args)
        self.__commit__()
        
        jsonStr = getJsonString(instance)
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write(jsonStr)
        
    def delete(self, modelName, instanceId):
        modelClass = self.__get_model_class__(modelName)
        delete(self.session, modelClass, instanceId)
        self.__commit__()
        
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write('{"success": "successfully deleted"}')
        
        
    def list(self, modelName, pageNumber=None, pageCount=None):
        modelClass = self.__get_model_class__(modelName)
        pageNumber = pageNumber or 1
        
        pageNumber = int (pageNumber)
        
        if pageCount:
            pageCount = int (pageCount) or 50
        
        if pageNumber and pageCount:
            limit = int (pageCount)
            offset = (pageNumber - 1) * pageCount
            
            
            if pageNumber == 1:
                offset = 0
            
            results = self.session.query(modelClass, {}, limit, offset)
        else:
            results = self.session.query(modelClass, {})  

        jsonStr = getListJsonString(results)
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write(jsonStr)
        
    def count(self, modelName):
        results = 0;
        modelClass = self.__get_model_class__(modelName)
        results = self.session.count(modelClass)
        logging.info("handle  %i"%results)
       
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write('{"count": %s}'%results)
        return results
        
    def import_data(self, modelName):
        modelClass = self.__get_model_class__(modelName)
        thefile = self.request.params['csvdata']

        #file_name = thefile.filename
        csvData = thefile.value
        
        csv_import(self.session, modelClass, csvData)
        self.__commit__()
        
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write('{"success": "successfully imported"}')
    
    def export_data(self, modelName):
        modelClass = self.__get_model_class__(modelName)
        csvData = csv_export(self.session, modelClass)
        self.response.headers['Content-Type'] = CSV_RESPONSE
        self.response.headers['Content-Disposition'] = 'inline; filename="%s.csv"' % str(modelName)
        self.response.out.write(csvData)
        
    def __commit__(self):
        self.session.commit()
        
    def __get_mime_type__(self):
        if self.request.params.get("mimetype"):
            return self.request.params.get("mimetype")
        return self.request.accept.best_matches()[0]
    
    def __get_model_class__(self, modelName):
        m = importlib.import_module("model")
        return getattr(m, modelName)
    
    def __get_request_args__(self, model=None):
        params = {}
        for field in self.request.arguments():
            value = self.request.get(field)
            if model:
                prop = model._properties.get(field)
                logging.info("Field are %s"%(field))
                if not prop:
                    raise Exception("Invalid field name %s for the mode %s"%(field, model.__name__))
                propName = prop.__class__.__name__
                if propName == "FloatProperty":
                    value = float(value)
                elif propName == "DateTime":
                    value = datetime.datetime.now()
            params[field] = value 
        logging.info("Request params %s"%params)
        return params
    
    def createObject(self, modelName):
        modelClass = self.__get_model_class__(modelName)
        
        args = self.request.get("obj")
        if args:
            args = eval(args)
        else:
            raise Exception("obj is missing to perform create object operation")
        
        instance = create(self.session, modelClass, args)
        self.__commit__()
        
        jsonStr = getJsonString(instance)
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write(jsonStr)

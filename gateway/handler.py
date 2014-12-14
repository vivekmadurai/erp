from google.appengine.api import users
import webapp2
import logging
import json
import importlib

from controller.render import renderTemplate
from controller.command import create, read, update, delete
from model.serializer import getJsonString, getListJsonString
from controller.constant import JSON_RESPONSE

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
        self.response.out.write(renderTemplate('index.html', {"user": self.user}))
        
    def render_report(self):
        self.response.out.write(renderTemplate('report.html', {"user": self.user}))
        
    def create(self, modelName):
        args = self.__get_request_args__()
        modelClass = self.__get_model_class__(modelName)
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
        args = self.__get_request_args__()
        modelClass = self.__get_model_class__(modelName)
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
        self.response.out.write('{}')
        
        
    def list(self, modelName, pageNumber=None, pageCount=None):
        modelClass = self.__get_model_class__(modelName)
        pageNumber = pageNumber or 1
        pageCount = pageCount or 50
        
        if pageNumber and pageCount:
            limit = pageCount
            offset = (pageNumber - 1) * pageCount
            results = self.session.query(modelClass, {}, limit, offset)
        else:
            results = self.session.query(modelClass, {})  

        jsonStr = getListJsonString(results)
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write(jsonStr)
        
    def import_data(self, modelName):
        pass
    
    def export_data(self, modelName):
        pass
        
    def __commit__(self):
        self.session.commit()
        
    def __get_mime_type__(self):
        if self.request.params.get("mimetype"):
            return self.request.params.get("mimetype")
        return self.request.accept.best_matches()[0]
    
    def __get_model_class__(self, modelName):
        m = importlib.import_module("model")
        return getattr(m, modelName)
    
    def __get_request_args__(self):
        params = {}
        for field in self.request.arguments():
            value = self.request.get(field)
            try:
                value = float(value)
            except ValueError:
                pass
            params[field] = value 
        logging.info("Request params %s"%params)
        return params
import webapp2
import logging
import importlib
import datetime
import base64

from model import User, Store, Product
from auth.cookies import Cookies
from controller.util import id_generator, send_confirmation_mail
from auth.authutil import process_auth
from controller.render import render_template
from controller.command import create, read, update, delete, batch, csv_import, csv_export
from model.serializer import get_json, get_list_json
from controller.constant import JSON_RESPONSE, CSV_RESPONSE

class BaseHandler(webapp2.RequestHandler):
    session = None
    user = None
    
    def set_session(self, session):
        self.session = session
        
    def set_user(self, userId):
        user = self.session.get(User, userId, True)
        #for first time to create anaonymous user
        if user == None:
            if userId == "anonymous@erpfog.com":
                self.__first_time_setup__(userId)
            else:
                raise Exception("User with the Id %s not found"%userId)
        else:
            self.user = user.to_dict()
            #setting the user back in session to achieve multi-tenancy
            self.session.set_user(self.user)
        
    def __first_time_setup__(self, userId):
        #add default store and user
        storeId = "erpfog"
        self.session.create(Store, {"instanceId": storeId, "adminUser": userId, "store": storeId})
        user = self.session.create(User, {"instanceId": userId, "store": storeId})
        self.user = user.to_dict()
        self.session.set_user(self.user)
        
        #add default products
        from model.data import products
        for product in products:
            self.session.create(Product, product)
            
        self.__commit__()
    
    def render_signup(self):
        self.response.out.write(render_template('signup.html', {"request": self.request}))
        
    def process_signup(self):
        storeName = self.request.get("storeName")
        emailId = self.request.get("emailId")
        #check whether the store exist with same name
        store = self.session.get(Store, storeName, True)
        if store == None:
            #check whether user exist with same id
            user = self.session.get(User, emailId, True)
            if user == None:
                store = self.session.create(Store, {"instanceId": storeName, "adminUser": emailId, "store": storeName})
                password = id_generator()
                logging.info("the password for the user %s is %s"%(emailId, password))
                encodedPassword = base64.b64encode(password)
                user = self.session.create(User, {"instanceId": emailId, "store": storeName, "password": encodedPassword})
                send_confirmation_mail(emailId, password)
                self.__commit__()
                process_auth(self, emailId)
                self.redirect("/home")
            else:
                self.redirect("/signup?error= Email id already used")
        else:
            self.redirect("/signup?error= Store name already used")
                
    def render_login(self):
        if self.user and self.user.get("instanceId") != "anonymous@erpfog.com":
            self.redirect("/home")
        else:
            self.response.out.write(render_template('login.html', {"request": self.request}))
        
    def process_login(self):
        userId = self.request.get("userName")
        password = self.request.get("password")

        user = self.session.get(User, userId, True)
        if user:
            userDict = user.to_dict()
            dbPassword = base64.b64decode(userDict.get("password"))
            if dbPassword == password:
                process_auth(self, userId)
                forwardUrl = self.request.get("forward")
                if len(forwardUrl) == 0:
                    forwardUrl = "/home"
                self.redirect(forwardUrl)
                return
        self.redirect("/signin?error=Invalid username and password")
        
    def my_account(self):
        self.response.out.write(render_template('myaccount.html', {"user": self.user, "base64": base64}))
        
    def render_logout(self):
        cookies = Cookies(self)
        del cookies['sessionid']
        self.redirect("/signin")
        
    def render_home(self):
        self.response.out.write(render_template('sales.html', {"user": self.user}))
        
    def render_report(self):
        self.response.out.write(render_template('report.html', {"user": self.user}))
        
    def render_inventory(self):
        self.response.out.write(render_template('inventory.html', {"user": self.user}))
        
    def render_master(self):
        self.response.out.write(render_template('master.html', {"user": self.user}))
        
    def get_list(self, modelName):
        from model.products import productList
        import json
        self.response.write(json.dumps(productList))
        
    def create(self, modelName):
        modelClass = self.__get_model_class__(modelName)
        args = self.__get_request_args__(modelClass)
        instance = create(self.session, modelClass, args)
        self.__commit__()
        
        jsonStr = get_json(instance)
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write(jsonStr)
        
    def read(self, modelName, instanceId):
        modelClass = self.__get_model_class__(modelName)
        instance = read(self.session, modelClass, instanceId)
        
        jsonStr = get_json(instance)
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write(jsonStr)
        
    def update(self, modelName, instanceId):
        modelClass = self.__get_model_class__(modelName)
        args = self.__get_request_args__(modelClass)
        instance = update(self.session, modelClass, instanceId, args)
        self.__commit__()
        
        jsonStr = get_json(instance)
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write(jsonStr)
        
    def delete(self, modelName, instanceId):
        modelClass = self.__get_model_class__(modelName)
        delete(self.session, modelClass, instanceId)
        self.__commit__()
        
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write('{"success": "successfully deleted"}')
        
    def batch(self, modelName):
        modelClass = self.__get_model_class__(modelName)
        args = self.request.get("batchJson")
        if args:
            args = eval(args)
        else:
            raise Exception("batchJson is missing to perform batch operation")
        batch(self.session, modelClass, args)
        self.__commit__()
        
        self.response.headers['Content-Type'] = JSON_RESPONSE
        self.response.out.write('{"success": "batch successfully"}')
        
    def list(self, modelName, pageNumber=None, pageCount=None):
        modelClass = self.__get_model_class__(modelName)
        pageNumber = pageNumber or 1
        pageCount = pageCount or 50
        
        if pageNumber and pageCount:
            limit = int(pageCount)
            offset = (int(pageNumber) - 1) * limit
            results = self.session.query(modelClass, {}, limit, offset)
        else:
            results = self.session.query(modelClass, {})  

        jsonStr = get_list_json(results)
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
                if not prop:
                    raise Exception("Invalid field name %s for the mode %s"%(field, model.__name__))
                propName = prop.__class__.__name__
                logging.info("Field are %s == %s"%(field,propName))
                if propName == "FloatProperty":
                    value = float(value)
                elif propName == "DateTimeProperty":
                    value = datetime.datetime.now()
            params[field] = value 
        logging.info("Request params %s"%params)
        return params
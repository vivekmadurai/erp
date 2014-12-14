from google.appengine.api import users
import webapp2
import logging
import json
from controller.render import renderTemplate

class BaseHandler(webapp2.RequestHandler):

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
    
    def render_sales(self):
        self.response.out.write(renderTemplate('sales.html', {"user": self.user}))
    
    def get_list(self, modelName):
        from model.products import productList
        self.response.write(json.dumps(productList))
from google.appengine.api import users
import webapp2
import logging

from routing import mapper
from handler import BaseHandler

class WsgiHandler(webapp2.RequestHandler):
    
    def get(self):
        user = users.get_current_user()
        command = BaseHandler(self)
        command.initialize(self.request, self.response)
        if user:
            command.set_user(user)
            method = mapper.get(self.request.path)
            if method:
                getattr(command, method)()
            else:
                raise Exception("Invalid url, please provide a valid url")
        else:
            command.render_login()


app = webapp2.WSGIApplication([
                               ('/.*', WsgiHandler),
                        ], debug=True)

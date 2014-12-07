from google.appengine.api import users
import webapp2
import logging

from routing import mapper
from handler import BaseHandler

class WsgiHandler(webapp2.RequestHandler):
    
    def handle_all(self):
        user = users.get_current_user()
        command = BaseHandler(self)
        command.initialize(self.request, self.response)
        if user:
            command.set_user(user)
            mapper._envset(self.request.environ)
            kargs = mapper.match(self.request.path)
            logging.info(kargs)
            if kargs:
                method = kargs.get('action')
                del kargs['action']
                del kargs['controller']
                getattr(command, method)(**kargs)
            else:
                raise Exception("Invalid url, please provide a valid url")
        else:
            command.render_login()
            
    get = put = post = delete = head = handle_all


app = webapp2.WSGIApplication([
                               ('/.*', WsgiHandler),
                        ], debug=True)

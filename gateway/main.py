import webapp2
import logging

from routing import mapper
from handler import BaseHandler
from model.dbsession import DBSession

from auth.authutil import authenticate 

class WsgiHandler(webapp2.RequestHandler):
    
    def handle_all(self):
        handler = BaseHandler(self)
        handler.initialize(self.request, self.response)
        
        mapper._envset(self.request.environ)
        kargs = mapper.match(self.request.path)
        logging.info(kargs)
        
        userId = authenticate(handler);
        if kargs:
            if kargs.get("auth") and kargs.get("auth") == "open":
                userId = userId if userId else "anonymous@erpfog.com" 
                del kargs["auth"]
        else:
            raise Exception("Invalid url, please provide a valid url")
            
        if userId:
            method = kargs.get('action')
            del kargs['action']
            del kargs['controller']
            session = DBSession()
            handler.set_session(session)
            handler.set_user(userId)
            getattr(handler, method)(**kargs)
        else:
            handler.render_login()
            
    get = put = post = delete = head = handle_all


app = webapp2.WSGIApplication([
                               ('/.*', WsgiHandler),
                        ], debug=True)

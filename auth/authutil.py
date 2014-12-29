import uuid
import base64

from cookies import Cookies
from google.appengine.api import memcache

def authenticate(handler):
    return check_cookie(handler)

def process_auth(handler, userId):
    return check_cookie(handler, userId)
    
def check_cookie(handler, userId=None):
    cookies = Cookies(handler)
    if cookies.__contains__('sessionid') and memcache.get(cookies['sessionid']):
        sessionId=cookies['sessionid']
        userId=str(base64.b64decode(memcache.get(sessionId))).strip()
        memcache.set(sessionId, memcache.get(sessionId))
        return userId
    elif userId:
        uniqueId=str(uuid.uuid1())
        cookies['sessionid'] = uniqueId
        memcache.add(uniqueId, str(base64.b64encode(userId)))
        return userId
    return None
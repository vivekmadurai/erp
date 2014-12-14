
def create(session, model, args):
    instance = session.create(model, args)
    return instance

def read(session, model, instanceId):
    instance = session.get(model, instanceId)
    return instance

def update(session, model, instanceId, args):
    instance = session.get(model, instanceId)
    session.update(instance, args)
    return instance

def delete(session, model, instanceId):
    instance = session.get(model, instanceId)
    session.delete(instance.key)

def batch(session):
    pass
    
from google.appengine.ext import ndb

class POS(ndb.Expando):
    instanceId = ndb.StringProperty(indexed=True)
    store = ndb.StringProperty(indexed=True)
    date = ndb.DateTimeProperty(auto_now_add=True)
    
    def to_dict(self):
        result = super(POS, self).to_dict()
        return dict((k, v) for k,v in result.iteritems() if v is not None)

class Bill(POS):
    user = ndb.StringProperty(indexed=True)
    userName = ndb.StringProperty()
    customer = ndb.StringProperty(indexed=True)
    customerName = ndb.StringProperty()
    cashReceived = ndb.FloatProperty()
    chequeReceived = ndb.FloatProperty()
    tokenReceived = ndb.FloatProperty()
    subTotal = ndb.FloatProperty()
    total = ndb.FloatProperty()
    discountedAmount = ndb.FloatProperty()
    profitAmount = ndb.FloatProperty()
    tax1 = ndb.FloatProperty()
    tax2 = ndb.FloatProperty()
    
class BillItem(POS):
    bill = ndb.StringProperty(indexed=True)
    product = ndb.StringProperty(indexed=True)
    productName = ndb.StringProperty()
    category = ndb.StringProperty(indexed=True)
    price = ndb.FloatProperty()
    actualPrice = ndb.FloatProperty()
    quantity = ndb.FloatProperty()
    discount = ndb.FloatProperty()
    amount = ndb.FloatProperty()
    isReturned = ndb.BooleanProperty()
    
class Category(POS):
    name = ndb.StringProperty()
    category = ndb.StringProperty(indexed=True)

class Product(POS):
    name = ndb.StringProperty()
    description = ndb.StringProperty()
    ean13 = ndb.StringProperty()
    category = ndb.StringProperty(indexed=True)
    buyingPrice = ndb.FloatProperty()
    sellingPrice = ndb.FloatProperty()
    discount = ndb.FloatProperty()
    quantity = ndb.FloatProperty()
    location = ndb.StringProperty()
    reorderLevel = ndb.FloatProperty()
    expDate = ndb.DateProperty()
    
class Receiving(POS):
    product = ndb.StringProperty()
    receivedBy = ndb.StringProperty()
    suppliedBy = ndb.StringProperty()
    quantity = ndb.FloatProperty()
    total = ndb.FloatProperty()
    paymentType = ndb.StringProperty()
    comment = ndb.TextProperty()
    
class Store(POS):
    name = ndb.StringProperty()
    adminUser = ndb.StringProperty()
    currency = ndb.StringProperty()
    branch = ndb.StringProperty()

class StoreSubscription(POS):
    pass

class Customer(POS):
    pass

class User(POS):
    firstName = ndb.StringProperty()
    lastName = ndb.StringProperty()
    name = ndb.StringProperty()
    password = ndb.StringProperty()
    emailId = ndb.StringProperty()
    role = ndb.StringProperty()#we have Admin, Manager and User(default)
    phoneNumber = ndb.IntegerProperty()

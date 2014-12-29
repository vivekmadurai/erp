from google.appengine.ext import ndb

class POS(ndb.Expando):
    instanceId = ndb.StringProperty(indexed=True)
    Store = ndb.StringProperty(indexed=True)
    #Date = ndb.DateTimeProperty(auto_now_add=True)
    
    def to_dict(self):
        result = super(POS, self).to_dict()
        return dict((k, v) for k,v in result.iteritems() if v is not None)

class Bill(POS):
    User = ndb.StringProperty(indexed=True)
    Customer = ndb.StringProperty(indexed=True)
    PaymentType = ndb.StringProperty()
    AmountReceived = ndb.StringProperty()
    Total = ndb.FloatProperty()
    Tax1 = ndb.FloatProperty()
    Tax2 = ndb.FloatProperty()
    
class BillItem(POS):
    Bill = ndb.StringProperty()
    Product = ndb.StringProperty(indexed=True)
    ProductName = ndb.StringProperty()
    Category = ndb.StringProperty(indexed=True)
    Price = ndb.FloatProperty()
    Quantity = ndb.FloatProperty()
    Discount = ndb.FloatProperty()
    Amount = ndb.FloatProperty()
    
class Category(POS):
    Name = ndb.StringProperty()
    Category = ndb.StringProperty(indexed=True)

class Product(POS):
    Name = ndb.StringProperty()
    Description = ndb.StringProperty()
    EAN13 = ndb.StringProperty()
    Category = ndb.StringProperty(indexed=True)
    BuyingPrice = ndb.FloatProperty()
    SellingPrice = ndb.FloatProperty()
    Discount = ndb.FloatProperty()
    Quantity = ndb.FloatProperty()
    Location = ndb.StringProperty()
    ExpDate = ndb.StringProperty()
    Reorder = ndb.FloatProperty()
    
class Store(POS):
    pass

class StoreSubscription(POS):
    pass

class Customer(POS):
    pass

class User(POS):
    pass
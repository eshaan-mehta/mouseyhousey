from mongoengine import Document, StringField, IntField, FloatField

class Listing(Document):
    """Listing schema for real estate properties"""
    
    id = IntField(required=True, unique=True)
    address = StringField(required=True)
    city = StringField(required=True)
    bed = IntField(required=True)
    bath = IntField(required=True)
    garage = IntField(required=True)
    sqft = IntField(required=True)
    price = StringField(required=True)
    status = StringField(required=True, default="For Sale")
    description = StringField(required=True)
    zipcode = StringField(required=True)
    
    
    meta = {
        'collection': 'listings',
        'indexes': [
            'id',
            'address',
            'city',
            'bed',
            'bath',
            'garage',
            'sqft',
            'price',
            'status',
        ]
    } 
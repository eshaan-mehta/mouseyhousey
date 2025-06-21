from flask import Flask, jsonify, request
from flask_cors import CORS
from mongoengine import connect, disconnect
from schemas.listing import Listing
import os
import certifi
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection with MongoEngine
mongo_uri = os.getenv("MONGO_URI", "development")
connect(host=mongo_uri,
        tls=True,
        tlsCAFile=certifi.where())

# Server configuration from environment variables
HOST = os.getenv('HOST', '0.0.0.0')
PORT = int(os.getenv('PORT', 8080))
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection without requiring data
        from mongoengine.connection import get_db
        db = get_db()
        # Just ping the database to test connection
        db.command('ping')
        
        return jsonify({
            'status': 'healthy',
            'message': 'Service is running',
            'database': 'connected'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'message': 'Service is not running properly',
            'database': 'disconnected',
            'error': str(e)
        }), 500

@app.route('/api/listings', methods=['GET'])
def get_all_listings():
    """Get all property listings"""
    try:
        # Get query parameters for filtering
        limit = request.args.get('limit', default=50, type=int)
        skip = request.args.get('skip', default=0, type=int)
        
        # Build filter based on query parameters
        filter_kwargs = {}
        
        if request.args.get('city'):
            filter_kwargs['city__icontains'] = request.args.get('city')
        
        if request.args.get('min_beds'):
            filter_kwargs['bed__gte'] = int(request.args.get('min_beds'))
        
        if request.args.get('min_baths'):
            filter_kwargs['bath__gte'] = int(request.args.get('min_baths'))
        
        # Get listings from database using MongoEngine
        listings = Listing.objects(**filter_kwargs).skip(skip).limit(limit)
        
        # Convert to JSON-serializable format
        listings_data = []
        for listing in listings:
            listing_dict = listing.to_mongo().to_dict()
            listing_dict['_id'] = str(listing_dict['_id'])
            listings_data.append(listing_dict)
        
        return jsonify({
            'listings': listings_data,
            'total': len(listings_data),
            'limit': limit,
            'skip': skip
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch listings',
            'message': str(e)
        }), 500

@app.route('/api/listings/<listing_id>', methods=['GET'])
def get_listing(listing_id):
    """Get individual property listing by ID"""
    try:
        # Try to find by numeric id first
        try:
            listing = Listing.objects.get(id=int(listing_id))
        except:
            # If not found by numeric id, try MongoDB ObjectId
            from bson import ObjectId
            listing = Listing.objects.get(id=ObjectId(listing_id))
        
        if not listing:
            return jsonify({
                'error': 'Listing not found',
                'message': f'No listing found with id: {listing_id}'
            }), 404
        
        # Convert to JSON-serializable format
        listing_dict = listing.to_mongo().to_dict()
        listing_dict['_id'] = str(listing_dict['_id'])
        
        return jsonify(listing_dict), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch listing',
            'message': str(e)
        }), 500

@app.route('/api/listings/search', methods=['GET'])
def search_listings():
    """Search listings with filters"""
    try:
        # Get search parameters
        query = request.args.get('q', '')
        city = request.args.get('city', '')
        min_price = request.args.get('min_price', '')
        max_price = request.args.get('max_price', '')
        min_beds = request.args.get('min_beds', '')
        min_baths = request.args.get('min_baths', '')
        property_type = request.args.get('type', '')
        
        # Build search query
        search_kwargs = {}
        
        if query:
            # Search in address, description, or city
            from mongoengine.queryset.visitor import Q
            search_kwargs['__raw__'] = {
                '$or': [
                    {'address': {'$regex': query, '$options': 'i'}},
                    {'description': {'$regex': query, '$options': 'i'}},
                    {'city': {'$regex': query, '$options': 'i'}}
                ]
            }
        
        if city:
            search_kwargs['city__icontains'] = city
        
        if min_beds:
            search_kwargs['bed__gte'] = int(min_beds)
        
        if min_baths:
            search_kwargs['bath__gte'] = int(min_baths)
        
        if property_type:
            search_kwargs['property_type__icontains'] = property_type
        
        # Execute search
        listings = Listing.objects(**search_kwargs)
        
        # Convert to JSON-serializable format
        listings_data = []
        for listing in listings:
            listing_dict = listing.to_mongo().to_dict()
            listing_dict['_id'] = str(listing_dict['_id'])
            listings_data.append(listing_dict)
        
        return jsonify({
            'listings': listings_data,
            'total': len(listings_data)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to search listings',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    print(f"Starting Flask application...")
    print(f"Host: {HOST}")
    print(f"Port: {PORT}")
    print(f"Debug: {DEBUG}")
    print(f"API Base URL: http://{HOST}:{PORT}")
    print("-" * 50)
    app.run(debug=DEBUG, host=HOST, port=PORT) 
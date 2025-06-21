# @app.route('/api/listings', methods=['GET'])
# def get_all_listings():
#     """Get all property listings"""
#     try:
#         # Get query parameters for filtering
#         limit = request.args.get('limit', default=50, type=int)
#         skip = request.args.get('skip', default=0, type=int)
#         min_price = request.args.get('min_price', '')
#         max_price = request.args.get('max_price', '')
        
#         # Build filter based on query parameters
#         filter_kwargs = {}
        
#         if request.args.get('city'):
#             filter_kwargs['city__icontains'] = request.args.get('city')
        
#         if request.args.get('min_beds'):
#             filter_kwargs['bed__gte'] = int(request.args.get('min_beds'))
        
#         if request.args.get('min_baths'):
#             filter_kwargs['bath__gte'] = int(request.args.get('min_baths'))
        
#         if request.args.get('min_garage'):
#             filter_kwargs['garage__gte'] = int(request.args.get('min_garage'))
        
#         if request.args.get('min_sqft'):
#             filter_kwargs['sqft__gte'] = int(request.args.get('min_sqft'))
        
#         if request.args.get('max_sqft'):
#             filter_kwargs['sqft__lte'] = int(request.args.get('max_sqft'))
        
#         if request.args.get('status'):
#             filter_kwargs['status__icontains'] = request.args.get('status')
        
#         if request.args.get('zipcode'):
#             filter_kwargs['zipcode'] = request.args.get('zipcode')
        
#         # Get listings from database using MongoEngine
#         listings = Listing.objects(**filter_kwargs).skip(skip).limit(limit)
        
#         # Apply price filters
#         if min_price or max_price:
#             listings = apply_price_filters(listings, min_price, max_price)
        
#         # Convert to JSON-serializable format
#         listings_data = []
#         for listing in listings:
#             listing_dict = listing.to_mongo().to_dict()
#             listing_dict['_id'] = str(listing_dict['_id'])
#             listings_data.append(listing_dict)
        
#         return jsonify({
#             'listings': listings_data,
#             'total': len(listings_data),
#             'limit': limit,
#             'skip': skip
#         }), 200
        
#     except Exception as e:
#         return jsonify({
#             'error': 'Failed to fetch listings',
#             'message': str(e)
#         }), 500

# @app.route('/api/listings/<listing_id>', methods=['GET'])
# def get_listing(listing_id):
#     """Get individual property listing by ID"""
#     try:
#         # Try to find by numeric id first
#         try:
#             listing = Listing.objects.get(id=int(listing_id))
#         except:
#             # If not found by numeric id, try MongoDB ObjectId
#             from bson import ObjectId
#             listing = Listing.objects.get(id=ObjectId(listing_id))
        
#         if not listing:
#             return jsonify({
#                 'error': 'Listing not found',
#                 'message': f'No listing found with id: {listing_id}'
#             }), 404
        
#         # Convert to JSON-serializable format
#         listing_dict = listing.to_mongo().to_dict()
#         listing_dict['_id'] = str(listing_dict['_id'])
        
#         return jsonify(listing_dict), 200
        
#     except Exception as e:
#         return jsonify({
#             'error': 'Failed to fetch listing',
#             'message': str(e)
#         }), 500

# @app.route('/api/listings/search', methods=['GET'])
# def search_listings():
#     """Search listings with filters"""
#     try:
#         # Get search parameters
#         query = request.args.get('q', '')
#         city = request.args.get('city', '')
#         min_price = request.args.get('min_price', '')
#         max_price = request.args.get('max_price', '')
#         min_beds = request.args.get('min_beds', '')
#         min_baths = request.args.get('min_baths', '')
#         min_garage = request.args.get('min_garage', '')
#         min_sqft = request.args.get('min_sqft', '')
#         max_sqft = request.args.get('max_sqft', '')
#         status = request.args.get('status', '')
#         zipcode = request.args.get('zipcode', '')
        
#         # Build search query
#         search_kwargs = {}
        
#         if query:
#             # Search in address, description, or city
#             from mongoengine.queryset.visitor import Q
#             search_kwargs['__raw__'] = {
#                 '$or': [
#                     {'address': {'$regex': query, '$options': 'i'}},
#                     {'description': {'$regex': query, '$options': 'i'}},
#                     {'city': {'$regex': query, '$options': 'i'}}
#                 ]
#             }
        
#         if city:
#             search_kwargs['city__icontains'] = city
        
#         if min_beds:
#             search_kwargs['bed__gte'] = int(min_beds)
        
#         if min_baths:
#             search_kwargs['bath__gte'] = int(min_baths)
        
#         if min_garage:
#             search_kwargs['garage__gte'] = int(min_garage)
        
#         if min_sqft:
#             search_kwargs['sqft__gte'] = int(min_sqft)
        
#         if max_sqft:
#             search_kwargs['sqft__lte'] = int(max_sqft)
        
#         if status:
#             search_kwargs['status__icontains'] = status
        
#         if zipcode:
#             search_kwargs['zipcode'] = zipcode
        
#         # Execute search
#         listings = Listing.objects(**search_kwargs)
        
#         # Apply price filters
#         if min_price or max_price:
#             listings = apply_price_filters(listings, min_price, max_price)
        
#         # Convert to JSON-serializable format
#         listings_data = []
#         for listing in listings:
#             listing_dict = listing.to_mongo().to_dict()
#             listing_dict['_id'] = str(listing_dict['_id'])
#             listings_data.append(listing_dict)
        
#         return jsonify({
#             'listings': listings_data,
#             'total': len(listings_data)
#         }), 200
        
#     except Exception as e:
#         return jsonify({
#             'error': 'Failed to search listings',
#             'message': str(e)
#         }), 500q  

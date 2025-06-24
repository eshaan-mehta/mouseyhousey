from flask import jsonify, request
from backend.cache_intaker import cache_intaker

def handler(request):
    if request.method == 'GET':
        try:
            zip_code = int(request.args.get('zip_code'))
            score = request.args.get('score')
            uid = int(request.args.get('uid'))
            forecast_results = cache_intaker(uid=uid, zip_code=zip_code, listing_price=1000000, score=score)
            return jsonify(forecast_results)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Method not allowed'}), 405 
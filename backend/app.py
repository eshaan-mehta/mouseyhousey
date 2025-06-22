from flask import Flask, jsonify, request
from flask_cors import CORS
from mongoengine import connect, disconnect
from schemas.listing import Listing
from cache_intaker import cache_intaker
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
    return jsonify({
        'status': 'healthy',
        'message': 'Service is running',
        'database': 'connected'
    })

@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    try:
        zip_code = int(request.args.get('zip_code'))
        score = request.args.get('score')
        uid = int(request.args.get('uid'))
        print("uid:", uid)
        print("zip_code:", zip_code)
        print("score:", score)
        forecast_results = cache_intaker(uid=uid, zip_code=zip_code, listing_price=1000000, score=score)
        print("forecast_results:", forecast_results)
        return jsonify(forecast_results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"Starting Flask application...")
    print(f"Host: {HOST}")
    print(f"Port: {PORT}")
    print(f"Debug: {DEBUG}")
    print(f"API Base URL: http://{HOST}:{PORT}")
    print("-" * 50)
    app.run(debug=DEBUG, host=HOST, port=PORT) 
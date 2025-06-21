#!/usr/bin/env python3
"""
score_properties.py
–––––––––––––––
Score property listings using Gemini API.
Adds a "score" field (0-10) to each property.
"""

import json
import os
import time
import argparse
from pathlib import Path
import google.generativeai as genai
from tqdm import tqdm

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not installed, continue without it

# Configure Gemini API
def setup_gemini(api_key):
    """Setup Gemini API with the provided key."""
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    return model

def create_scoring_prompt(property_data):
    """Create a simple prompt for scoring the property."""
    prompt = f"""
Score this property from 0-10 where:
- 0 = Worst listing (major issues, terrible location)
- 4 = Average listing (fair value, standard quality)
- 10 = Best listing (exceptional value, premium quality)

BE STRICT. Most properties should score 2-8. Only exceptional properties get 9-10. Only terrible properties get 0-1. Make it based on quality of listing, location, depth of description.

Property:
- Address: {property_data.get('address', 'Unknown')}
- Price: {property_data.get('price', 'Unknown')}
- Beds: {property_data.get('beds', 'Unknown')}
- Baths: {property_data.get('baths', 'Unknown')}
- Sqft: {property_data.get('sqft', 'Unknown')}
- Property Type: {property_data.get('property_type', 'Unknown')}
- Description: {property_data.get('description', 'No description')[:300]}...

Respond with ONLY a number from 0-10. No other text.
"""

    return prompt

def score_property(model, property_data):
    """Score a single property using Gemini."""
    try:
        prompt = create_scoring_prompt(property_data)
        response = model.generate_content(prompt)
        
        # Extract just the number from the response
        response_text = response.text.strip()
        
        # Try to find a number in the response
        import re
        numbers = re.findall(r'\d+', response_text)
        if numbers:
            score = int(numbers[0])
            # Ensure score is between 0-10
            score = max(0, min(10, score))
            return score
        else:
            return 5  # Default score if no number found
            
    except Exception as e:
        print(f"Error scoring property: {e}")
        return 5  # Default score on error

def main():
    parser = argparse.ArgumentParser(description="Score property listings using Gemini API")
    parser.add_argument("json_file", help="Input JSON file with property listings")
    parser.add_argument("--api-key", help="Gemini API key (or set GEMINI_API_KEY env var)")
    parser.add_argument("--delay", type=float, default=3.0, help="Delay between API calls (default: 3.0s)")
    
    args = parser.parse_args()
    
    # Get API key
    api_key = args.api_key or os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ Error: No Gemini API key provided. Use --api-key or set GEMINI_API_KEY environment variable.")
        return
    
    # Setup Gemini
    try:
        model = setup_gemini(api_key)
        print("✅ Gemini API configured successfully")
    except Exception as e:
        print(f"❌ Error setting up Gemini API: {e}")
        return
    
    # Load properties
    input_file = Path(args.json_file)
    if not input_file.exists():
        print(f"❌ Error: File not found: {input_file}")
        return
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            properties = json.load(f)
        print(f"✅ Loaded {len(properties)} properties from {input_file}")
    except Exception as e:
        print(f"❌ Error loading JSON file: {e}")
        return
    
    # Score each property
    print(f"🎯 Starting to score {len(properties)} properties...")
    
    for i, property_data in enumerate(tqdm(properties, desc="Scoring properties")):
        # Add score to property
        score = score_property(model, property_data)
        property_data['score'] = score
        
        # Add delay to avoid rate limiting
        if i < len(properties) - 1:  # Don't delay after the last one
            time.sleep(args.delay)
    
    # Save scored properties
    output_file = "scored_final_properties.json"
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(properties, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved {len(properties)} scored properties to {output_file}")
    except Exception as e:
        print(f"❌ Error saving scored properties: {e}")
        return
    
    # Print summary
    scores = [p['score'] for p in properties]
    avg_score = sum(scores) / len(scores)
    min_score = min(scores)
    max_score = max(scores)
    
    print(f"\n📊 Summary:")
    print(f"   - Average Score: {avg_score:.2f}/10")
    print(f"   - Score Range: {min_score}-{max_score}")
    print(f"   - Properties Scored: {len(properties)}")

if __name__ == "__main__":
    main() 
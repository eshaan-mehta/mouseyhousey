#!/usr/bin/env python3
"""
rental_csv_to_json.py
–––––––––––––––
Convert rental CSV files to JSON format.
Creates final_rental_properties.json by default.
"""

import sys, json, pathlib, argparse
import pandas as pd
from tqdm import tqdm

def main():
    parser = argparse.ArgumentParser(description="Convert rental CSV to JSON")
    parser.add_argument("csv", help="Input rental CSV file")
    parser.add_argument("-o", "--output", help="Output JSON file (default: final_rental_properties.json)")
    parser.add_argument("-f", "--format", choices=["records", "split", "index", "columns", "values", "table"], 
                       default="records", help="JSON format (default: records)")
    parser.add_argument("-i", "--indent", type=int, default=2, help="JSON indentation (default: 2)")
    parser.add_argument("--pretty", action="store_true", help="Pretty print JSON with indentation")
    parser.add_argument("--minify", action="store_true", help="Minify JSON (no indentation)")
    parser.add_argument("--encoding", default="utf-8", help="File encoding (default: utf-8)")
    
    args = parser.parse_args()
    
    # Input file
    src = pathlib.Path(args.csv).expanduser()
    if not src.exists():
        sys.exit(f"File not found: {src}")
    
    # Output file
    if args.output:
        out = pathlib.Path(args.output)
    else:
        out = pathlib.Path("final_rental_properties.json")
    
    print(f"📁 Reading rental CSV: {src}")
    print(f"📄 Output JSON: {out}")
    print(f"🔧 Format: {args.format}")
    
    try:
        # Read CSV
        df = pd.read_csv(src, encoding=args.encoding, dtype=str, keep_default_na=False)
        print(f"✅ Loaded {len(df)} rental rows and {len(df.columns)} columns")
        
        # Convert to JSON
        print("🔄 Converting rental data to JSON...")
        
        # Determine indentation
        if args.minify:
            indent = None
        elif args.pretty:
            indent = args.indent
        else:
            indent = args.indent
        
        # Convert based on format
        if args.format == "records":
            # List of dictionaries (most common format)
            json_data = df.to_dict('records')
        elif args.format == "split":
            # Split format with separate data and columns
            json_data = df.to_dict('split')
        elif args.format == "index":
            # Index-oriented format
            json_data = df.to_dict('index')
        elif args.format == "columns":
            # Column-oriented format
            json_data = df.to_dict('list')
        elif args.format == "values":
            # Just the values as nested lists
            json_data = df.values.tolist()
        elif args.format == "table":
            # Table format with schema
            json_data = {
                "schema": {
                    "fields": [{"name": col, "type": "string"} for col in df.columns]
                },
                "data": df.to_dict('records')
            }
        
        # Write JSON file
        with open(out, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=indent, ensure_ascii=False)
        
        print(f"✅ Successfully converted rental data to JSON!")
        print(f"📊 Summary:")
        print(f"   - Input: {src} ({len(df)} rental properties)")
        print(f"   - Output: {out}")
        print(f"   - Format: {args.format}")
        print(f"   - Size: {out.stat().st_size:,} bytes")
        
        # Show preview of first few records
        if args.format == "records" and len(json_data) > 0:
            print(f"\n📋 Preview (first rental property):")
            print(json.dumps(json_data[0], indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 
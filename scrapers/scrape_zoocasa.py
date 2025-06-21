"""
Scrape listings from Zoocasa for Tampa, San Francisco, and New York with specific property type distributions.

Usage:
    python scrape_zoocasa_sf.py   # creates zoocasa_listings.csv and zoocasa_listings.json
"""
import asyncio, json, re
import pandas as pd
from playwright.async_api import async_playwright
import zipcodes
import concurrent.futures
import os

# Configuration for each city and property type distribution
CITIES_CONFIG = {
    "tampa": {
        "base_url": "https://www.zoocasa.com/tampa-fl-real-estate",
        "total": 50,
        "distribution": {"house": 20, "condo": 20, "townhouse": 10}
    },
    "san_francisco": {
        "base_url": "https://www.zoocasa.com/san-francisco-ca-real-estate", 
        "total": 30,
        "distribution": {"house": 12, "condo": 12, "townhouse": 6}
    },
    "new_york": {
        "base_url": "https://www.zoocasa.com/new-york-ny-real-estate",
        "total": 20,
        "distribution": {"house": 8, "condo": 8, "townhouse": 4}
    }
}

SCROLL_DELAY_MS = 800
OUT_CSV = "zoocasa_listings.csv"
OUT_JSON = "zoocasa_listings.json"
PAGE_TIMEOUT = 60000

# ---------- helpers ----------------------------------------------------------
async def auto_scroll(page):
    """Scroll to page bottom until no new content appears."""
    prev = 0
    scroll_attempts = 0
    max_attempts = 20
    
    while scroll_attempts < max_attempts:
        try:
            await page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
            await page.wait_for_timeout(SCROLL_DELAY_MS)
            curr = await page.evaluate("document.body.scrollHeight")
            if curr == prev:
                break
            prev = curr
            scroll_attempts += 1
        except Exception as e:
            print(f"Scroll error: {e}")
            break

async def list_urls_by_property_type(page, base_url, property_type, max_count):
    """Return list of property-detail URLs for a specific property type."""
    links = set()
    property_url = f"{base_url}/{property_type}s"  # Add 's' to make plural
    
    try:
        print(f"  Loading {property_type} listings from: {property_url}")
        await page.goto(property_url, timeout=15000)
        await page.wait_for_timeout(3000)
        
        # Scroll to load more content
        await auto_scroll(page)
        
        # Extract property URLs
        elements = await page.locator("a[href*='real-estate/']").all()
        print(f"  Found {len(elements)} {property_type} URLs")
        
        for elt in elements:
            try:
                href = await elt.get_attribute("href")
                if href:
                    if href.startswith("/"):
                        href = "https://www.zoocasa.com" + href
                    
                    # Only include URLs that look like actual property pages
                    if (href.startswith(f"https://www.zoocasa.com/") and
                        not any(skip in href.lower() for skip in [
                            '/for-rent', '/sold', '/not-listed', '/other', '/city',
                            '/bay-view', '/bernalhets', '/oceanview', '/pacific-heights',
                            '/silver-terrace', '/soma', '/south-beach', '/beach-park',
                            '/sunset-park', '/davis-islands', '/unplatted', '/hammocks',
                            '/port-tampa-city-map', '/north-bay-village-condo',
                            '/mac-farlanes-rev-map-of-add', '/hotel-ora-private-residences',
                            '/skypoint-a-condo', '/grove-park-estates', '/riverside-north',
                            '/habana-park-a-condo', '/carrollwood-sub', '/hudson-terrace-sub',
                            '/peninsula-heights', '/progress-village', '/woodland-preserve'
                        ]) and
                        any(char.isdigit() for char in href.split('/')[-1])):
                        links.add(href)
                        if len(links) >= max_count:
                            break
            except Exception as e:
                continue
                    
    except Exception as e:
        print(f"Error extracting {property_type} URLs: {e}")
    
    print(f"  Extracted {len(links)} unique {property_type} URLs")
    return sorted(list(links))[:max_count]

async def scrape_detail(page, url, property_type):
    try:
        print(f"    Loading page...")
        await page.goto(url, timeout=15000)
        await page.wait_for_timeout(2000)
        
        print(f"    Extracting data...")
        
        clean = lambda txt: re.sub(r"\s+", " ", txt).strip()
        
        async def get(sel):
            try:
                return clean(await page.locator(sel).first.inner_text())
            except:
                return ""

        out = {}
        
        # Basic property info
        out["address"] = await get("h1") or "Unknown"
        out["price"] = await get("[data-testid='listingPriceModal']") or "No price"
        out["property_type"] = property_type  # Add property type field
        
        # Get zipcode from address
        try:
            address_text = out["address"].lower()
            
            # Determine city and state from address
            if "tampa" in address_text:
                city = "Tampa"
                state = "FL"
            elif "san francisco" in address_text:
                city = "San Francisco" 
                state = "CA"
            elif "new york" in address_text:
                city = "New York"
                state = "NY"
            else:
                # Fallback: try to extract from comma-separated format
                parts = out["address"].split(',')
                if len(parts) >= 2:
                    last_part = parts[-1].strip()
                    if len(last_part) == 2 and last_part.isupper():
                        state = last_part
                        city = parts[-2].strip() if len(parts) > 2 else parts[0].strip()
                    else:
                        city = "Tampa"
                        state = "FL"
                else:
                    city = "Tampa"
                    state = "FL"
            
            # Get zipcode with timeout protection
            try:
                async def get_zipcode_with_timeout():
                    loop = asyncio.get_event_loop()
                    
                    with concurrent.futures.ThreadPoolExecutor() as executor:
                        future = loop.run_in_executor(executor, lambda: zipcodes.filter_by(city=city, state=state))
                        try:
                            results = await asyncio.wait_for(future, timeout=3.0)
                            return results
                        except asyncio.TimeoutError:
                            return None
                
                results = await get_zipcode_with_timeout()
                
                if results and len(results) > 0:
                    out["zipcode"] = results[0]['zip_code']
                else:
                    out["zipcode"] = ""
                    
            except Exception as zip_error:
                out["zipcode"] = ""
                
        except Exception as e:
            out["zipcode"] = ""
        
        # Get beds, baths, sqft, garage
        bed_raw = await get("[data-testid='listingBedIcon']")
        bath_raw = await get("[data-testid='listingBathIcon']")
        sqft_raw = await get("[data-testid='listingDimensionsIcon']")
        garage_raw = await get("[data-testid='listingCarIcon']")
        
        # Get description
        description_selectors = [
            "[data-testid='listingDescriptionTab'] p",
            "[data-testid='listingDescriptionTab'] div",
            "[data-testid='listingDescriptionTab'] span",
            "[data-testid='listingDescriptionTab']",
            "[data-testid='listingDescriptionTab'] *",
            "[data-testid='propertyDescription']",
            "[data-testid='listingDescription']", 
            ".property-description",
            ".listing-description",
            "[data-testid='description']",
            ".description",
            "p[data-testid*='description']",
            "div[data-testid*='description']",
            "[data-testid='detailsTable'] p",
            "[data-testid='detailsTable'] div",
            "[data-testid='detailsTable']"
        ]
        
        description_raw = ""
        
        # Try to get description from specific section
        try:
            listing_desc_tab = page.locator("[data-testid='listingDescriptionTab']")
            if await listing_desc_tab.count() > 0:
                description_section = listing_desc_tab.locator("div > div[data-testid='detailsTable'] > section > div > section")
                if await description_section.count() > 0:
                    desc_text = await description_section.inner_text()
                    if desc_text and len(desc_text.strip()) > 20:
                        description_raw = desc_text.strip()
        except Exception as e:
            pass
        
        # If that didn't work, try individual selectors
        if not description_raw or len(description_raw.strip()) < 20:
            for selector in description_selectors:
                try:
                    desc = await get(selector)
                    if desc and len(desc.strip()) > 20:
                        description_raw = desc
                        break
                except Exception as e:
                    continue
        
        # Save image (optional)
        try:
            image_selectors = [
                ".swiperCarouselComponent img",
                ".swiper-wrapper img", 
                ".swiper-slide img",
                "[data-testid*='carousel'] img",
                "[data-testid*='gallery'] img",
                ".carousel img",
                ".gallery img",
                ".image-gallery img",
                ".property-images img",
                ".listing-images img",
                "img[src*='zoocasa']",
                "img[alt*='property']",
                "img[alt*='listing']",
            ]
            
            for selector in image_selectors:
                try:
                    images = page.locator(selector)
                    count = await images.count()
                    if count > 0:
                        first_image = images.first
                        img_src = await first_image.get_attribute("src")
                        if img_src and img_src.startswith('http'):
                            # Create filename based on address
                            safe_address = re.sub(r'[^\w\s-]', '', out["address"]).replace(' ', '_')[:50]
                            
                            # Create images directory
                            images_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'images')
                            os.makedirs(images_dir, exist_ok=True)
                            
                            # Save image
                            filename = os.path.join(images_dir, f"{safe_address}.jpg")
                            
                            try:
                                img_response = await page.context.request.get(img_src)
                                if img_response.ok:
                                    with open(filename, 'wb') as f:
                                        f.write(await img_response.body())
                            except Exception as e:
                                pass
                            break
                except Exception as e:
                    continue
        except Exception as e:
            pass
        
        # Extract numbers using regex
        digits = re.compile(r'\d+')
        out["beds"] = digits.search(bed_raw).group(0) if bed_raw and digits.search(bed_raw) else ""
        out["baths"] = digits.search(bath_raw).group(0) if bath_raw and digits.search(bath_raw) else ""
        out["sqft"] = digits.search(sqft_raw).group(0) if sqft_raw and digits.search(sqft_raw) else ""
        out["garage"] = digits.search(garage_raw).group(0) if garage_raw and digits.search(garage_raw) else ""
        out["description"] = description_raw if description_raw else ""
            
        return out
        
    except Exception as e:
        print(f"    Error: {e}")
        return None

# ---------- main workflow ----------------------------------------------------
async def main():
    async with async_playwright() as pw:
        browser = await pw.firefox.launch(headless=False)
        page = await browser.new_page()
        page.set_default_timeout(PAGE_TIMEOUT)
        
        all_rows = []
        
        for city_name, config in CITIES_CONFIG.items():
            print(f"\n🏠 Scraping {city_name.upper()} ({config['total']} total properties)")
            print(f"   Distribution: {config['distribution']}")
            
            city_rows = []
            
            for property_type, count in config['distribution'].items():
                if count == 0:
                    continue
                    
                print(f"\n  📍 Getting {count} {property_type} properties...")
                
                # Get URLs for this property type
                urls = await list_urls_by_property_type(page, config['base_url'], property_type, count)
                
                if not urls:
                    print(f"  ⚠️  No {property_type} URLs found for {city_name}")
                    continue
                
                # Create detail page for scraping
                detail = await browser.new_page()
                detail.set_default_timeout(PAGE_TIMEOUT)
                
                # Scrape each property
                for i, url in enumerate(urls, 1):
                    try:
                        print(f"    [{i}/{len(urls)}] Scraping {property_type}: {url}")
                        
                        try:
                            result = await asyncio.wait_for(scrape_detail(detail, url, property_type), timeout=25)
                            if result:
                                city_rows.append(result)
                                print(f"      ✓ Success: {result.get('address', 'Unknown')} - {result.get('price', 'No price')}")
                            else:
                                print(f"      ✗ Failed to get data")
                        except asyncio.TimeoutError:
                            print(f"      ⏰ Timeout after 25 seconds, skipping...")
                        except Exception as e:
                            print(f"      ✗ Error: {e}")
                    except Exception as e:
                        print(f"      ✗ Error: {e}")
                    
                    # Add delay between requests
                    if i < len(urls):
                        await asyncio.sleep(1)
                
                await detail.close()
                print(f"  ✅ Completed {property_type} scraping for {city_name}")
            
            print(f"  📊 {city_name}: {len(city_rows)} properties scraped")
            all_rows.extend(city_rows)
        
        # Save all data to CSV and JSON
        if all_rows:
            # Save as CSV
            df = pd.DataFrame(all_rows)
            df.to_csv(OUT_CSV, index=False)
            print(f"\n✅ Successfully saved {len(all_rows)} properties to {OUT_CSV}")
            print(f"CSV Columns: {list(df.columns)}")
            
            # Save as JSON
            with open(OUT_JSON, 'w', encoding='utf-8') as f:
                json.dump(all_rows, f, indent=2, ensure_ascii=False)
            print(f"✅ Successfully saved {len(all_rows)} properties to {OUT_JSON}")
            
            # Print summary by city and property type
            print(f"\n📊 Final Summary:")
            print(f"   - Total properties scraped: {len(all_rows)}")
            
            # Group by city and property type
            df_summary = df.groupby(['property_type']).size().reset_index(name='count')
            print(f"   - By property type:")
            for _, row in df_summary.iterrows():
                print(f"     • {row['property_type']}: {row['count']}")
            
            print(f"   - CSV file: {OUT_CSV}")
            print(f"   - JSON file: {OUT_JSON}")
        else:
            print("❌ No data was scraped successfully")
        
        print("\nClosing browser...")
        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())

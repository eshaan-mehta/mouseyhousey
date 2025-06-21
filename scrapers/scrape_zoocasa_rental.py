"""
Scrape rental listings from Zoocasa for Tampa, San Francisco, and New York.

Usage:
    python scrape_zoocasa_rental.py   # creates zoocasa_rental_listings.csv and zoocasa_rental_listings.json
"""
import asyncio, json, re
import pandas as pd
from playwright.async_api import async_playwright
import zipcodes
import concurrent.futures
import os

# Configuration for each city rental listings
CITIES_CONFIG = {
    "tampa": {
        "base_url": "https://www.zoocasa.com/tampa-fl-real-estate/filter?rental=true&land=false&commercial=false&farm=false",
        "total": 30
    },
    "san_francisco": {
        "base_url": "https://www.zoocasa.com/san-francisco-ca-real-estate/filter?rental=true&land=false&commercial=false&farm=false", 
        "total": 30
    },
    "new_york": {
        "base_url": "https://www.zoocasa.com/new-york-ny-real-estate/filter?rental=true&land=false&commercial=false&farm=false",
        "total": 30
    }
}

SCROLL_DELAY_MS = 800
OUT_CSV = "zoocasa_rental_listings.csv"
OUT_JSON = "zoocasa_rental_listings.json"
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

async def list_rental_urls(page, base_url, max_count):
    """Return list of rental property-detail URLs."""
    links = set()
    
    try:
        print(f"  Loading rental listings from: {base_url}")
        await page.goto(base_url, timeout=15000)
        await page.wait_for_timeout(5000)  # Wait longer for page to load
        
        # Scroll to load more content
        await auto_scroll(page)
        
        # Debug: Check page title and current URL
        page_title = await page.title()
        current_url = page.url
        print(f"  Page title: {page_title}")
        print(f"  Current URL: {current_url}")
        
        # Get ALL links on the page and see what we have
        print("  Getting ALL links from the page...")
        all_links = await page.locator("a").all()
        print(f"  Found {len(all_links)} total links on page")
        
        # Show the first 50 links to see what we're working with
        print("  First 50 links found:")
        for i, link in enumerate(all_links[:50]):
            try:
                href = await link.get_attribute("href")
                text = await link.inner_text()
                if href:
                    print(f"    {i+1:2d}. {text[:60]:<60} -> {href}")
            except:
                continue
        
        # Now just get any links that look like property pages (simple approach)
        print("\n  Extracting property links...")
        for link in all_links:
            try:
                href = await link.get_attribute("href")
                if href:
                    if href.startswith("/"):
                        href = "https://www.zoocasa.com" + href
                    
                    # Simple check: is it a zoocasa URL with a property-like path?
                    if (href.startswith("https://www.zoocasa.com/") and
                        len(href.split('/')) > 4 and  # Has enough path segments
                        any(char.isdigit() for char in href.split('/')[-1])):  # Ends with numbers
                        
                        links.add(href)
                        print(f"      ✓ Added: {href}")
                        if len(links) >= max_count:
                            break
            except Exception as e:
                continue
                    
    except Exception as e:
        print(f"Error extracting rental URLs: {e}")
    
    print(f"  Extracted {len(links)} unique URLs")
    return sorted(list(links))[:max_count]

async def scrape_rental_detail(page, url):
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
        out["property_type"] = "rental"  # Mark as rental
        
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
            print(f"\n🏠 Scraping {city_name.upper()} RENTAL ({config['total']} properties)")
            
            city_rows = []
            
            print(f"\n  📍 Getting {config['total']} rental properties...")
            
            # Get URLs for rental properties
            urls = await list_rental_urls(page, config['base_url'], config['total'])
            
            if not urls:
                print(f"  ⚠️  No rental URLs found for {city_name}")
                continue
            
            # Create detail page for scraping
            detail = await browser.new_page()
            detail.set_default_timeout(PAGE_TIMEOUT)
            
            # Scrape each property
            for i, url in enumerate(urls, 1):
                try:
                    print(f"    [{i}/{len(urls)}] Scraping rental: {url}")
                    
                    try:
                        result = await asyncio.wait_for(scrape_rental_detail(detail, url), timeout=25)
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
            print(f"  ✅ Completed rental scraping for {city_name}")
            print(f"  📊 {city_name}: {len(city_rows)} rental properties scraped")
            all_rows.extend(city_rows)
        
        # Save all data to CSV and JSON
        if all_rows:
            # Save as CSV
            df = pd.DataFrame(all_rows)
            df.to_csv(OUT_CSV, index=False)
            print(f"\n✅ Successfully saved {len(all_rows)} rental properties to {OUT_CSV}")
            print(f"CSV Columns: {list(df.columns)}")
            
            # Save as JSON
            with open(OUT_JSON, 'w', encoding='utf-8') as f:
                json.dump(all_rows, f, indent=2, ensure_ascii=False)
            print(f"✅ Successfully saved {len(all_rows)} rental properties to {OUT_JSON}")
            
            # Print summary
            print(f"\n📊 Final Summary:")
            print(f"   - Total rental properties scraped: {len(all_rows)}")
            print(f"   - CSV file: {OUT_CSV}")
            print(f"   - JSON file: {OUT_JSON}")
        else:
            print("❌ No rental data was scraped successfully")
        
        print("\nClosing browser...")
        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main()) 
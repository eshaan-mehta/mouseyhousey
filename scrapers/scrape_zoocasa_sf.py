"""
Scrape all San-Francisco listings from Zoocasa into a CSV.

Usage:
    python scrape_zoocasa_sf.py   # creates zoocasa_sf_listings.csv
"""
import asyncio, json, re
import pandas as pd
from playwright.async_api import async_playwright
import zipcodes
import concurrent.futures
import os

START_URL = "https://www.zoocasa.com/tampa-fl-real-estate"
SCROLL_DELAY_MS = 800           # be kind; tweak if you get rate-limited
OUT_CSV = "zoocasa_sf_listings.csv"
PAGE_TIMEOUT = 60000           # 60 seconds timeout for page operations

# ---------- helpers ----------------------------------------------------------
async def auto_scroll(page):
    """Scroll to page bottom until no new content appears."""
    prev = 0
    scroll_attempts = 0
    max_attempts = 20  # Prevent infinite scrolling
    
    while scroll_attempts < max_attempts:
        try:
            await page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
            await page.wait_for_timeout(SCROLL_DELAY_MS)
            curr = await page.evaluate("document.body.scrollHeight")
            if curr == prev:        # reached the end
                break
            prev = curr
            scroll_attempts += 1
        except Exception as e:
            print(f"Scroll error: {e}")
            break

async def list_urls(page):
    """Return deduplicated list of property-detail URLs."""
    links = set()
    try:
        # Wait a bit for content to load
        await page.wait_for_timeout(3000)
        
        # Simple approach: get all San Francisco property URLs
        elements = await page.locator("a[href*='/tampa-fl-real-estate/']").all()
        print(f"Found {len(elements)} San Francisco URLs")
        
        for elt in elements:
            try:
                href = await elt.get_attribute("href")
                if href:
                    # Clean up the URL
                    if href.startswith("/"):
                        href = "https://www.zoocasa.com" + href
                    
                    # Only include URLs that look like actual property pages (not category pages)
                    if (href.startswith("https://www.zoocasa.com/tampa-fl-real-estate/") and
                        not any(skip in href.lower() for skip in [
                            '/condos', '/for-rent', '/sold', '/houses', '/townhouses',
                            '/not-listed', '/other', '/city', '/bay-view', '/bernalhets',
                            '/oceanview', '/pacific-heights', '/silver-terrace', '/soma',
                            '/south-beach', '/beach-park', '/sunset-park', '/davis-islands',
                            '/unplatted', '/hammocks', '/port-tampa-city-map', '/north-bay-village-condo',
                            '/mac-farlanes-rev-map-of-add', '/hotel-ora-private-residences',
                            '/skypoint-a-condo', '/grove-park-estates', '/riverside-north',
                            '/habana-park-a-condo', '/carrollwood-sub', '/hudson-terrace-sub',
                            '/peninsula-heights', '/progress-village', '/woodland-preserve'
                        ]) and
                        # Make sure it has a specific property identifier (like a street address)
                        any(char.isdigit() for char in href.split('/')[-1])):
                        links.add(href)
                        print(f"  ✓ Added: {href}")
                    else:
                        print(f"  ✗ Skipped category: {href}")
            except Exception as e:
                continue
                    
    except Exception as e:
        print(f"Error extracting URLs: {e}")
    
    print(f"Extracted {len(links)} unique San Francisco property URLs")
    return sorted(links)

async def scrape_detail(page, url):
    try:
        print(f"    Loading page...")
        await page.goto(url, timeout=15000)  # 15 second timeout
        
        # Don't wait for full page load, just get what's available
        await page.wait_for_timeout(2000)  # Just wait 2 seconds for basic content
        
        print(f"    Extracting data...")
        
        # -- quick DOM scrape --
        clean = lambda txt: re.sub(r"\s+", " ", txt).strip()
        
        async def get(sel):
            try:
                return clean(await page.locator(sel).first.inner_text())
            except:
                return ""

        out = {"url": url}
        
        # Simple, direct selectors
        out["address"] = await get("h1") or "Unknown"
        out["price"] = await get("[data-testid='listingPriceModal']") or "No price"
        
        # Get zipcode from address
        try:
            address_text = out["address"].lower()
            
            # Simple pattern matching for different cities
            if "tampa" in address_text:
                city = "Tampa"
                state = "FL"
            elif "san francisco" in address_text:
                city = "San Francisco" 
                state = "CA"
            elif "miami" in address_text:
                city = "Miami"
                state = "FL"
            elif "orlando" in address_text:
                city = "Orlando"
                state = "FL"
            elif "jacksonville" in address_text:
                city = "Jacksonville"
                state = "FL"
            elif "atlanta" in address_text:
                city = "Atlanta"
                state = "GA"
            elif "new york" in address_text:
                city = "New York"
                state = "NY"
            elif "los angeles" in address_text:
                city = "Los Angeles"
                state = "CA"
            elif "chicago" in address_text:
                city = "Chicago"
                state = "IL"
            elif "houston" in address_text:
                city = "Houston"
                state = "TX"
            else:
                # Fallback: try to extract from comma-separated format
                parts = out["address"].split(',')
                if len(parts) >= 2:
                    # Try to find state in the last part
                    last_part = parts[-1].strip()
                    if len(last_part) == 2 and last_part.isupper():
                        state = last_part
                        city = parts[-2].strip() if len(parts) > 2 else parts[0].strip()
                    else:
                        # Default to Tampa if we can't determine
                        city = "Tampa"
                        state = "FL"
                else:
                    city = "Tampa"
                    state = "FL"
            
            # Search for zipcodes with timeout protection
            try:
                # Use asyncio timeout instead of signal (works better on Windows)
                async def get_zipcode_with_timeout():
                    loop = asyncio.get_event_loop()
                    
                    with concurrent.futures.ThreadPoolExecutor() as executor:
                        future = loop.run_in_executor(executor, lambda: zipcodes.filter_by(city=city, state=state))
                        try:
                            results = await asyncio.wait_for(future, timeout=3.0)  # 3 second timeout
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
        
        # Get beds and baths with correct selectors
        bed_raw = await get("[data-testid='listingBedIcon']")
        bath_raw = await get("[data-testid='listingBathIcon']")
        
        # Get square feet and garage
        sqft_raw = await get("[data-testid='listingDimensionsIcon']")
        garage_raw = await get("[data-testid='listingCarIcon']")
        
        # Get description from details table
        description_raw = await get("[data-testid='detailsTable']")
        
        # Get the first image from the swiper carousel (save to directory only, not CSV)
        try:
            # Try multiple selectors to find images in nested div structures
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
                "img[src*='zoocasa']",  # Any image from zoocasa domain
                "img[alt*='property']",  # Any image with property in alt text
                "img[alt*='listing']",   # Any image with listing in alt text
            ]
            
            first_image = None
            img_src = None
            
            # Try each selector until we find an image
            for selector in image_selectors:
                try:
                    images = page.locator(selector)
                    count = await images.count()
                    if count > 0:
                        first_image = images.first
                        img_src = await first_image.get_attribute("src")
                        if img_src and img_src.startswith('http'):
                            break
                except Exception as e:
                    continue
            
            if img_src and img_src.startswith('http'):
                # Create a filename based on the address
                safe_address = re.sub(r'[^\w\s-]', '', out["address"]).replace(' ', '_')[:50]
                
                # Create the public/images directory if it doesn't exist
                images_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'images')
                os.makedirs(images_dir, exist_ok=True)
                
                # Save image to public/images directory
                filename = os.path.join(images_dir, f"{safe_address}.jpg")
                
                # Download and save the image to directory only
                try:
                    img_response = await page.context.request.get(img_src)
                    if img_response.ok:
                        with open(filename, 'wb') as f:
                            f.write(await img_response.body())
                except Exception as e:
                    pass
        except Exception as e:
            pass
        
        # Extract just the numbers using regex
        digits = re.compile(r'\d+')
        out["beds"] = digits.search(bed_raw).group(0) if bed_raw and digits.search(bed_raw) else ""
        out["baths"] = digits.search(bath_raw).group(0) if bath_raw and digits.search(bath_raw) else ""
        out["sqft"] = digits.search(sqft_raw).group(0) if sqft_raw and digits.search(sqft_raw) else ""
        out["garage"] = digits.search(garage_raw).group(0) if garage_raw and digits.search(garage_raw) else ""
        out["description"] = description_raw if description_raw else ""

        # Skip JSON-LD enrichment for speed
        # out["year_built"] = ""
        # out["lat"] = ""
        # out["lng"] = ""
            
        return out
        
    except Exception as e:
        print(f"    Error: {e}")
        return None

# ---------- main workflow ----------------------------------------------------
async def main():
    async with async_playwright() as pw:
        browser = await pw.firefox.launch(headless=False)  # Set to False to see browser window
        page = await browser.new_page()
        
        # Set longer timeout for navigation
        page.set_default_timeout(PAGE_TIMEOUT)
        
        try:
            await page.goto(START_URL, timeout=PAGE_TIMEOUT)
            # Wait for either networkidle or domcontentloaded, whichever comes first
            try:
                await page.wait_for_load_state("networkidle", timeout=30000)
            except:
                await page.wait_for_load_state("domcontentloaded", timeout=30000)
            
            # Debug: Print page title and some basic info
            title = await page.title()
            print(f"Page title: {title}")
            
            # Debug: Check if we're on the right page
            current_url = page.url
            print(f"Current URL: {current_url}")
            
            # Debug: Count some basic elements
            all_links = await page.locator("a").count()
            print(f"Total links on page: {all_links}")
            
        except Exception as e:
            print(f"Failed to load initial page: {e}")
            await browser.close()
            return

        # Step 1: load every card in the catalogue
        print("Scrolling to load all listings...")
        await auto_scroll(page)
        urls = await list_urls(page)
        print(f"Found {len(urls)} property pages")
        
        if not urls:
            print("No property URLs found. Please check if the page loaded correctly.")
            await browser.close()
            return

        # Step 2: drill into each listing
        print("Creating detail page for scraping individual properties...")
        detail = await browser.new_page()
        detail.set_default_timeout(PAGE_TIMEOUT)
        rows = []
        
        # Limit to first 10 listings for demo
        urls_to_scrape = urls[:10]
        print(f"Starting to scrape {len(urls_to_scrape)} properties (limited to 10 for demo)...")
        
        for i, u in enumerate(urls_to_scrape, 1):
            try:
                print(f"[{i}/{len(urls_to_scrape)}] Scraping: {u}")
                # Add a timeout for each property
                try:
                    result = await asyncio.wait_for(scrape_detail(detail, u), timeout=25)  # 25 second timeout per property
                    if result:
                        rows.append(result)
                        print(f"  ✓ Success: {result.get('address', 'Unknown address')} - {result.get('price', 'No price')}")
                    else:
                        print(f"  ✗ Failed to get data")
                except asyncio.TimeoutError:
                    print(f"  ⏰ Timeout after 25 seconds, skipping...")
                except Exception as e:
                    print(f"  ✗ Error: {e}")
            except Exception as e:          # keep going on failures
                print(f"  ✗ Error: {e}")
            
            # Add 1-second delay between requests to avoid rate limiting
            if i < len(urls_to_scrape):  # Don't delay after the last one
                print("  ⏳ Waiting 1 second before next request...")
                await asyncio.sleep(1)
            
            print()  # Empty line for readability

        # Step 3: persist to CSV / dataframe
        if rows:
            df = pd.DataFrame(rows)
            df.to_csv(OUT_CSV, index=False)
            print(f"✅ Successfully saved {len(rows)} properties to {OUT_CSV}")
            print(f"Columns: {list(df.columns)}")
        else:
            print("❌ No data was scraped successfully")
        
        print("Closing browser...")
        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())

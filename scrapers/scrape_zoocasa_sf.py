"""
Scrape all San-Francisco listings from Zoocasa into a CSV.

Usage:
    python scrape_zoocasa_sf.py   # creates zoocasa_sf_listings.csv
"""
import asyncio, json, re
import pandas as pd
from playwright.async_api import async_playwright

START_URL = "https://www.zoocasa.com/san-francisco-ca-real-estate"
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
        elements = await page.locator("a[href*='/san-francisco-ca-real-estate/']").all()
        print(f"Found {len(elements)} San Francisco URLs")
        
        for elt in elements:
            try:
                href = await elt.get_attribute("href")
                if href:
                    # Clean up the URL
                    if href.startswith("/"):
                        href = "https://www.zoocasa.com" + href
                    
                    # Only include URLs that look like actual property pages (not category pages)
                    if (href.startswith("https://www.zoocasa.com/san-francisco-ca-real-estate/") and
                        not any(skip in href.lower() for skip in [
                            '/condos', '/for-rent', '/sold', '/houses', '/townhouses',
                            '/not-listed', '/other', '/city', '/bay-view', '/bernalhets',
                            '/oceanview', '/pacific-heights', '/silver-terrace', '/soma',
                            '/south-beach'
                        ])):
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
                            print(f" Found image with selector: {selector}")
                            break
                except Exception as e:
                    continue
            
            if img_src and img_src.startswith('http'):
                # Create a filename based on the address
                safe_address = re.sub(r'[^\w\s-]', '', out["address"]).replace(' ', '_')[:50]
                filename = f"{safe_address}.jpg"
                
                # Download and save the image to directory only
                try:
                    img_response = await page.context.request.get(img_src)
                    if img_response.ok:
                        with open(filename, 'wb') as f:
                            f.write(await img_response.body())
                        print(f" Saved image: {filename}")
                    else:
                        print(f" Failed to download image: HTTP {img_response.status}")
                except Exception as e:
                    print(f" Failed to save image: {e}")
            else:
                print(f" No images found with any selector")
        except Exception as e:
            print(f" Image error: {e}")
        
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

# Mousey Housey

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## AI Investment Analysis

The application includes an AI-powered investment analysis feature that uses Google's Gemini API to provide property investment recommendations.

### Features

- 🤖 **AI-Powered Analysis**: Uses Gemini 1.5 Flash to analyze property data and forecast predictions
- 📊 **Investment Recommendations**: Provides buy/hold/avoid recommendations with confidence scores
- 📈 **Forecast Integration**: Incorporates property value predictions from the ML model
- 🔍 **Key Factors**: Highlights important factors influencing the recommendation
- ⚡ **Real-time Analysis**: Generates analysis on-demand for each property

### Setup

1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Restart the Development Server**:
   ```bash
   npm run dev
   ```

### How It Works

The AI analysis:
1. Collects property details (price, location, features, description)
2. Integrates forecast data from the ML model
3. Sends comprehensive data to Gemini API
4. Receives structured analysis with recommendation and confidence score
5. Displays results in an intuitive UI with visual indicators

### Analysis Criteria

The AI considers:
- **Price Appreciation Potential**: Based on forecast data
- **Property Fundamentals**: Location, size, condition, features
- **Market Conditions**: Zip code trends and property type performance
- **Risk Factors**: Property age, condition, market volatility

# Real Estate Scraper

A powerful web scraper for extracting real estate listings from with automatic zipcode detection and image downloading.

## Features

- 🏠 **Property Data Extraction**: Address, price, beds, baths, square footage, garage spaces, and descriptions
- 📍 **Automatic Zipcode Detection**: Uses the zipcodes library to automatically find zipcodes for any US city
- 🖼️ **Image Download**: Automatically downloads and saves property images to the project directory
- 🌍 **Multi-City Support**: Works with any US city (Tampa, San Francisco, Miami, etc.)
- 📊 **CSV Export**: Saves all data to a clean CSV file for analysis
- ⚡ **Smart Filtering**: Automatically filters out category pages to only scrape actual property listings

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd mouseyhousey
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv .venv
   ```

3. **Activate the virtual environment**:
   - **Windows**:
     ```bash
     .venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     source .venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Install Playwright browsers**:
   ```bash
   playwright install
   ```

## Usage

### Basic Usage

Run the scraper with default settings (scrapes Tampa, FL):
```bash
python scrapers/scrape_zoocasa_sf.py
```

### Customizing the Scraper

To scrape a different city, edit the `START_URL` in `scrapers/scrape_zoocasa_sf.py`:

```python
# Change this line to scrape a different city
START_URL = "https://www.zoocasa.com/san-francisco-ca-real-estate"  # San Francisco
START_URL = "https://www.zoocasa.com/miami-fl-real-estate"         # Miami
START_URL = "https://www.zoocasa.com/orlando-fl-real-estate"       # Orlando
```

### Output

The scraper generates:
- **`zoocasa_sf_listings.csv`**: CSV file with all property data
- **`zoocasa_sf_listings.json`**: JSON file with all property data
- **Property images**: JPG files named after the property addresses

### CSV Columns

| Column | Description |
|--------|-------------|
| `url` | Property listing URL |
| `address` | Full property address |
| `price` | Listing price |
| `zipcode` | Automatically detected zipcode |
| `beds` | Number of bedrooms |
| `baths` | Number of bathrooms |
| `sqft` | Square footage |
| `garage` | Number of garage spaces |
| `description` | Property description and details |

## Configuration

### Adjusting Scraping Limits

Edit these variables in the script:
```python
SCROLL_DELAY_MS = 800           # Delay between scrolls (milliseconds)
PAGE_TIMEOUT = 60000           # Page load timeout (milliseconds)
```

### Changing Output File

Modify the output filenames:
```python
OUT_CSV = "your_custom_filename.csv"
OUT_JSON = "your_custom_filename.json"
```

## Supported Cities

The scraper automatically detects and assigns zipcodes for:
- Tampa, FL
- San Francisco, CA
- Miami, FL
- Orlando, FL
- Jacksonville, FL
- Atlanta, GA
- New York, NY
- Los Angeles, CA
- Chicago, IL
- Houston, TX
- And any other US city (with fallback logic)

## Troubleshooting

### Common Issues

1. **"ModuleNotFoundError"**: Make sure you've activated your virtual environment and installed requirements
2. **Browser issues**: Run `playwright install` to install browser dependencies
3. **Timeout errors**: Increase `PAGE_TIMEOUT` or `SCROLL_DELAY_MS` values
4. **No data scraped**: Check if the website structure has changed or if you're being rate-limited

### Rate Limiting

The scraper includes built-in delays to be respectful to the website:
- 1-second delay between property requests
- 800ms delay between page scrolls
- Automatic timeout protection

## Dependencies

- **playwright**: Web automation and scraping
- **pandas**: Data manipulation and CSV export
- **zipcodes**: US zipcode database and lookup

## License

This project is for educational purposes. Please respect website terms of service and robots.txt files when scraping.

## Contributing

Feel free to submit issues and enhancement requests!

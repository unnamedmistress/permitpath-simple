# PermitPath Setup Guide 🚀
## Location-Smart Permit System

Complete setup instructions for the location-precise permit lookup system.

---

## 🎯 What You're Building

A smart permit lookup system that:
- ✅ Gets user's exact address via Google Places API
- ✅ Determines precise jurisdiction (city vs county)
- ✅ Detects special districts (historic, HOA, etc.)
- ✅ Finds nearest permit office automatically
- ✅ Uses GPT-4o-mini with web search for accurate answers
- ✅ Costs ~$0.05 per query (or $0.01 with caching)

---

## 📋 Prerequisites

You need:
1. **Node.js 16+** (check: `node --version`)
2. **OpenAI API Key** (GPT-4o-mini access)
3. **Google Maps API Key** (Geocoding + Places API)
4. **Text editor** (VS Code, Sublime, etc.)

---

## 🔑 Step 1: Get API Keys

### OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it "PermitPath" and copy the key
4. **Save it** - you can't see it again!

**Cost:** ~$0.011 per permit query (very cheap!)

---

### Google Maps API Key

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable these APIs:
   - **Geocoding API**
   - **Places API**
   - **Places API (New)** (optional, for enhanced results)

4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key
6. **Restrict it** (recommended):
   - Click "Edit API key"
   - Under "API restrictions" → Select APIs:
     - Geocoding API
     - Places API
   - Under "Application restrictions" → HTTP referrers (optional for dev)

**Cost:** 
- $0.005 per geocoding request
- $0.017-0.032 per Places API call
- First $200/month FREE (covers ~4,000 queries!)

**Important:** Google gives you $200/month credit (until Feb 2025), which covers most development and early users.

---

## ⚙️ Step 2: Install Dependencies

```bash
cd permitpath-simple

# Install Node packages
npm install

# Verify installation
npm list --depth=0
```

You should see:
- express
- @googlemaps/google-maps-services-js
- openai
- cors
- dotenv
- body-parser

---

## 🔐 Step 3: Configure API Keys

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your keys
nano .env
# or
code .env
```

Add your keys:
```env
OPENAI_API_KEY=sk-proj-abc123...
GOOGLE_MAPS_API_KEY=AIzaSyAbc123...
PORT=3000
```

**Security Note:** 
- Never commit `.env` to git!
- `.gitignore` already excludes it
- Keys are loaded via `dotenv` package

---

## 🚀 Step 4: Start the Server

```bash
npm start
```

You should see:
```
🚀 PermitPath API Server
========================
📡 Listening on http://localhost:3000
🗺️  Google Maps API: ✅ Configured
🤖 OpenAI API: ✅ Configured

📋 Available endpoints:
   GET  /api/health
   POST /api/location
   POST /api/permit
   POST /api/permit/full
```

---

## 🧪 Step 5: Test It!

### Option 1: Use the Web Interface

1. Open browser to http://localhost:3000/index-v2.html
2. Enter an address (e.g., "1600 Pennsylvania Ave NW, Washington DC")
3. Select a project type
4. Ask a question
5. Get your answer!

### Option 2: Test API Directly

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test location lookup
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{"address": "1810 Barton Springs Rd, Austin, TX"}'

# Test full permit query
curl -X POST http://localhost:3000/api/permit/full \
  -H "Content-Type: application/json" \
  -d '{
    "address": "1810 Barton Springs Rd, Austin, TX",
    "question": "Do I need a permit for a fence?",
    "projectType": "fence"
  }'
```

---

## 📁 Project Structure

```
permitpath-simple/
├── server.js              ← Main Express server
├── locationService.js     ← Google Places integration
├── permitService.js       ← GPT-4o-mini integration
├── index-v2.html          ← New frontend UI
├── style.css              ← Styles
├── package.json           ← Dependencies
├── .env                   ← Your API keys (don't commit!)
├── .env.example           ← Template for .env
└── SETUP.md              ← This file
```

---

## 🔍 API Endpoints

### GET /api/health
Check if server is running and APIs are configured.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-29T12:00:00.000Z",
  "services": {
    "location": true,
    "permit": true
  }
}
```

---

### POST /api/location
Get detailed location information.

**Request:**
```json
{
  "address": "123 Main St, Austin, TX"
}
```

**Response:**
```json
{
  "location": {
    "fullAddress": "123 Main St, Austin, TX 78701",
    "lat": 30.2672,
    "lng": -97.7431,
    "city": "Austin",
    "county": "Travis County",
    "state": "Texas",
    "neighborhood": "Downtown",
    "zipCode": "78701",
    "likelyCityLimits": true
  },
  "permitOffice": {
    "name": "Austin Development Services",
    "address": "505 Barton Springs Rd, Austin, TX",
    "phone": "(512) 978-4000",
    "website": "https://www.austintexas.gov/department/development-services"
  },
  "specialDistricts": []
}
```

---

### POST /api/permit
Get permit answer for a location.

**Request:**
```json
{
  "question": "Do I need a permit?",
  "projectType": "fence",
  "location": { ... },
  "permitOffice": { ... },
  "specialDistricts": []
}
```

**Response:**
```json
{
  "answer": "✅ YES - Permit Required\n\n💰 COST: $50-75...",
  "usage": {
    "promptTokens": 850,
    "completionTokens": 320,
    "totalTokens": 1170,
    "estimatedCost": {
      "total": 0.0112,
      "formatted": "$0.0112"
    }
  },
  "model": "gpt-4o-mini",
  "timestamp": "2025-01-29T12:00:00.000Z"
}
```

---

### POST /api/permit/full
Combined endpoint - lookup location + get permit answer.

**Request:**
```json
{
  "address": "123 Main St, Austin, TX",
  "question": "Do I need a permit?",
  "projectType": "fence"
}
```

**Response:** Combines location + permit data.

---

## 💰 Cost Tracking

The system tracks costs per query. Check the response:

```json
"usage": {
  "estimatedCost": {
    "input": 0.0001275,
    "output": 0.000192,
    "webSearch": 0.01,
    "searchContent": 0.0012,
    "total": 0.0115195,
    "formatted": "$0.0115"
  }
}
```

**Typical costs:**
- Location lookup (Google): $0.005-0.037
- Permit query (OpenAI): $0.011-0.015
- **Total per full query: ~$0.048** (5 cents)

---

## 🐛 Troubleshooting

### "Address not found"
- Check the address format
- Try adding more detail (street number, city, state, ZIP)
- Use full state names or abbreviations (Texas or TX)

### "Failed to lookup address"
- Verify Google Maps API key in `.env`
- Check that Geocoding API is enabled in Google Cloud Console
- Check API key restrictions aren't blocking localhost

### "Failed to get permit answer"
- Verify OpenAI API key in `.env`
- Check you have GPT-4o-mini access (most accounts do)
- Check your OpenAI billing/credits

### "Backend server is not running"
- Make sure you ran `npm start`
- Check port 3000 isn't already in use
- Try different port: `PORT=3001 npm start`

### "API keys not configured"
- Check `.env` file exists (not `.env.example`)
- Verify keys are correct (no extra spaces)
- Restart server after changing `.env`

---

## 🚀 Next Steps

### Add Caching (Save 80% on costs!)
```bash
npm install ioredis

# Start Redis (Docker)
docker run -d -p 6379:6379 redis

# Or use Redis Cloud (free 30MB)
# https://redis.com/try-free/
```

Then update `permitService.js` to cache answers.

### Deploy to Production
Options:
1. **Heroku** - Easy, $7/month
2. **Railway** - Easy, $5/month
3. **DigitalOcean** - $6/month droplet
4. **AWS/GCP** - More complex but scalable

### Add Features
- [ ] Address autocomplete (Google Places Autocomplete)
- [ ] "Use My Location" GPS button
- [ ] Upload project photos
- [ ] Save searches for later
- [ ] Email report option
- [ ] Multi-language support

---

## 📊 Monitoring Costs

Track your API usage:

**OpenAI:** https://platform.openai.com/usage  
**Google Maps:** https://console.cloud.google.com/billing

Set budget alerts:
- OpenAI: Set monthly limits in account settings
- Google: Set budget alerts in Cloud Console

---

## 🔒 Security Best Practices

1. **Never commit API keys** - Use `.env` only
2. **Restrict Google API key** - Limit to specific APIs
3. **Add rate limiting** - Prevent abuse
4. **Use HTTPS in production** - Encrypt traffic
5. **Validate all inputs** - Prevent injection attacks

---

## 📞 Support

- **Issues:** Check console logs (`server.js` output)
- **Docs:** Read `LOCATION-PRECISION-PLAN.md`
- **API Docs:** 
  - OpenAI: https://platform.openai.com/docs
  - Google Maps: https://developers.google.com/maps/documentation

---

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] API keys obtained
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` configured
- [ ] Server starts without errors
- [ ] Health check returns OK
- [ ] Can lookup an address
- [ ] Can get permit answer
- [ ] Web interface loads

---

## 🎉 You're Ready!

Your location-smart permit system is running!

**Test with real addresses:**
- 1810 Barton Springs Rd, Austin, TX (Austin city limits)
- 9500 Manchaca Rd, Austin, TX (Travis County, not Austin!)
- 1010 W 6th St, Austin, TX (Historic district)

Watch how the system detects the exact jurisdiction and provides location-specific answers!

**Have fun building!** 🚀

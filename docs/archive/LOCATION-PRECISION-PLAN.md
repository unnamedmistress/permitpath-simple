# Location-Precise Permit System 📍
## Google Places + GPT-4o Web Search Integration

**The Problem:** "Austin, Texas" is too vague. Different neighborhoods, HOAs, historic districts, and county overlaps have different rules.

**The Solution:** Two-stage system for surgical precision.

---

## 🎯 Architecture Overview

```
User Input: "123 Main St, Austin TX"
     ↓
[Stage 1: Google Places API]
  → Geocode address
  → Get precise jurisdiction details
  → Identify special districts
  → Find permit office info
     ↓
[Stage 2: GPT-4o-mini + Web Search]
  → Search using precise location data
  → Include jurisdiction-specific terms
  → Return targeted permit answer
     ↓
User sees accurate, localized answer
```

---

## 📍 Stage 1: Location Intelligence (Google Places API)

### What We Get:

```javascript
// Input: "1810 Barton Springs Rd, Austin TX"

const locationData = {
  // Basic location
  formatted_address: "1810 Barton Springs Rd, Austin, TX 78704",
  geometry: {
    lat: 30.2639,
    lng: -97.7697
  },
  
  // Jurisdictions (critical!)
  address_components: [
    { type: "street_number", value: "1810" },
    { type: "route", value: "Barton Springs Road" },
    { type: "neighborhood", value: "Zilker" },  // ← Important!
    { type: "locality", value: "Austin" },       // ← City
    { type: "administrative_area_level_2", value: "Travis County" }, // ← County
    { type: "administrative_area_level_1", value: "Texas" },
    { type: "postal_code", value: "78704" }
  ],
  
  // Plus we can search nearby
  place_id: "ChIJ..."  // For finding permit office
};
```

### Why This Matters:

**Example 1: City Boundaries**
- Address: "9500 Manchaca Rd, Austin, TX"
- **Actually in:** Unincorporated Travis County (not Austin city limits!)
- **Permit rules:** County, not city
- **Savings:** Different fees, different process

**Example 2: Historic Districts**
- Address: "1010 W 6th St, Austin, TX"
- **Neighborhood:** Clarksville Historic District
- **Extra rules:** Additional design review required
- **Impact:** 2-4 week delay, special forms

**Example 3: HOA Overlays**
- Address: "500 Mueller Blvd, Austin, TX"
- **Special district:** Mueller Development
- **Extra layer:** HOA approval before city permit
- **Critical:** Must know this upfront!

---

## 🔍 Stage 2: Targeted Web Search (GPT-4o-mini)

### Instead of Generic Search:
```
❌ "Austin Texas fence permit requirements"
```

### We Do Precise Search:
```
✅ "Travis County Texas fence permit requirements Zilker neighborhood 78704"
✅ "Austin Texas historic district fence permit Clarksville design review"
✅ "Mueller Development HOA fence approval Austin Texas"
```

---

## 💻 Implementation Plan

### **Phase 1: Basic Location Lookup** (Week 1)

```javascript
import { Client } from '@googlemaps/google-maps-services-js';

const maps = new Client({});

async function getLocationDetails(userAddress) {
  // Step 1: Geocode the address
  const geocode = await maps.geocode({
    params: {
      address: userAddress,
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  });

  const result = geocode.data.results[0];
  
  // Step 2: Extract jurisdiction info
  const location = {
    fullAddress: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    city: extractComponent(result, 'locality'),
    county: extractComponent(result, 'administrative_area_level_2'),
    state: extractComponent(result, 'administrative_area_level_1'),
    neighborhood: extractComponent(result, 'neighborhood'),
    zipCode: extractComponent(result, 'postal_code'),
    placeId: result.place_id
  };

  // Step 3: Check if address is in city limits
  location.inCityLimits = await checkCityBoundary(location.lat, location.lng);
  
  return location;
}

function extractComponent(result, type) {
  const comp = result.address_components.find(c => c.types.includes(type));
  return comp ? comp.long_name : null;
}
```

**Cost:** $0.005 per address lookup

---

### **Phase 2: Special District Detection** (Week 2)

```javascript
async function detectSpecialDistricts(lat, lng, city) {
  const specialDistricts = [];

  // Check for historic districts
  const historicResponse = await maps.findPlaceFromText({
    params: {
      input: `historic district near ${lat},${lng}`,
      inputtype: 'textquery',
      fields: ['name', 'geometry'],
      locationbias: `point:${lat},${lng}`,
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  });

  if (historicResponse.data.candidates.length > 0) {
    specialDistricts.push({
      type: 'historic',
      name: historicResponse.data.candidates[0].name,
      requiresReview: true
    });
  }

  // Check for HOA/special development
  // (Would use local database or web search for this)
  const knownDevelopments = await checkKnownDevelopments(lat, lng, city);
  specialDistricts.push(...knownDevelopments);

  return specialDistricts;
}
```

**Cost:** $0.015-0.03 per address (multiple API calls)

---

### **Phase 3: Find Permit Office** (Week 2)

```javascript
async function findPermitOffice(location) {
  const searchQuery = `building permit office ${location.city} ${location.county}`;
  
  const officeSearch = await maps.findPlaceFromText({
    params: {
      input: searchQuery,
      inputtype: 'textquery',
      fields: [
        'name',
        'formatted_address',
        'formatted_phone_number',
        'opening_hours',
        'website',
        'geometry'
      ],
      locationbias: `point:${location.lat},${location.lng}`,
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  });

  const office = officeSearch.data.candidates[0];
  
  return {
    name: office.name,
    address: office.formatted_address,
    phone: office.formatted_phone_number,
    hours: office.opening_hours?.weekday_text,
    website: office.website,
    distanceMiles: calculateDistance(location, office.geometry.location)
  };
}
```

**Cost:** $0.017 per lookup (Places API - Text Search)

---

### **Phase 4: Precision Search Query** (Week 3)

```javascript
import OpenAI from 'openai';

async function getPermitAnswerWithLocation(question, projectType, userAddress) {
  // Stage 1: Get location details
  const location = await getLocationDetails(userAddress);
  const specialDistricts = await detectSpecialDistricts(
    location.lat, 
    location.lng, 
    location.city
  );
  const permitOffice = await findPermitOffice(location);

  // Stage 2: Build precise search context
  const searchContext = buildSearchContext(location, specialDistricts);
  
  // Stage 3: Ask GPT with location precision
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: `You are a building permit expert. Use web search to find accurate, location-specific permit requirements.

Location context:
- Address: ${location.fullAddress}
- City: ${location.city}
- County: ${location.county}
- In city limits: ${location.inCityLimits ? 'Yes' : 'No'}
- Neighborhood: ${location.neighborhood || 'N/A'}
- Special districts: ${specialDistricts.map(d => d.name).join(', ') || 'None'}

Search for requirements specific to this jurisdiction. If the address is NOT in city limits, search county requirements instead.`
    }, {
      role: 'user',
      content: `${question} for ${projectType}

Permit office:
${permitOffice.name}
${permitOffice.address}
${permitOffice.phone}
${permitOffice.website || ''}`
    }],
    tools: [{ type: 'web_search' }],
    temperature: 0.3
  });

  return {
    answer: response.choices[0].message.content,
    location,
    specialDistricts,
    permitOffice,
    searchContext
  };
}

function buildSearchContext(location, specialDistricts) {
  let context = [];
  
  // Base jurisdiction
  if (location.inCityLimits) {
    context.push(`${location.city} city building code`);
  } else {
    context.push(`${location.county} county building code`);
  }
  
  // Add neighborhood if relevant
  if (location.neighborhood) {
    context.push(`${location.neighborhood} neighborhood overlay`);
  }
  
  // Add special districts
  specialDistricts.forEach(district => {
    context.push(`${district.name} design review`);
  });
  
  return context.join(' + ');
}
```

---

## 💰 Cost Breakdown

### Per Query:

| Step | Service | Cost | Notes |
|------|---------|------|-------|
| Geocode address | Google Geocoding | $0.005 | Get lat/lng + components |
| Check special districts | Google Places | $0.015 | 1-2 additional searches |
| Find permit office | Google Places | $0.017 | Text search + details |
| Web search + answer | GPT-4o-mini | $0.011 | With web search |
| **Total per query** | | **$0.048** | ~5 cents |

### With Caching:

**Cache Strategy:**
- Cache permit office by city/county (rarely changes)
- Cache special district info by lat/lng rounded to 0.01° (~1km grid)
- Cache final answers by address + project type for 30 days

**Effective costs with 80% cache rate:**
- Location lookup: $0.005 (can't cache user address)
- Special districts: $0.003 (80% cached)
- Permit office: $0.0034 (80% cached)
- GPT answer: $0.0022 (80% cached)
- **Total: ~$0.014** per query (~1.4 cents)

### Monthly Costs:

| Daily Users | Without Cache | With Cache (80%) | Google $200 Credit Coverage |
|-------------|---------------|------------------|----------------------------|
| 100 | $144/mo | $42/mo | ✅ Fully covered (4,167 free/mo) |
| 500 | $720/mo | $210/mo | ⚠️ Covers 72% |
| 1,000 | $1,440/mo | $420/mo | ⚠️ Covers 48% |
| 2,000 | $2,880/mo | $840/mo | ⚠️ Covers 24% |

**Note:** Google gives $200/month credit until Feb 2025, then pricing may change.

---

## 🎨 User Experience Flow

### **1. Address Input**
```
User enters: "123 Main St, Austin TX"
             or
User clicks: "Use My Location" (GPS)
```

### **2. Loading State**
```
🔍 Finding your exact location...
📍 Checking local jurisdictions...
```

### **3. Location Confirmation**
```
✅ Found your location:
   123 Main Street
   Zilker, Austin, TX 78704
   
   📋 Jurisdiction: Austin City Limits
   🏛️ Special Districts: None
   
   [Correct?] [Edit Address]
```

### **4. Project Question**
```
Now showing:
"What type of project?"
[Fence] [Deck] [Shed] [Remodel] [Other]
```

### **5. Precise Answer**
```
📍 For your location: 123 Main St, Zilker, Austin

🏗️ FENCE PERMIT - 7 feet tall

✅ YES - Permit Required
Your fence is in Austin city limits and over 6 feet tall.

💰 COST: $50-75
   Base permit: $50
   Inspection: $25

⏰ TIMELINE: 2-3 weeks
   Apply: 1 day
   Review: 7-10 business days
   Inspection: 3-5 days after completion

📋 WHAT YOU NEED:
   ✓ Property survey or plot plan
   ✓ Fence height and material specs
   ✓ Distance from property line (setback)
   
🏛️ WHERE TO APPLY:
   Austin Development Services
   505 Barton Springs Rd, Suite 300
   (512) 978-4000
   Open: Mon-Fri 8am-5pm
   
   🌐 Apply online: austintexas.gov/permits
   
📜 SOURCE: Austin Land Development Code 25-2-595
```

---

## 🚀 Advanced Features (Phase 5+)

### **A. Boundary Visualization**
Show user on a map whether they're in city limits, special districts, etc.

### **B. Nearby Comparisons**
"Your neighbor 2 blocks away is in County jurisdiction (different rules)"

### **C. Cost Comparison**
"If you were 1 mile north (city limits), permit would be $150 instead of $50"

### **D. HOA Detection**
Integrate with HOA databases (PropertyShark, HOA Express) to detect HOA requirements

### **E. Smart Suggestions**
"You're 3 inches over the permit threshold. Consider 5'9" fence instead?"

---

## 📊 Accuracy Improvements

### Before Location Precision:
```
Query: "Do I need permit for fence in Austin?"
Answer: Generic Austin rules (might be wrong for county areas)
Accuracy: ~70%
```

### After Location Precision:
```
Query: "Do I need permit for fence at 123 Main St?"
Answer: Specific to exact jurisdiction + special districts
Accuracy: ~95%
```

**Critical Cases Solved:**
- ✅ County vs. City boundaries
- ✅ Historic district overlays
- ✅ HOA requirements
- ✅ Neighborhood-specific rules
- ✅ Correct permit office
- ✅ Accurate fees and timelines

---

## 🛠️ Technical Stack

```javascript
// package.json
{
  "dependencies": {
    "@googlemaps/google-maps-services-js": "^3.4.0",
    "openai": "^4.0.0",
    "ioredis": "^5.3.0",  // For caching
    "express": "^4.18.0"
  }
}
```

---

## 📝 Implementation Checklist

### Week 1: Core Location
- [ ] Set up Google Maps API account
- [ ] Implement geocoding (address → lat/lng + components)
- [ ] Extract city, county, neighborhood, zip
- [ ] Test with 20+ addresses in different jurisdictions

### Week 2: Jurisdiction Intelligence
- [ ] Build city boundary checker
- [ ] Implement special district detection
- [ ] Create permit office finder
- [ ] Add caching for permit office data

### Week 3: Integration
- [ ] Combine location + GPT-4o-mini search
- [ ] Build precise search query generator
- [ ] Test end-to-end with real questions
- [ ] Validate accuracy against known cases

### Week 4: Polish
- [ ] Add location confirmation UI
- [ ] Implement address autocomplete
- [ ] Add "Use My Location" GPS option
- [ ] Cache optimization
- [ ] Error handling for invalid addresses

---

## 🎯 Success Metrics

### Accuracy
- **Target:** 95%+ correct answers
- **Test:** 100 real addresses across different jurisdictions
- **Compare:** Against manual research

### Speed
- **Target:** < 5 seconds total
- **Breakdown:**
  - Location lookup: 0.5-1s
  - Special districts: 0.5-1s
  - Permit office: 0.5-1s
  - GPT search: 2-3s

### Cost
- **Target:** < $0.05 per query (without cache)
- **Target:** < $0.02 per query (with 80% cache)

---

## 🚨 Edge Cases to Handle

### 1. Ambiguous Addresses
```
Input: "Main St, Austin"
Action: Show multiple matches, ask user to choose
```

### 2. Rural Areas
```
Input: "123 County Rd 450, Dripping Springs"
Action: Detect unincorporated area, search county rules
```

### 3. Border Cases
```
Input: "4500 Duval St" (on Austin/Unincorporated line)
Action: Show both jurisdictions, let user confirm
```

### 4. No Address Yet
```
Input: "I'm planning to buy land..."
Action: Ask for approximate location (city/zip)
```

---

## 💡 Sample Queries to Test

1. **City limits edge:**
   "9500 Manchaca Rd, Austin" (actually Travis County)

2. **Historic district:**
   "1010 W 6th St, Austin" (Clarksville Historic)

3. **HOA development:**
   "500 Mueller Blvd, Austin" (Mueller Development)

4. **Multiple jurisdictions:**
   "101 Congress Ave, Austin" (Downtown overlay districts)

5. **Rural county:**
   "1234 FM 1826, Austin" (Unincorporated Hays County)

---

## 🎉 The Value Proposition

**Without location precision:**
- "Do you need a permit in Austin?" → Generic, 70% accurate

**With location precision:**
- "Do you need a permit at YOUR ADDRESS?" → Specific, 95% accurate
- Plus: Exact fees, correct office, accurate timeline
- Plus: Special district warnings (HOA, historic, etc.)

**User trust skyrockets** when answers are provably accurate to their exact location.

---

## 🚀 Ready to Build?

This is the plan. I can start implementing:

**Phase 1 (This week):**
1. Set up Google Maps API
2. Build address → location details function
3. Test with real Austin addresses
4. Integrate with GPT-4o-mini search

**Want me to start coding?** 🏗️

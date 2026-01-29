const LocationService = require('../locationService');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ 
        error: 'Google Places API key not configured',
        details: 'Please add GOOGLE_PLACES_API_KEY environment variable in Vercel settings'
      });
    }

    const locationService = new LocationService(process.env.GOOGLE_PLACES_API_KEY);
    
    const location = await locationService.getLocationDetails(address);
    
    const [permitOffice, specialDistricts] = await Promise.all([
      locationService.findPermitOffice(location),
      locationService.detectSpecialDistricts(location)
    ]);

    res.status(200).json({
      location,
      permitOffice,
      specialDistricts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Location] Error:', error);
    
    // Provide specific guidance for common Google API errors
    let details = 'Failed to lookup location';
    if (error.message.includes('403')) {
      details = 'Google API returned 403. Please ensure:\n' +
                '1. Geocoding API is enabled in Google Cloud Console\n' +
                '2. Places API (New) is enabled\n' +
                '3. API key has no IP/referrer restrictions blocking Vercel\n' +
                '4. Billing is enabled on the Google Cloud project';
    } else if (error.message.includes('429')) {
      details = 'Google API rate limit exceeded. Please check your quota.';
    } else if (error.message.includes('401')) {
      details = 'Invalid Google API key. Please check the key in Vercel settings.';
    }
    
    res.status(500).json({ 
      error: error.message,
      details: details
    });
  }
};

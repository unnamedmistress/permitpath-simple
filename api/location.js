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

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ 
        error: 'Google Maps API key not configured',
        details: 'Please add GOOGLE_MAPS_API_KEY environment variable in Vercel settings'
      });
    }

    const locationService = new LocationService(process.env.GOOGLE_MAPS_API_KEY);
    
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
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to lookup location'
    });
  }
};

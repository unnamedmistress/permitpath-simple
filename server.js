/**
 * PermitPath API Server
 * Location-precise permit lookup system
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const LocationService = require('./locationService');
const PermitService = require('./permitService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Initialize services
const locationService = new LocationService(process.env.GOOGLE_MAPS_API_KEY);
const permitService = new PermitService(process.env.OPENAI_API_KEY);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      location: !!process.env.GOOGLE_MAPS_API_KEY,
      permit: !!process.env.OPENAI_API_KEY
    }
  });
});

/**
 * POST /api/location
 * Get detailed location information from an address
 */
app.post('/api/location', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    console.log(`[Location] Looking up: ${address}`);

    // Get location details
    const location = await locationService.getLocationDetails(address);
    
    // Find permit office (parallel)
    const [permitOffice, specialDistricts] = await Promise.all([
      locationService.findPermitOffice(location),
      locationService.detectSpecialDistricts(location)
    ]);

    const result = {
      location,
      permitOffice,
      specialDistricts,
      timestamp: new Date().toISOString()
    };

    console.log(`[Location] Found: ${location.fullAddress}`);
    console.log(`[Location] Jurisdiction: ${location.likelyCityLimits ? location.city : location.county}`);

    res.json(result);
  } catch (error) {
    console.error('[Location] Error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to lookup location. Please check the address and try again.'
    });
  }
});

/**
 * POST /api/permit
 * Get permit requirements for a specific location and project
 */
app.post('/api/permit', async (req, res) => {
  try {
    const { question, projectType, location, permitOffice, specialDistricts } = req.body;

    if (!question || !projectType || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields: question, projectType, location' 
      });
    }

    console.log(`[Permit] Question: ${question}`);
    console.log(`[Permit] Project: ${projectType}`);
    console.log(`[Permit] Location: ${location.fullAddress}`);

    // Validate project type
    const validatedProjectType = permitService.validateProjectType(projectType);

    // Get permit answer
    const result = await permitService.getPermitAnswer(
      question,
      validatedProjectType,
      location,
      permitOffice,
      specialDistricts
    );

    console.log(`[Permit] Answer generated (${result.usage.totalTokens} tokens, ${result.usage.estimatedCost.formatted})`);

    res.json(result);
  } catch (error) {
    console.error('[Permit] Error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to get permit answer. Please try again.'
    });
  }
});

/**
 * POST /api/permit/full
 * Combined endpoint: location lookup + permit query in one call
 */
app.post('/api/permit/full', async (req, res) => {
  try {
    const { address, question, projectType } = req.body;

    if (!address || !question || !projectType) {
      return res.status(400).json({ 
        error: 'Missing required fields: address, question, projectType' 
      });
    }

    console.log(`[Full] Address: ${address}`);
    console.log(`[Full] Question: ${question}`);
    console.log(`[Full] Project: ${projectType}`);

    // Step 1: Get location details
    const location = await locationService.getLocationDetails(address);
    console.log(`[Full] Location found: ${location.fullAddress}`);

    // Step 2: Get permit office and special districts (parallel)
    const [permitOffice, specialDistricts] = await Promise.all([
      locationService.findPermitOffice(location),
      locationService.detectSpecialDistricts(location)
    ]);

    // Step 3: Get permit answer
    const validatedProjectType = permitService.validateProjectType(projectType);
    const permitResult = await permitService.getPermitAnswer(
      question,
      validatedProjectType,
      location,
      permitOffice,
      specialDistricts
    );

    console.log(`[Full] Complete! Cost: ${permitResult.usage.estimatedCost.formatted}`);

    res.json({
      location,
      permitOffice,
      specialDistricts,
      permit: permitResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Full] Error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to process permit request. Please try again.'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 PermitPath API Server');
  console.log('========================');
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🗺️  Google Maps API: ${process.env.GOOGLE_MAPS_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🤖 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log('   GET  /api/health');
  console.log('   POST /api/location');
  console.log('   POST /api/permit');
  console.log('   POST /api/permit/full');
  console.log('');
  
  if (!process.env.GOOGLE_MAPS_API_KEY || !process.env.OPENAI_API_KEY) {
    console.log('⚠️  WARNING: API keys not configured!');
    console.log('   Copy .env.example to .env and add your keys.');
    console.log('');
  }
});

module.exports = app;

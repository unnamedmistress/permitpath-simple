/**
 * Simple API Test Script
 * Run with: node test-api.js
 */

require('dotenv').config();

const testAddress = process.argv[2] || '1810 Barton Springs Rd, Austin, TX';

async function testAPI() {
  console.log('🧪 Testing PermitPath API\n');
  
  // Check environment
  console.log('📋 Environment Check:');
  console.log(`   OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Google Maps Key: ${process.env.GOOGLE_MAPS_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log('');
  
  if (!process.env.OPENAI_API_KEY || !process.env.GOOGLE_MAPS_API_KEY) {
    console.log('❌ API keys not configured!');
    console.log('   Copy .env.example to .env and add your keys.\n');
    process.exit(1);
  }
  
  // Test location service
  console.log('🗺️  Testing Location Service...');
  console.log(`   Address: ${testAddress}`);
  
  try {
    const LocationService = require('./locationService');
    const locationService = new LocationService(process.env.GOOGLE_MAPS_API_KEY);
    
    const location = await locationService.getLocationDetails(testAddress);
    console.log(`   ✅ Found: ${location.fullAddress}`);
    console.log(`   📍 Coordinates: ${location.lat}, ${location.lng}`);
    console.log(`   🏛️  Jurisdiction: ${location.likelyCityLimits ? location.city : location.county}`);
    
    // Test permit office
    console.log('\n🏢 Finding Permit Office...');
    const permitOffice = await locationService.findPermitOffice(location);
    if (permitOffice) {
      console.log(`   ✅ Found: ${permitOffice.name}`);
      console.log(`   📍 ${permitOffice.address}`);
      console.log(`   📞 ${permitOffice.phone}`);
    } else {
      console.log('   ⚠️  No permit office found');
    }
    
    // Test special districts
    console.log('\n🏛️  Checking Special Districts...');
    const districts = await locationService.detectSpecialDistricts(location);
    if (districts.length > 0) {
      districts.forEach(d => {
        console.log(`   ⚠️  ${d.name} - ${d.note}`);
      });
    } else {
      console.log('   ✅ No special districts detected');
    }
    
    // Test permit service
    console.log('\n🤖 Testing Permit Service...');
    const PermitService = require('./permitService');
    const permitService = new PermitService(process.env.OPENAI_API_KEY);
    
    console.log('   Asking: "Do I need a permit for a 7-foot fence?"');
    const result = await permitService.getPermitAnswer(
      'Do I need a permit?',
      'fence - 7 feet tall',
      location,
      permitOffice,
      districts
    );
    
    console.log(`   ✅ Answer received (${result.usage.totalTokens} tokens)`);
    console.log(`   💰 Cost: ${result.usage.estimatedCost.formatted}`);
    console.log('\n📋 Answer:');
    console.log('   ' + result.answer.split('\n').join('\n   '));
    
    console.log('\n✅ All tests passed!\n');
    
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}\n`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testAPI();

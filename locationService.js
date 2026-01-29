/**
 * Location Service - Google Places API Integration
 * Provides precise location details for permit queries
 */

const { Client } = require('@googlemaps/google-maps-services-js');

class LocationService {
  constructor(apiKey) {
    this.client = new Client({});
    this.apiKey = apiKey;
  }

  /**
   * Get detailed location information from an address
   */
  async getLocationDetails(address) {
    try {
      // Step 1: Geocode the address
      const geocodeResponse = await this.client.geocode({
        params: {
          address: address,
          key: this.apiKey
        }
      });

      if (geocodeResponse.data.results.length === 0) {
        throw new Error('Address not found');
      }

      const result = geocodeResponse.data.results[0];
      const components = result.address_components;

      // Step 2: Extract components
      const location = {
        fullAddress: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        placeId: result.place_id,
        
        // Extract jurisdiction details
        streetNumber: this.extractComponent(components, 'street_number'),
        street: this.extractComponent(components, 'route'),
        neighborhood: this.extractComponent(components, 'neighborhood'),
        city: this.extractComponent(components, 'locality'),
        county: this.extractComponent(components, 'administrative_area_level_2'),
        state: this.extractComponent(components, 'administrative_area_level_1'),
        stateShort: this.extractComponent(components, 'administrative_area_level_1', 'short'),
        zipCode: this.extractComponent(components, 'postal_code'),
        country: this.extractComponent(components, 'country'),
        
        // Metadata
        locationType: result.geometry.location_type,
        types: result.types
      };

      // Step 3: Check if in city limits (heuristic)
      location.likelyCityLimits = this.isLikelyCityLimits(result);

      return location;
    } catch (error) {
      console.error('Location lookup error:', error);
      throw new Error(`Failed to lookup address: ${error.message}`);
    }
  }

  /**
   * Find the nearest permit office
   */
  async findPermitOffice(location) {
    try {
      const jurisdiction = location.likelyCityLimits ? location.city : location.county;
      const searchQuery = `building permit office ${jurisdiction} ${location.stateShort}`;

      const searchResponse = await this.client.findPlaceFromText({
        params: {
          input: searchQuery,
          inputtype: 'textquery',
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'place_id'
          ],
          locationbias: `point:${location.lat},${location.lng}`,
          key: this.apiKey
        }
      });

      if (searchResponse.data.candidates.length === 0) {
        return null;
      }

      const office = searchResponse.data.candidates[0];

      // Get detailed info (phone, website, hours)
      const detailsResponse = await this.client.placeDetails({
        params: {
          place_id: office.place_id,
          fields: [
            'name',
            'formatted_address',
            'formatted_phone_number',
            'website',
            'opening_hours',
            'geometry'
          ],
          key: this.apiKey
        }
      });

      const details = detailsResponse.data.result;

      return {
        name: details.name,
        address: details.formatted_address,
        phone: details.formatted_phone_number || 'Not available',
        website: details.website || null,
        hours: details.opening_hours?.weekday_text || null,
        location: {
          lat: details.geometry.location.lat,
          lng: details.geometry.location.lng
        },
        distanceMiles: this.calculateDistance(
          location.lat,
          location.lng,
          details.geometry.location.lat,
          details.geometry.location.lng
        )
      };
    } catch (error) {
      console.error('Permit office lookup error:', error);
      return null;
    }
  }

  /**
   * Check for special districts (historic, HOA, etc.)
   */
  async detectSpecialDistricts(location) {
    const districts = [];

    try {
      // Search for historic districts nearby
      const historicSearch = await this.client.findPlaceFromText({
        params: {
          input: `historic district ${location.neighborhood || location.city} ${location.stateShort}`,
          inputtype: 'textquery',
          fields: ['name', 'geometry', 'types'],
          locationbias: `point:${location.lat},${location.lng}`,
          key: this.apiKey
        }
      });

      if (historicSearch.data.candidates.length > 0) {
        const historic = historicSearch.data.candidates[0];
        const distance = this.calculateDistance(
          location.lat,
          location.lng,
          historic.geometry.location.lat,
          historic.geometry.location.lng
        );

        // Only include if within 0.5 miles
        if (distance < 0.5) {
          districts.push({
            type: 'historic',
            name: historic.name,
            requiresReview: true,
            note: 'Additional design review may be required'
          });
        }
      }
    } catch (error) {
      console.error('Special district detection error:', error);
    }

    return districts;
  }

  /**
   * Extract address component by type
   */
  extractComponent(components, type, format = 'long') {
    const comp = components.find(c => c.types.includes(type));
    if (!comp) return null;
    return format === 'short' ? comp.short_name : comp.long_name;
  }

  /**
   * Heuristic to determine if address is likely in city limits
   */
  isLikelyCityLimits(geocodeResult) {
    const types = geocodeResult.types;
    // If result type includes 'street_address' or 'premise' in a city, likely in limits
    // If it's 'route' or 'intersection', less certain
    return types.includes('street_address') || types.includes('premise');
  }

  /**
   * Calculate distance between two points in miles
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
}

module.exports = LocationService;

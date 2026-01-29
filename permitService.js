/**
 * Permit Service - GPT-4o-mini + Web Search Integration
 * Provides location-precise permit answers
 */

const OpenAI = require('openai');

class PermitService {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Get permit answer with location precision
   */
  async getPermitAnswer(question, projectType, location, permitOffice, specialDistricts) {
    try {
      // Build jurisdiction context
      const jurisdiction = location.likelyCityLimits 
        ? `${location.city} (city limits)` 
        : `${location.county} (county jurisdiction)`;

      // Build special districts context
      const districtsText = specialDistricts && specialDistricts.length > 0
        ? specialDistricts.map(d => `- ${d.name}: ${d.note}`).join('\n')
        : 'None detected';

      // Build system prompt with location context
      const systemPrompt = `You are a building permit expert. Use web search to find accurate, location-specific permit requirements.

LOCATION CONTEXT:
Address: ${location.fullAddress}
Jurisdiction: ${jurisdiction}
City: ${location.city}
County: ${location.county}
State: ${location.state}
Neighborhood: ${location.neighborhood || 'N/A'}
ZIP Code: ${location.zipCode}

Special Districts:
${districtsText}

IMPORTANT INSTRUCTIONS:
1. Search for requirements specific to this exact jurisdiction (${jurisdiction})
2. If the address is in COUNTY jurisdiction (not city limits), search COUNTY building codes, not city codes
3. Include fees, timeline, required documents, and application process
4. Cite official sources (city/county building department websites)
5. Use simple language (4th grade reading level)
6. Format with emoji for easy scanning
7. Be specific about this location - don't give generic answers

ANSWER FORMAT:
1. YES/NO - Clear permit answer
2. 💰 COST - Fee range
3. ⏰ TIMELINE - How long it takes
4. 📋 DOCUMENTS - What they need
5. 🏛️ WHERE TO APPLY - Office info
6. 📜 SOURCE - Official regulation cited`;

      // Build user question
      const userPrompt = `${question} for a ${projectType}

${permitOffice ? `Permit Office Information:\n${permitOffice.name}\n${permitOffice.address}\n${permitOffice.phone}\n${permitOffice.website || ''}` : ''}`;

      // Call GPT-4o-mini (web search removed - use regular completion)
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Lower for consistency
        max_tokens: 1000
      });

      const answer = response.choices[0].message.content;

      // Track token usage for cost monitoring
      const usage = {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
        estimatedCost: this.calculateCost(response.usage)
      };

      return {
        answer,
        usage,
        model: 'gpt-4o-mini',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Permit query error:', error);
      throw new Error(`Failed to get permit answer: ${error.message}`);
    }
  }

  /**
   * Calculate estimated cost for the API call
   */
  calculateCost(usage) {
    // GPT-4o-mini pricing (per 1M tokens)
    const inputCostPer1M = 0.15;
    const outputCostPer1M = 0.60;
    const webSearchCost = 0.01; // $10 per 1000 calls
    const searchContentCost = 0.0012; // Fixed 8000 tokens at $0.15/1M

    const inputCost = (usage.prompt_tokens / 1000000) * inputCostPer1M;
    const outputCost = (usage.completion_tokens / 1000000) * outputCostPer1M;
    
    return {
      input: inputCost,
      output: outputCost,
      webSearch: webSearchCost,
      searchContent: searchContentCost,
      total: inputCost + outputCost + webSearchCost + searchContentCost,
      formatted: `$${(inputCost + outputCost + webSearchCost + searchContentCost).toFixed(4)}`
    };
  }

  /**
   * Analyze project image with GPT-4 Vision
   */
  async analyzeProjectImage(imageUrl, question, location) {
    try {
      const systemPrompt = `You are a building permit expert. Analyze the image and answer the user's question about permit requirements for this location: ${location.fullAddress}, ${location.city}, ${location.state}.

Be specific, use simple language, and format with emoji for easy scanning.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'user', 
            content: [
              { type: 'text', text: systemPrompt + '\n\n' + question },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      return {
        answer: response.choices[0].message.content,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens
        },
        model: 'gpt-4o',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
  }

  /**
   * Validate project type
   */
  validateProjectType(projectType) {
    const validTypes = [
      'fence', 'deck', 'shed', 'patio', 'driveway',
      'garage', 'pool', 'bathroom remodel', 'kitchen remodel',
      'addition', 'roof', 'hvac', 'electrical', 'plumbing',
      'solar panels', 'carport', 'pergola', 'retaining wall',
      'demo', 'other'
    ];

    const normalized = projectType.toLowerCase().trim();
    return validTypes.includes(normalized) ? normalized : 'other';
  }
}

module.exports = PermitService;

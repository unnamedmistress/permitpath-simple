const PermitService = require('../permitService');

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
    const { imageUrl, question, location } = req.body;

    if (!imageUrl || !question || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields: imageUrl, question, location' 
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        details: 'Please add OPENAI_API_KEY environment variable in Vercel settings'
      });
    }

    const permitService = new PermitService(process.env.OPENAI_API_KEY);
    
    const result = await permitService.analyzeProjectImage(imageUrl, question, location);

    res.status(200).json(result);
  } catch (error) {
    console.error('[Permit Image] Error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to analyze project image'
    });
  }
};

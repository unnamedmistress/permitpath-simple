module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      location: !!process.env.GOOGLE_MAPS_API_KEY,
      permit: !!process.env.OPENAI_API_KEY
    }
  });
};

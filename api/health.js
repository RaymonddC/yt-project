module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  const payload = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      youtubeAPI: !!process.env.YOUTUBE_API_KEY,
      openaiAPI: !!process.env.OPENAI_API_KEY,
    },
  };

  res.statusCode = 200;
  res.end(JSON.stringify(payload));
};

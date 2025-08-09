const YouTubeAPI = require('../src/youtube-api');
const CommentAnalyzer = require('../src/comment-analyzer');

const youtubeAPI = new YouTubeAPI(process.env.YOUTUBE_API_KEY);
const commentAnalyzer = new CommentAnalyzer(process.env.OPENAI_API_KEY);

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 10 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        const parsed = data ? JSON.parse(data) : {};
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    const { url, maxComments = 500 } = await readJsonBody(req);

    if (!url) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'YouTube URL is required' }));
    }

    const videoId = youtubeAPI.extractVideoId(url);
    if (!videoId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Invalid YouTube URL' }));
    }

    const videoInfo = await youtubeAPI.getVideoInfo(videoId);
    const comments = await youtubeAPI.getAllComments(videoId, maxComments);

    if (comments.length === 0) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'No comments found for this video. Comments may be disabled or the video may have no comments.' }));
    }

    const analysis = await commentAnalyzer.analyzeComments(comments, videoInfo.title);
    const videoIdeas = await commentAnalyzer.generateVideoIdeas(analysis);
    const formattedResults = commentAnalyzer.formatAnalysisForDisplay(analysis, videoIdeas);

    const response = { videoInfo, analysis: formattedResults, success: true };
    res.statusCode = 200;
    return res.end(JSON.stringify(response));
  } catch (error) {
    console.error('Analysis error:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: error.message || 'An error occurred during analysis', success: false }));
  }
};

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const YouTubeAPI = require('./src/youtube-api');
const CommentAnalyzer = require('./src/comment-analyzer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const youtubeAPI = new YouTubeAPI(process.env.YOUTUBE_API_KEY);
const commentAnalyzer = new CommentAnalyzer(process.env.OPENAI_API_KEY);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { url, maxComments = 500 } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = youtubeAPI.extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    console.log(`Starting analysis for video: ${videoId}`);
    
    const videoInfo = await youtubeAPI.getVideoInfo(videoId);
    console.log(`Video info retrieved: ${videoInfo.title}`);
    
    const comments = await youtubeAPI.getAllComments(videoId, maxComments);
    console.log(`Retrieved ${comments.length} comments`);
    
    if (comments.length === 0) {
      return res.status(400).json({ 
        error: 'No comments found for this video. Comments may be disabled or the video may have no comments.' 
      });
    }

    const analysis = await commentAnalyzer.analyzeComments(comments, videoInfo.title);
    console.log('Comment analysis completed');
    
    const videoIdeas = await commentAnalyzer.generateVideoIdeas(analysis);
    console.log('Video ideas generated');
    
    const formattedResults = commentAnalyzer.formatAnalysisForDisplay(analysis, videoIdeas);
    
    const response = {
      videoInfo,
      analysis: formattedResults,
      success: true
    };

    res.json(response);
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred during analysis',
      success: false 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      youtubeAPI: !!process.env.YOUTUBE_API_KEY,
      openaiAPI: !!process.env.OPENAI_API_KEY
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 YouTube Comment Analyzer running on port ${PORT}`);
  console.log(`📊 Visit http://localhost:${PORT} to start analyzing comments`);
  
  if (!process.env.YOUTUBE_API_KEY) {
    console.warn('⚠️  YOUTUBE_API_KEY not set - please add it to your .env file');
  }
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not set - please add it to your .env file');
  }
});
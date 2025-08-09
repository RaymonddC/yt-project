const OpenAI = require('openai');

class CommentAnalyzer {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeComments(comments, videoTitle) {
    if (!comments || comments.length === 0) {
      throw new Error('No comments to analyze');
    }

    const commentTexts = comments.map(c => c.text).slice(0, 200);
    const sampleComments = commentTexts.join('\n---\n');

    const analysisPrompt = `
Analyze these YouTube comments for a video titled "${videoTitle}". 

Comments:
${sampleComments}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "frequentQuestions": [
    {"question": "specific question", "frequency": number, "examples": ["comment1", "comment2"]}
  ],
  "painPoints": [
    {"issue": "specific problem", "severity": "high|medium|low", "examples": ["comment1", "comment2"]}
  ],
  "contentRequests": [
    {"topic": "requested topic", "demand": "high|medium|low", "examples": ["comment1", "comment2"]}
  ],
  "sentiment": {
    "overall": "positive|negative|neutral|mixed",
    "breakdown": {
      "excited": number,
      "frustrated": number,
      "confused": number,
      "satisfied": number,
      "grateful": number
    }
  },
  "learningTopics": [
    {"topic": "topic name", "interest": "high|medium|low", "examples": ["comment1", "comment2"]}
  ],
  "misconceptions": [
    {"misconception": "what people got wrong", "clarification": "what should be explained", "examples": ["comment1", "comment2"]}
  ],
  "themes": [
    {"theme": "main theme", "prevalence": "high|medium|low", "description": "brief description"}
  ]
}

Focus on actionable insights that would help a content creator make better videos. Be specific and concrete.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            role: "system",
            content: "You are an expert content strategist who analyzes YouTube comments to help creators understand their audience and generate video ideas. Provide detailed, actionable insights in valid JSON format."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      const analysisText = response.choices[0].message.content;
      
      try {
        // Clean the response text to handle markdown code blocks
        const cleanedText = analysisText
          .replace(/```json\s*/g, '')
          .replace(/```\s*$/g, '')
          .trim();
        
        const analysis = JSON.parse(cleanedText);
        
        analysis.metadata = {
          totalComments: comments.length,
          analyzedComments: Math.min(commentTexts.length, 200),
          videoTitle: videoTitle,
          analyzedAt: new Date().toISOString()
        };

        return analysis;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('Failed to parse analysis results');
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  async generateVideoIdeas(analysis) {
    const ideasPrompt = `
Based on this comment analysis, generate 8-12 specific, actionable YouTube video ideas that would serve this audience well.

Analysis Summary:
- Frequent Questions: ${JSON.stringify(analysis.frequentQuestions?.slice(0, 3))}
- Pain Points: ${JSON.stringify(analysis.painPoints?.slice(0, 3))}
- Content Requests: ${JSON.stringify(analysis.contentRequests?.slice(0, 3))}
- Learning Topics: ${JSON.stringify(analysis.learningTopics?.slice(0, 3))}
- Misconceptions: ${JSON.stringify(analysis.misconceptions?.slice(0, 2))}

Generate video ideas in JSON format:
{
  "videoIdeas": [
    {
      "title": "Specific, clickable video title",
      "type": "FAQ|Tutorial|Deep Dive|Problem Solver|Myth Buster|Follow-up",
      "description": "2-3 sentence description of what the video would cover",
      "estimatedInterest": "high|medium|low",
      "reasoning": "Why this video would perform well based on the comments",
      "keyPoints": ["point 1", "point 2", "point 3"]
    }
  ]
}

Make titles engaging and specific. Focus on solving real problems mentioned in the comments.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a YouTube content strategist who creates winning video ideas based on audience feedback. Generate specific, actionable video concepts that would get high engagement."
          },
          {
            role: "user",
            content: ideasPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const ideasText = response.choices[0].message.content;
      
      try {
        // Clean the response text to handle markdown code blocks
        const cleanedText = ideasText
          .replace(/```json\s*/g, '')
          .replace(/```\s*$/g, '')
          .trim();
        
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse video ideas:', parseError);
        throw new Error('Failed to generate video ideas');
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Video idea generation failed: ${error.message}`);
    }
  }

  formatAnalysisForDisplay(analysis, videoIdeas) {
    return {
      overview: {
        totalComments: analysis.metadata.totalComments,
        analyzedComments: analysis.metadata.analyzedComments,
        overallSentiment: analysis.sentiment.overall,
        videoTitle: analysis.metadata.videoTitle
      },
      insights: {
        topQuestions: analysis.frequentQuestions?.slice(0, 5) || [],
        mainPainPoints: analysis.painPoints?.slice(0, 5) || [],
        requestedTopics: analysis.contentRequests?.slice(0, 5) || [],
        learningInterests: analysis.learningTopics?.slice(0, 5) || [],
        commonMisconceptions: analysis.misconceptions?.slice(0, 3) || []
      },
      sentiment: analysis.sentiment,
      videoIdeas: videoIdeas.videoIdeas || [],
      themes: analysis.themes || []
    };
  }
}

module.exports = CommentAnalyzer;
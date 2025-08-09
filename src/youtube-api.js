const { google } = require('googleapis');

class YouTubeAPI {
  constructor(apiKey) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });
  }

  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async getVideoInfo(videoId) {
    try {
      const response = await this.youtube.videos.list({
        part: 'snippet,statistics',
        id: videoId
      });

      if (response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = response.data.items[0];
      return {
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics.viewCount),
        likeCount: parseInt(video.statistics.likeCount),
        commentCount: parseInt(video.statistics.commentCount)
      };
    } catch (error) {
      throw new Error(`Failed to get video info: ${error.message}`);
    }
  }

  async getAllComments(videoId, maxComments = 1000) {
    const comments = [];
    let nextPageToken = null;
    let requestCount = 0;
    const maxRequests = Math.ceil(maxComments / 100);

    try {
      do {
        const response = await this.youtube.commentThreads.list({
          part: 'snippet',
          videoId: videoId,
          maxResults: Math.min(100, maxComments - comments.length),
          order: 'relevance',
          pageToken: nextPageToken
        });

        for (const item of response.data.items) {
          const comment = item.snippet.topLevelComment.snippet;
          comments.push({
            text: comment.textDisplay,
            author: comment.authorDisplayName,
            likeCount: comment.likeCount,
            publishedAt: comment.publishedAt,
            updatedAt: comment.updatedAt
          });

          if (comments.length >= maxComments) break;
        }

        nextPageToken = response.data.nextPageToken;
        requestCount++;
        
      } while (nextPageToken && comments.length < maxComments && requestCount < maxRequests);

      return comments;
    } catch (error) {
      if (error.message.includes('disabled')) {
        throw new Error('Comments are disabled for this video');
      }
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }
  }

  async getCommentsWithReplies(videoId, maxComments = 500) {
    const allComments = [];
    let nextPageToken = null;
    let requestCount = 0;
    const maxRequests = Math.ceil(maxComments / 100);

    try {
      do {
        const response = await this.youtube.commentThreads.list({
          part: 'snippet,replies',
          videoId: videoId,
          maxResults: Math.min(100, maxComments - allComments.length),
          order: 'relevance',
          pageToken: nextPageToken
        });

        for (const item of response.data.items) {
          const topComment = item.snippet.topLevelComment.snippet;
          const commentData = {
            text: topComment.textDisplay,
            author: topComment.authorDisplayName,
            likeCount: topComment.likeCount,
            publishedAt: topComment.publishedAt,
            isReply: false
          };
          
          allComments.push(commentData);

          if (item.replies) {
            for (const reply of item.replies.comments) {
              const replySnippet = reply.snippet;
              allComments.push({
                text: replySnippet.textDisplay,
                author: replySnippet.authorDisplayName,
                likeCount: replySnippet.likeCount,
                publishedAt: replySnippet.publishedAt,
                isReply: true
              });

              if (allComments.length >= maxComments) break;
            }
          }

          if (allComments.length >= maxComments) break;
        }

        nextPageToken = response.data.nextPageToken;
        requestCount++;
        
      } while (nextPageToken && allComments.length < maxComments && requestCount < maxRequests);

      return allComments;
    } catch (error) {
      if (error.message.includes('disabled')) {
        throw new Error('Comments are disabled for this video');
      }
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }
  }
}

module.exports = YouTubeAPI;
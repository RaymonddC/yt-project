class YouTubeAnalyzer {
    constructor() {
        this.initializeEventListeners();
        this.currentResults = null;
    }

    initializeEventListeners() {
        const form = document.getElementById('analyzeForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const url = document.getElementById('youtubeUrl').value;
        const maxComments = parseInt(document.getElementById('maxComments').value);
        
        if (!url) {
            this.showError('Please enter a YouTube URL');
            return;
        }

        try {
            this.showLoading();
            await this.analyzeVideo(url, maxComments);
        } catch (error) {
            this.showError(error.message);
            this.hideLoading();
        }
    }

    async analyzeVideo(url, maxComments) {
        this.updateLoadingStatus('Connecting to YouTube API...', 1);
        
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url, maxComments })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Analysis failed');
            }

            this.updateLoadingStatus('Processing comments with AI...', 2);
            
            // Add a small delay to show the loading states
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.updateLoadingStatus('Generating video ideas...', 3);
            
            const data = await response.json();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.currentResults = data;
            this.displayResults(data);
            this.hideLoading();
            
        } catch (error) {
            throw error;
        }
    }

    showLoading() {
        document.getElementById('loadingSection').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
        this.resetLoadingSteps();
    }

    hideLoading() {
        document.getElementById('loadingSection').style.display = 'none';
    }

    updateLoadingStatus(message, step) {
        document.getElementById('loadingStatus').textContent = message;
        
        // Reset all steps
        for (let i = 1; i <= 3; i++) {
            document.getElementById(`step${i}`).classList.remove('active');
        }
        
        // Activate current step
        if (step) {
            document.getElementById(`step${step}`).classList.add('active');
        }
    }

    resetLoadingSteps() {
        for (let i = 1; i <= 3; i++) {
            document.getElementById(`step${i}`).classList.remove('active');
        }
    }

    displayResults(data) {
        const { videoInfo, analysis } = data;
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        
        // Update video info
        document.getElementById('videoTitle').textContent = videoInfo.title;
        document.getElementById('videoStats').innerHTML = `
            <strong>${videoInfo.channelTitle}</strong> • 
            ${this.formatNumber(videoInfo.viewCount)} views • 
            ${this.formatNumber(videoInfo.likeCount)} likes • 
            ${this.formatNumber(videoInfo.commentCount)} comments
        `;
        
        // Update overview cards
        document.getElementById('totalComments').textContent = this.formatNumber(analysis.overview.analyzedComments);
        document.getElementById('overallSentiment').textContent = this.capitalizeSentiment(analysis.overview.overallSentiment);
        document.getElementById('videoIdeasCount').textContent = analysis.videoIdeas.length;
        
        // Update insights
        this.displayFrequentQuestions(analysis.insights.topQuestions);
        this.displayPainPoints(analysis.insights.mainPainPoints);
        this.displayContentRequests(analysis.insights.requestedTopics);
        this.displayLearningInterests(analysis.insights.learningInterests);
        this.displayMisconceptions(analysis.insights.commonMisconceptions);
        this.displaySentimentBreakdown(analysis.sentiment);
        
        // Display video ideas
        this.displayVideoIdeas(analysis.videoIdeas);
        
        // Scroll to results
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }

    displayFrequentQuestions(questions) {
        const container = document.getElementById('frequentQuestions');
        
        if (!questions || questions.length === 0) {
            container.innerHTML = '<p>No frequent questions identified.</p>';
            return;
        }
        
        container.innerHTML = questions.map(q => `
            <div class="insight-item">
                <h4>${q.question}</h4>
                <p>Asked ${q.frequency} times</p>
                <div class="insight-examples">Examples: "${q.examples?.slice(0, 2).join('", "')}"</div>
            </div>
        `).join('');
    }

    displayPainPoints(painPoints) {
        const container = document.getElementById('painPoints');
        
        if (!painPoints || painPoints.length === 0) {
            container.innerHTML = '<p>No major pain points identified.</p>';
            return;
        }
        
        container.innerHTML = painPoints.map(p => `
            <div class="insight-item">
                <h4>${p.issue}</h4>
                <p>Severity: <strong>${p.severity}</strong></p>
                <div class="insight-examples">Examples: "${p.examples?.slice(0, 2).join('", "')}"</div>
            </div>
        `).join('');
    }

    displayContentRequests(requests) {
        const container = document.getElementById('contentRequests');
        
        if (!requests || requests.length === 0) {
            container.innerHTML = '<p>No specific content requests found.</p>';
            return;
        }
        
        container.innerHTML = requests.map(r => `
            <div class="insight-item">
                <h4>${r.topic}</h4>
                <p>Demand level: <strong>${r.demand}</strong></p>
                <div class="insight-examples">Examples: "${r.examples?.slice(0, 2).join('", "')}"</div>
            </div>
        `).join('');
    }

    displayLearningInterests(interests) {
        const container = document.getElementById('learningInterests');
        
        if (!interests || interests.length === 0) {
            container.innerHTML = '<p>No specific learning interests identified.</p>';
            return;
        }
        
        container.innerHTML = interests.map(i => `
            <div class="insight-item">
                <h4>${i.topic}</h4>
                <p>Interest level: <strong>${i.interest}</strong></p>
                <div class="insight-examples">Examples: "${i.examples?.slice(0, 2).join('", "')}"</div>
            </div>
        `).join('');
    }

    displayMisconceptions(misconceptions) {
        const container = document.getElementById('misconceptions');
        
        if (!misconceptions || misconceptions.length === 0) {
            container.innerHTML = '<p>No common misconceptions identified.</p>';
            return;
        }
        
        container.innerHTML = misconceptions.map(m => `
            <div class="insight-item">
                <h4>${m.misconception}</h4>
                <p><strong>Clarification needed:</strong> ${m.clarification}</p>
                <div class="insight-examples">Examples: "${m.examples?.slice(0, 2).join('", "')}"</div>
            </div>
        `).join('');
    }

    displaySentimentBreakdown(sentiment) {
        const container = document.getElementById('sentimentBreakdown');
        
        if (!sentiment || !sentiment.breakdown) {
            container.innerHTML = '<p>Sentiment analysis not available.</p>';
            return;
        }
        
        const total = Object.values(sentiment.breakdown).reduce((sum, val) => sum + val, 0);
        
        container.innerHTML = Object.entries(sentiment.breakdown)
            .map(([emotion, count]) => {
                const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                return `
                    <div class="sentiment-bar">
                        <div class="sentiment-label">${this.capitalize(emotion)}</div>
                        <div class="sentiment-progress">
                            <div class="sentiment-fill" style="width: ${percentage}%"></div>
                        </div>
                        <span>${percentage}%</span>
                    </div>
                `;
            }).join('');
    }

    displayVideoIdeas(videoIdeas) {
        const container = document.getElementById('videoIdeas');
        
        if (!videoIdeas || videoIdeas.length === 0) {
            container.innerHTML = '<p>No video ideas generated.</p>';
            return;
        }
        
        container.innerHTML = videoIdeas.map(idea => `
            <div class="video-idea-card">
                <div class="idea-header">
                    <div class="idea-title">${idea.title}</div>
                    <div class="idea-type">${idea.type}</div>
                </div>
                <div class="idea-description">${idea.description}</div>
                <div class="idea-interest">
                    <span>Interest Level:</span>
                    <span class="interest-level interest-${idea.estimatedInterest}">
                        ${this.capitalize(idea.estimatedInterest)}
                    </span>
                </div>
                <div class="idea-reasoning">${idea.reasoning}</div>
                ${idea.keyPoints ? `
                    <div class="idea-points" style="margin-top: 12px;">
                        <strong>Key Points to Cover:</strong>
                        <ul style="margin: 8px 0 0 20px; color: #94a3b8; font-size: 13px;">
                            ${idea.keyPoints.map(point => `<li style="margin-bottom: 4px;">${point}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    showError(message) {
        // Remove existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<strong>Error:</strong> ${message}`;
        
        const form = document.getElementById('analyzeForm');
        form.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    capitalizeSentiment(sentiment) {
        const sentimentMap = {
            'positive': '😊 Positive',
            'negative': '😟 Negative',
            'neutral': '😐 Neutral',
            'mixed': '🤔 Mixed'
        };
        return sentimentMap[sentiment] || this.capitalize(sentiment);
    }
}

// Initialize the analyzer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.analyzerInstance = new YouTubeAnalyzer();
});
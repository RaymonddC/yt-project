# YouTube Comment Analyzer

Turn YouTube video comments into actionable insights and content ideas. This app fetches comments via the YouTube Data API and uses OpenAI to analyze themes, sentiment, audience needs, and generate video ideas.

## 🚀 Features

- **Comment extraction**: Pulls up to 1,000 comments per video
- **AI analysis**: Themes, frequent questions, pain points, misconceptions, learning interests
- **Sentiment**: Overall and per-emotion breakdown
- **Video ideas**: Specific, actionable titles with descriptions and key points
- **Clean UI**: Responsive interface served from `public/`

## 🧰 Tech Stack

- Node.js (Express)
- YouTube Data API v3 (`googleapis`)
- OpenAI (`openai`)
- Frontend: Vanilla JS + CSS (served statically)

## ✅ Prerequisites

- Node.js 18 or newer
- API keys:
  - YouTube Data API v3 key
  - OpenAI API key

## 🔐 Environment Variables

Create a `.env` file in the project root with:

```
YOUTUBE_API_KEY=your_youtube_api_key
OPENAI_API_KEY=your_openai_api_key
# Optional for local dev
PORT=3000
```

## 📦 Install & Run

```bash
npm install

# Development (auto-restart)
npm run dev

# Production
npm start
```

Open your browser at `http://localhost:${PORT or 3000}`.

## 🧪 How to Use

1. Paste a YouTube video URL in the input field
2. Choose how many comments to analyze (200/500/1000)
3. Click “Analyze Comments”
4. Review insights and generated video ideas

## 🔌 API Endpoints

- `POST /api/analyze`
  - Body: `{ "url": string, "maxComments": number }`
  - Response: `{ videoInfo, analysis, success }`
- `GET /api/health`
  - Response: `{ status, timestamp, services }`

## 📁 Project Structure

```
yt-project/
├── server.js              # Express server: serves UI + API routes
├── src/
│   ├── youtube-api.js      # YouTube Data API integration
│   └── comment-analyzer.js # OpenAI-powered analysis + idea generation
├── public/
│   ├── index.html          # UI
│   ├── styles.css          # Styling
│   └── script.js           # Frontend logic
├── package.json
└── README.md
```

## 🖥️ Local Development Notes

- Ensure both `YOUTUBE_API_KEY` and `OPENAI_API_KEY` are set before calling `/api/analyze`
- The frontend calls the backend at same-origin `/api/analyze` (no extra config needed)

## ☁️ Deployment

You can deploy this as a standard Node.js web service or as serverless functions.

### Option A: Vercel (Serverless)

Vercel works best with API routes in `api/` (serverless functions) and static files in `public/`.

- Convert `POST /api/analyze` and `GET /api/health` to serverless functions under `api/` that import and reuse logic from `src/`
- Set environment variables in your Vercel project settings:
  - `YOUTUBE_API_KEY`
  - `OPENAI_API_KEY`
- Push your repo to GitHub and import into Vercel

Notes:

- Keep the frontend fetch URL as `/api/analyze` (same origin)
- Long-running calls may need function timeout adjustments

### Option B: Any Node Host (Render/Railway/etc.)

- Build: `npm ci --omit=dev`
- Start: `npm start`
- Env vars: `YOUTUBE_API_KEY`, `OPENAI_API_KEY`
- Health check path: `/api/health`

## ⚠️ Quotas, Costs, and Limits

- YouTube Data API v3 has daily quotas; fetching many comments consumes quota
- OpenAI API usage incurs costs based on tokens; consider reducing `maxComments` or model size

## 🛠️ Troubleshooting

- "Invalid YouTube URL": Ensure the link includes a valid `v` parameter or is a `youtu.be` short link
- "No comments found": Comments may be disabled or the video has none
- OpenAI errors: Verify `OPENAI_API_KEY` is set and the account has quota
- CORS: Not required in production when frontend and backend share the same origin

## 📜 License

MIT

---

Built for creators who want data-driven content decisions.

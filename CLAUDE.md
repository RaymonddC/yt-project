# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTube Comment Analyzer - An AI-powered tool that analyzes YouTube video comments to generate actionable content insights and video ideas for creators.

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your API keys:
   - `YOUTUBE_API_KEY`: Get from Google Cloud Console (YouTube Data API v3)
   - `OPENAI_API_KEY`: Get from OpenAI Platform

3. Start development server:
   ```bash
   npm run dev
   ```

4. Start production server:
   ```bash
   npm start
   ```

## Architecture

### Backend (Node.js/Express)
- `server.js`: Main Express server with API endpoints
- `src/youtube-api.js`: YouTube Data API integration for comment extraction
- `src/comment-analyzer.js`: OpenAI integration for comment analysis and video idea generation

### Frontend (Vanilla JS)
- `public/index.html`: Main UI with form and results display
- `public/styles.css`: Professional CSS styling with responsive design
- `public/script.js`: JavaScript for form handling, API calls, and results rendering

### Key Features
- Extracts up to 1000 comments from YouTube videos
- AI analysis identifies: frequent questions, pain points, content requests, sentiment, learning topics, misconceptions
- Generates specific video ideas with titles, descriptions, and estimated interest levels
- Clean, professional interface designed for content creators

## API Endpoints

- `POST /api/analyze`: Analyzes YouTube video comments
  - Body: `{ url: string, maxComments?: number }`
  - Returns: Video info, comment analysis, and generated video ideas

- `GET /api/health`: Health check endpoint

## Common Commands

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm install`: Install dependencies

## Dependencies

### Production
- `express`: Web server framework
- `googleapis`: YouTube Data API client
- `openai`: OpenAI API client
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variable management
- `axios`: HTTP client

### Development
- `nodemon`: Development server with auto-restart
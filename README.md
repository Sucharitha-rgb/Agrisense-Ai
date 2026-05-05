🌾 AgriSense AI

AgriSense AI is an AI-powered smart agriculture platform that helps farmers detect crop diseases, get real-time advisory, and make data-driven decisions using modern AI, edge computing, and cloud technologies.

🚀 Features
🌿 Crop Disease Detection
Upload plant images to detect diseases using AI (vision models)
🤖 AI Farming Assistant
Chat-based advisory system for farmers (multilingual support)
🎤 Voice Interaction
Speech-to-Text (STT) & Text-to-Speech (TTS) using Web Speech API
🌦️ Smart Recommendations
Crop, fertilizer, and treatment suggestions based on conditions
📊 RAG-based Knowledge System
Uses vector search for accurate and contextual answers


🧑‍💻 Tech Stack
🎨 Frontend
React 19
Tailwind CSS 
TypeScript (Strict Mode)
⚙️ Backend / Runtime
TanStack Server Functions (Edge)
Cloudflare 
Supabase (PostgreSQL)
pgvector (768-dimension embeddings)
Supabase Auth
🧠 AI / ML
Lovable AI Gateway
Google Gemini 2.5 Flash / Flash-Lite
Vision-based crop disease detection
Chat advisory system
Embeddings for RAG
Web Speech API
Speech-to-Text (STT)
Text-to-Speech (TTS)
🏗️ Architecture Overview
Frontend (React + TanStack Start)
        ↓
Edge Functions (Cloudflare Workers)
        ↓
AI Gateway (Gemini Models)
        ↓
Supabase (Postgres + pgvector)

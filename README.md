# LLM INSTRUCTIONS
You are a highly efficient coding assistant.
Keep responses clear, concise, and implementation-focused.

Guidelines:
- Always refer to the project description before answering
- When talking about subjects that may have changed(i.e. api), always search the web to get the most recent information before answering
- Prioritize correctness, performance, and simplicity
- Answer directly; avoid unnecessary explanations or filler
- Use code-first responses when appropriate
- Explain why only when it adds real value
- Call out edge cases, complexity, and trade-offs briefly
- Follow best practices and modern conventions
- If something is unclear, ask one short clarifying question(you may ask for code snippets that are needed)
- Prefer actionable solutions over theory

Tone: professional, precise, no fluff.

# lol-coach(project description)
Gaming AI Coach - Project Description
Overview
An AI-powered coaching platform for League of Legends players that provides personalized performance analysis and actionable improvement recommendations based on match history data.
The Problem
League of Legends players want to improve their gameplay and climb the ranked ladder, but struggle to identify their specific weaknesses and mistakes. Professional coaching is expensive ($50-100+/hour), and players often don't know what they're doing wrong or how to fix it.
The Solution
An automated AI coach that analyzes your recent matches using Riot Games API data and provides instant, personalized feedback on:

Mechanical Skills: CS/min, trading patterns, death analysis
Macro Play: Objective control, map presence, rotation timing
Itemization: Build path optimization based on enemy team composition
Champion Mastery: Performance on specific champions, matchup advice
Improvement Tracking: Week-over-week progress metrics

How It Works
User Flow:

User enters their Summoner Name and region
App fetches recent match history via Riot Games API
Match data (kills, deaths, assists, CS, gold, damage, vision, etc.) is sent to Claude AI
AI analyzes performance and generates detailed feedback with specific action items
User sees analysis for each match plus trend analysis over time

Example Output:
📊 Match Analysis - Jinx ADC (Ranked Loss)

🔴 Critical Issues:
- CS: 5.2/min (Target: 7+) → You missed 45 CS in lane phase
- Deaths: 8 (6 before 20min) → Positioning errors in teamfights
- Vision Score: 9 (Very Low) → Buy control wards, average vision placement

⚠️ Build Problems:
- You rushed Runaan's Hurricane vs 3 tanks
- Recommended: Kraken Slayer → Lord Dominik's for armor penetration

✅ What You Did Well:
- 85% kill participation (excellent teamfight presence)
- Highest damage on your team (24,500)
- Good objective focus (participated in 2/3 dragon fights)

💡 Focus This Week:
1. Practice CS drills in practice tool (15min daily)
2. Review deaths - most were overextending without vision
3. Watch for enemy Zed - he killed you 4 times
Tech Stack
Frontend:

React - Modern UI for displaying analyses
Recharts/Chart.js - Data visualizations for performance trends
Tailwind CSS - Clean, responsive design

Backend:

Node.js/Express - API server
Riot Games API - Fetch match history, player stats, champion data
Claude API (Anthropic) or GPT-4 (OpenAI) - AI analysis engine
PostgreSQL - Store user data, match analyses, track improvements over time

APIs & Services:

Riot Games Developer API - Free tier (generous rate limits)
Anthropic Claude API - AI coaching engine (~$5-10/month during dev)

Core Features (MVP - 1-2 Months)
Phase 1: Basic Match Analysis (Week 1-2)

Riot API authentication and data fetching
Parse match data into meaningful metrics
AI prompt engineering for quality feedback
Display single match analysis

Phase 2: Multi-Match Analysis (Week 3)

Analyze last 10-20 matches
Identify patterns and recurring mistakes
Champion-specific insights
Role-specific benchmarking (compare to other ADCs at your rank)

Phase 3: Progress Tracking (Week 4)

Database integration to store historical analyses
Week-over-week improvement metrics
Visual charts showing CS/min, deaths, vision score trends
Achievement system (milestones hit)

Phase 4: Polish & Deploy (Week 5-6)

Responsive UI design
Error handling and edge cases
Deployment (Vercel + Railway/Render)
Documentation and demo video

Stretch Features (If Time Permits)

Pre-Game Coach: Enter matchup, get lane advice before game starts
Champion Recommendations: "You should try these champions based on your playstyle"
Duo Analysis: Compare performance with your duo partner
Custom Training Plans: "This week: Focus on CSing and vision control"
Discord Bot: Get quick match reviews in Discord
Multi-Game Support: Expand to Valorant, CS2, Dota 2

Target Audience

Primary: Bronze-Platinum League players (70% of player base)
Secondary: Any competitive gamer wanting to improve
Demographics: Ages 16-30, existing League of Legends players

Competitive Advantage
Existing tools (iTero, Mobalytics, etc.) are:

Paid subscriptions ($10-20/month)
Overwolf overlays (require desktop app installation)
Focused on in-game overlays, not post-game deep analysis

This app is:

✅ Free to use (ad-supported or freemium model possible later)
✅ Web-based (no downloads, works anywhere)
✅ Conversational AI feedback (explains WHY, not just numbers)
✅ Beginner-friendly (no gaming jargon overload)

Business Model (Optional - For Later)

Free Tier: Last 5 matches, basic analysis
Premium ($5/month): Unlimited matches, trend tracking, custom training plans
Revenue from Ads: Non-intrusive banner ads for free users

Success Metrics

Users can analyze matches within 30 seconds of entering summoner name
AI feedback is actionable (specific drills, not vague advice)
App deployed and accessible via URL
Clean, professional UI (mobile responsive)
Code on GitHub with comprehensive README

Learning Outcomes
By building this project, you'll demonstrate proficiency in:

Full-Stack Development: React frontend + Node.js backend + PostgreSQL database
API Integration: Working with third-party APIs (Riot Games)
AI/ML Application: Prompt engineering, AI API integration (Claude/GPT-4)
Data Analysis: Processing complex JSON, extracting insights
Product Thinking: Solving real user problems, UX design
DevOps: Deployment, environment management, API key security

Timeline Estimate

Weeks 1-2: Backend setup + Riot API integration + AI testing
Week 3: Frontend + match analysis display
Week 4: Database + trend tracking
Week 5-6: Polish, deployment, documentation

Total: 6-8 weeks to production-ready portfolio piece
Why This Project Stands Out

Real-world utility: People will actually use this
Measurable impact: Can track if users actually improve
Growing market: Esports coaching is a billion-dollar industry
AI showcase: Demonstrates practical LLM application beyond chatbots
Portfolio differentiator: Most students build todo apps or weather apps - this is unique
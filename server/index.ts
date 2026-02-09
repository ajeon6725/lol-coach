import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { getMatchData, getProfileData } from "./riot";
import { PlatformRegion, ProfileData } from "./types";
import { loadItemData, getItemName } from "./items";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

interface AnalyzeRequestBody {
  gameName: string;
  tagLine: string;
  region: PlatformRegion;
}

interface ProfileRequestBody {
  gameName: string;
  tagLine: string;
  region: PlatformRegion;
  matchCount?: number;
}

interface CoachChatRequestBody {
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
  playerContext: {
    championName: string;
    role: string;
    stats: {
      avgCS: number;
      avgKDA: number;
      avgVision: number;
      avgDeaths: number;
    };
    matches: any[];
  };
}

// Profile endpoint - Step 2 of user flow
app.post(
  "/api/profile",
  async (req: Request<{}, {}, ProfileRequestBody>, res: Response) => {
    try {
      const { gameName, tagLine, region, matchCount = 10 } = req.body;

      if (!gameName || !tagLine || !region) {
        res.status(400).json({
          error: "Missing required fields: gameName, tagLine, region",
        });
        return;
      }

      const profileData = await getProfileData(
        gameName,
        tagLine,
        region,
        matchCount,
      );
      res.json(profileData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({ error: errorMessage });
    }
  },
);

interface MultiAnalyzeRequestBody {
  gameName: string;
  tagLine: string;
  region: PlatformRegion;
  matches: ProfileData["recentMatches"]; // Client sends pre-filtered matches
}

app.post(
  "/api/analyze-multi",
  async (req: Request<{}, {}, MultiAnalyzeRequestBody>, res: Response) => {
    try {
      const { gameName, tagLine, matches } = req.body;

      if (!matches || matches.length === 0) {
        res.status(400).json({ error: "No matches provided" });
        return;
      }

      // Step 1: Calculate aggregated stats
      const totalGames = matches.length;
      const wins = matches.filter((m) => m.win).length;
      const winRate = (wins / totalGames) * 100;

      const avgCS =
        matches.reduce((sum, m) => sum + m.csPerMin, 0) / totalGames;
      const avgKDA = matches.reduce((sum, m) => sum + m.kda, 0) / totalGames;
      const avgVision =
        matches.reduce((sum, m) => sum + m.visionScore, 0) / totalGames;
      const avgDeaths =
        matches.reduce((sum, m) => sum + m.deaths, 0) / totalGames;

      // Step 2: Build AI prompt
      const prompt = `You are a League of Legends coach analyzing ${totalGames} recent ranked matches.

**Player:** ${gameName}#${tagLine}
**Champion/Role:** ${matches[0].championName} ${matches[0].role}
**Games Analyzed:** ${totalGames}

**Aggregated Performance:**
- Win Rate: ${winRate.toFixed(1)}% (${wins}W ${totalGames - wins}L)
- Average CS/min: ${avgCS.toFixed(1)}
- Average KDA: ${avgKDA.toFixed(2)}
- Average Deaths: ${avgDeaths.toFixed(1)}
- Average Vision Score: ${avgVision.toFixed(1)}

**Individual Match Data:**
${matches
          .slice(0, 10)
          .map(
            (m, i) =>
              `Game ${i + 1}: ${m.win ? "W" : "L"} | ${m.kills}/${m.deaths}/${m.assists} | ${m.csPerMin} CS/min | Vision: ${m.visionScore}`,
          )
          .join("\n")}

Respond ONLY with valid JSON (no markdown, no backticks, no preamble) in this exact structure:

{
  "criticalIssues": [
    {
      "title": "Short title (e.g., CS Deficit)",
      "description": "Specific issue with numbers and impact"
    }
  ],
  "areasToImprove": [
    {
      "title": "Short title",
      "description": "Improvement area with context"
    }
  ],
  "strengths": [
    {
      "title": "Short title",
      "description": "What they're doing well"
    }
  ],
  "weeklyFocus": [
    {
      "drill": "Specific drill with measurable goal"
    }
  ]
}

Requirements:
- 2-3 items per category
- Use specific numbers from the data
- Be direct and actionable
- Focus on highest-impact improvements first`;

      // Step 3: Get AI analysis
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      console.log("Raw AI response:", responseText); // Debug log

      // Parse JSON (strip markdown fences if present)
      let analysisJson;
      try {
        const cleanedText = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        analysisJson = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Cleaned text:", responseText);
        
        // Fallback: return structured placeholder
        analysisJson = {
          criticalIssues: [
            {
              title: "CS Deficit",
              description: `Average CS/min is ${avgCS.toFixed(1)} (target: 7.0). Missing ~${Math.round((7.0 - avgCS) * 30)} CS per game.`
            }
          ],
          areasToImprove: [
            {
              title: "Vision Control",
              description: `Average vision score: ${avgVision.toFixed(1)}. Need to prioritize control wards.`
            }
          ],
          strengths: [
            {
              title: "Win Rate",
              description: `${winRate.toFixed(1)}% win rate shows you're contributing to victories.`
            }
          ],
          weeklyFocus: [
            { drill: "Practice CS drills in practice tool: 75 CS by 10min" },
            { drill: "Buy 2 control wards every recall" },
            { drill: "Review death timers to identify positioning mistakes" }
          ]
        };
      }

      // Step 4: Return response
      res.json({
        aggregatedStats: {
          totalGames,
          winRate: parseFloat(winRate.toFixed(1)),
          avgCS: parseFloat(avgCS.toFixed(1)),
          avgKDA: parseFloat(avgKDA.toFixed(2)),
          avgVision: parseFloat(avgVision.toFixed(1)),
          avgDeaths: parseFloat(avgDeaths.toFixed(1)),
        },
        analysis: analysisJson,
        matches,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Analysis failed";
      res.status(500).json({ error: errorMessage });
    }
  },
);

app.post(
  "/api/coach-chat",
  async (req: Request<{}, {}, CoachChatRequestBody>, res: Response) => {
    try {
      const { message, conversationHistory, playerContext } = req.body;

      if (!message || !playerContext) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Build context-aware prompt
      const systemContext = `You are an expert League of Legends coach having a conversation with a player.

**Player Context:**
- Champion: ${playerContext.championName} ${playerContext.role}
- Average CS/min: ${playerContext.stats.avgCS.toFixed(1)} (target: 7.0)
- Average KDA: ${playerContext.stats.avgKDA.toFixed(2)}
- Average Vision Score: ${playerContext.stats.avgVision.toFixed(1)}
- Average Deaths: ${playerContext.stats.avgDeaths.toFixed(1)}
- Recent Matches: ${playerContext.matches.length} games analyzed

**Your coaching style:**
- Conversational and supportive, not robotic
- Reference specific numbers from their stats when relevant
- Ask follow-up questions to understand root causes
- Give actionable, specific advice (not generic tips)
- Keep responses concise (2-4 sentences unless explaining a complex drill)

**Conversation so far:**
${conversationHistory.map((msg) => `${msg.role === "coach" ? "Coach" : "Player"}: ${msg.content}`).join("\n")}

Player's latest message: "${message}"

Respond as the coach:`;

      const result = await model.generateContent(systemContext);
      const reply = result.response.text();

      res.json({ reply });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Chat failed";
      res.status(500).json({ error: errorMessage });
    }
  },
);

const startServer = async () => {
  await loadItemData();
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
};

startServer();

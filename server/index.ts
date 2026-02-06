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

// Analyze endpoint - Step 4 of user flow (single match analysis for now)
app.post(
  "/api/analyze",
  async (req: Request<{}, {}, AnalyzeRequestBody>, res: Response) => {
    try {
      const { gameName, tagLine, region } = req.body;

      if (!gameName || !tagLine || !region) {
        res.status(400).json({
          error: "Missing required fields: gameName, tagLine, region",
        });
        return;
      }

      // Step 1: Get match data from Riot API
      const matchData = await getMatchData(gameName, tagLine, region);

      // Step 2: Extract player's stats
      const player = matchData.info.participants.find(
        (p) =>
          p.riotIdGameName.toLowerCase() === gameName.toLowerCase() &&
          p.riotIdTagline.toLowerCase() === tagLine.toLowerCase(),
      );

      if (!player) {
        res.status(404).json({ error: "Player not found in match data" });
        return;
      }

      // Step 3: Calculate key metrics
      const totalCS = player.totalMinionsKilled + player.neutralMinionsKilled;
      const gameDurationMin = Math.floor(matchData.info.gameDuration / 60);
      const csPerMin = (totalCS / gameDurationMin).toFixed(1);
      const kda =
        player.deaths === 0
          ? "Perfect"
          : ((player.kills + player.assists) / player.deaths).toFixed(1);
      const items = [
        player.item0,
        player.item1,
        player.item2,
        player.item3,
        player.item4,
        player.item5,
        player.item6,
      ]
        .filter((id) => id !== 0)
        .map((id) => getItemName(id));

      // Step 4: Build AI prompt
      const prompt = `You are a League of Legends coach. Analyze this match performance and provide concise, actionable feedback.
    **Match Details:**
    - Champion: ${player.championName}
    - Role: ${player.teamPosition}
    - Result: ${player.win ? "Victory" : "Defeat"}
    - KDA: ${player.kills}/${player.deaths}/${player.assists} (${kda} KDA)
    - CS: ${totalCS} (${csPerMin}/min) in ${gameDurationMin} minutes
    - Vision Score: ${player.visionScore}
    - Damage to Champions: ${player.totalDamageDealtToChampions.toLocaleString()}
    - Gold Earned: ${player.goldEarned.toLocaleString()}

    **Items Built:**
    ${items.join(", ") || "None"}

    Provide feedback in this EXACT format:

    🔴 **Critical Issues:**
    - [2-3 specific problems with numbers]

    ⚠️ **Build/Strategy Notes:**
    - [Comments on itemization or gameplay decisions]

    ✅ **What You Did Well:**
    - [2-3 positive points]

    💡 **Focus This Week:**
    1. [Specific actionable drill]
    2. [Specific actionable drill]
    3. [Specific actionable drill]

    Keep it direct and actionable. Use the numbers provided.`;

      // Step 5: Get AI analysis
      const result = await model.generateContent(prompt);
      const analysis = result.response.text();

      // Step 6: Return everything to frontend
      res.json({
        matchData,
        playerStats: {
          championName: player.championName,
          role: player.teamPosition,
          win: player.win,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          kda,
          cs: totalCS,
          csPerMin,
          visionScore: player.visionScore,
          gameDuration: gameDurationMin,
        },
        analysis,
      });
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

Provide coaching feedback in this EXACT format:

🔴 **Critical Issues** (2-3 points with specific numbers)
- [Issue with data]

⚠️ **Areas to Improve** (2-3 points)
- [Improvement area]

✅ **What You're Doing Well** (2-3 points)
- [Strength]

💡 **This Week's Focus** (3 specific drills)
1. [Drill with measurable goal]
2. [Drill with measurable goal]
3. [Drill with measurable goal]

Be direct, use the numbers provided, focus on actionable improvements.`;

      // Step 3: Get AI analysis
      const result = await model.generateContent(prompt);
      const analysis = result.response.text();

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
        analysis,
        matches, // Return matches for display
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Analysis failed";
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

import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { getMatchData } from "./riot";
import { PlatformRegion } from "./types";

const app = express();
app.use(cors());
app.use(express.json());

interface AnalyzeRequestBody {
  gameName: string;
  tagLine: string;
  region: PlatformRegion;
}

app.post("/api/analyze", async (req: Request<{}, {}, AnalyzeRequestBody>, res: Response) => {
  try {
    const { gameName, tagLine, region } = req.body;
    
    if (!gameName || !tagLine || !region) {
      res.status(400).json({ 
        error: "Missing required fields: gameName, tagLine, region" 
      });
      return;
    }
    
    const matchData = await getMatchData(gameName, tagLine, region);
    res.json(matchData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
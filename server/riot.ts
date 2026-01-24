import axios from "axios";
import { RiotMatchData, RegionConfig, PlatformRegion } from "./types";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

if (!RIOT_API_KEY) {
  throw new Error("RIOT_API_KEY environment variable is required");
}

// Regional routing mapping
const REGION_MAPPINGS: Record<PlatformRegion, RegionConfig> = {
  // Platform routes (what users select)
  na: { account: "americas", match: "americas" },
  br: { account: "americas", match: "americas" },
  lan: { account: "americas", match: "americas" },
  las: { account: "americas", match: "americas" },
  
  euw: { account: "europe", match: "europe" },
  eune: { account: "europe", match: "europe" },
  tr: { account: "europe", match: "europe" },
  ru: { account: "europe", match: "europe" },
  
  kr: { account: "asia", match: "asia" },
  jp: { account: "asia", match: "asia" },
  
  oce: { account: "asia", match: "sea" },
  ph: { account: "asia", match: "sea" },
  sg: { account: "asia", match: "sea" },
  th: { account: "asia", match: "sea" },
  tw: { account: "asia", match: "sea" },
  vn: { account: "asia", match: "sea" },
};

interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export async function getMatchData(
  gameName: string,
  tagLine: string,
  platformRegion: PlatformRegion = "oce"
): Promise<RiotMatchData> {
  const region = REGION_MAPPINGS[platformRegion.toLowerCase() as PlatformRegion];
  
  if (!region) {
    throw new Error(`Invalid region: ${platformRegion}`);
  }

  // 1. Get PUUID from gameName + tagLine (Account-v1 uses 3 regions: americas, asia, europe)
  const accountUrl = `https://${region.account}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const accountResponse = await axios.get<RiotAccount>(accountUrl, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  const puuid = accountResponse.data.puuid;

  // 2. Get recent match IDs (Match-v5 supports sea as well)
  const matchListUrl = `https://${region.match}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=1`;
  const matchIdsResponse = await axios.get<string[]>(matchListUrl, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  const matchId = matchIdsResponse.data[0];

  if (!matchId) {
    throw new Error("No matches found for this player");
  }

  // 3. Get match details
  const matchUrl = `https://${region.match}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const matchResponse = await axios.get<RiotMatchData>(matchUrl, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  return matchResponse.data;
}
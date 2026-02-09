import axios from "axios";
import {
  RiotMatchData,
  RegionConfig,
  PlatformRegion,
  SummonerData,
  RankData,
  ProfileData,
} from "./types";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

if (!RIOT_API_KEY) {
  throw new Error("RIOT_API_KEY environment variable is required");
}

// Regional routing mapping
const REGION_MAPPINGS: Record<PlatformRegion, RegionConfig> = {
  // Platform routes (what users select)
  na: { account: "americas", match: "americas", platform: "na1" },
  br: { account: "americas", match: "americas", platform: "br1" },
  lan: { account: "americas", match: "americas", platform: "la1" },
  las: { account: "americas", match: "americas", platform: "la2" },

  euw: { account: "europe", match: "europe", platform: "euw1" },
  eune: { account: "europe", match: "europe", platform: "eun1" },
  tr: { account: "europe", match: "europe", platform: "tr1" },
  ru: { account: "europe", match: "europe", platform: "ru" },

  kr: { account: "asia", match: "asia", platform: "kr" },
  jp: { account: "asia", match: "asia", platform: "jp1" },

  oce: { account: "asia", match: "sea", platform: "oc1" },
  ph: { account: "asia", match: "sea", platform: "ph2" },
  sg: { account: "asia", match: "sea", platform: "sg2" },
  th: { account: "asia", match: "sea", platform: "th2" },
  tw: { account: "asia", match: "sea", platform: "tw2" },
  vn: { account: "asia", match: "sea", platform: "vn2" },
};

interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export async function getMatchData(
  gameName: string,
  tagLine: string,
  platformRegion: PlatformRegion = "oce",
): Promise<RiotMatchData> {
  const region =
    REGION_MAPPINGS[platformRegion.toLowerCase() as PlatformRegion];

  if (!region) {
    throw new Error(`Invalid region: ${platformRegion}`);
  }

  // 1. Get PUUID from gameName + tagLine
  const accountUrl = `https://${region.account}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const accountResponse = await axios.get<RiotAccount>(accountUrl, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  const puuid = accountResponse.data.puuid;

  // 2. Get recent match IDs
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

/**
 * Get complete profile data for a summoner
 */
export async function getProfileData(
  gameName: string,
  tagLine: string,
  platformRegion: PlatformRegion = "oce",
  matchCount: number = 10,
): Promise<ProfileData> {
  const region =
    REGION_MAPPINGS[platformRegion.toLowerCase() as PlatformRegion];

  if (!region) {
    throw new Error(`Invalid region: ${platformRegion}`);
  }

  try {
    // Step 1: Get PUUID from Riot ID
    const accountUrl = `https://${region.account}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const accountResponse = await axios.get<RiotAccount>(accountUrl, {
      headers: { "X-Riot-Token": RIOT_API_KEY },
    });
    const { puuid } = accountResponse.data;

    // Step 2: Get summoner data (level, icon) - Note: summonerId removed from API in 2025
    const summonerUrl = `https://${region.platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    console.log("Fetching summoner data from:", summonerUrl);
    const summonerResponse = await axios.get<SummonerData>(summonerUrl, {
      headers: { "X-Riot-Token": RIOT_API_KEY },
    });
    const summonerData = summonerResponse.data;
    console.log("Summoner data received:", summonerData);

    // Step 3: Fetch rank by PUUID (LEAGUE-V4)
    const leagueUrl = `https://${region.platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
    const leagueResponse = await axios.get<RankData[]>(leagueUrl, {
      headers: { "X-Riot-Token": RIOT_API_KEY },
    });

    const soloQueue = leagueResponse.data.find(
      (entry) => entry.queueType === "RANKED_SOLO_5x5",
    );

    const rankData = soloQueue ?? null;

    // Step 4: Get match IDs (filtered for ranked solo/duo - queueId 420)
    const matchListUrl = `https://${region.match}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=${matchCount}`;
    const matchIdsResponse = await axios.get<string[]>(matchListUrl, {
      headers: { "X-Riot-Token": RIOT_API_KEY },
    });
    const matchIds = matchIdsResponse.data;

    if (matchIds.length === 0) {
      throw new Error("No matches found for this player");
    }

    // Step 5: Fetch match details with rate limiting (batches of 5 with 200ms delay)
    const matches: RiotMatchData[] = [];
    const batchSize = 5;
    const delayMs = 200;

    for (let i = 0; i < matchIds.length; i += batchSize) {
      const batch = matchIds.slice(i, i + batchSize);
      const batchPromises = batch.map(async (matchId) => {
        const matchUrl = `https://${region.match}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        const response = await axios.get<RiotMatchData>(matchUrl, {
          headers: { "X-Riot-Token": RIOT_API_KEY },
        });
        return response.data;
      });

      const batchResults = await Promise.all(batchPromises);
      matches.push(...batchResults);

      // Add delay between batches (except for last batch)
      if (i + batchSize < matchIds.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    // Step 6: Process match data
    const recentMatches = matches.map((match) => {
      const player = match.info.participants.find((p) => p.puuid === puuid)!;
      const totalCS = player.totalMinionsKilled + player.neutralMinionsKilled;
      const gameDurationMin = Math.floor(match.info.gameDuration / 60);
      const csPerMin = gameDurationMin > 0 ? totalCS / gameDurationMin : 0;
      const kda =
        player.deaths === 0
          ? player.kills + player.assists
          : (player.kills + player.assists) / player.deaths;

      const timeAgo = getTimeAgo(match.info.gameEndTimestamp);

      return {
        matchId: match.metadata.matchId,
        championName: player.championName,
        role: player.teamPosition || "UNKNOWN",
        win: player.win,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        kda: parseFloat(kda.toFixed(2)),
        cs: totalCS,
        csPerMin: parseFloat(csPerMin.toFixed(1)),
        visionScore: player.visionScore,
        damage: player.totalDamageDealtToChampions,
        gold: player.goldEarned,
        gameDuration: gameDurationMin,
        timeAgo,
      };
    });

    // Step 7: Calculate overall stats
    const totalGames = recentMatches.length;
    const totalWins = recentMatches.filter((m) => m.win).length;
    const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

    const avgKDA =
      recentMatches.reduce((sum, m) => sum + m.kda, 0) / totalGames;

    // Step 8: Calculate champion stats
    const championMap = new Map<string, { games: number; wins: number }>();
    recentMatches.forEach((match) => {
      const current = championMap.get(match.championName) || {
        games: 0,
        wins: 0,
      };
      current.games++;
      if (match.win) current.wins++;
      championMap.set(match.championName, current);
    });

    const recentChampions = Array.from(championMap.entries())
      .map(([championName, stats]) => ({
        championName,
        games: stats.games,
        wins: stats.wins,
        winRate: parseFloat(((stats.wins / stats.games) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 10); // Top 10 most played

    return {
      summoner: {
        gameName: accountResponse.data.gameName, 
        tagLine: accountResponse.data.tagLine, 
        level: summonerData.summonerLevel,
        profileIconId: summonerData.profileIconId,
      },
      rank: rankData
        ? {
            tier: rankData.tier,
            rank: rankData.rank,
            lp: rankData.leaguePoints,
            wins: rankData.wins,
            losses: rankData.losses,
            winRate: parseFloat(
              (
                (rankData.wins / (rankData.wins + rankData.losses)) *
                100
              ).toFixed(1),
            ),
          }
        : null,
      overallStats: {
        totalGames,
        winRate: parseFloat(winRate.toFixed(1)),
        avgKDA: parseFloat(avgKDA.toFixed(2)),
      },
      recentChampions,
      recentMatches,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Riot API Error: ${error.response?.data?.status?.message || error.message}`,
      );
    }
    throw error;
  }
}

/**
 * Helper function to convert timestamp to "X hours/days ago"
 */
function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

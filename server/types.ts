// Riot API Types - focused on fields needed for match analysis

export interface RiotMatchData {
  metadata: {
    matchId: string;
    participants: string[]; // Array of PUUIDs
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameEndTimestamp: number;
    gameMode: string;
    queueId: number;
    participants: Participant[];
    teams: Team[];
  };
}

export interface Participant {
  puuid: string;
  riotIdGameName: string;
  riotIdTagline: string;
  
  // Champion & Role
  championId: number;
  championName: string;
  teamPosition: string;
  
  // Core Stats
  kills: number;
  deaths: number;
  assists: number;
  champLevel: number;
  
  // CS & Gold
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;
  
  // Damage
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  
  // Vision
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  visionWardsBoughtInGame: number;
  
  // Items (0-6)
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  
  // Win/Loss
  win: boolean;
  teamId: number;
}

export interface Team {
  teamId: number;
  win: boolean;
  objectives: {
    baron: ObjectiveStat;
    dragon: ObjectiveStat;
    tower: ObjectiveStat;
  };
}

export interface ObjectiveStat {
  first: boolean;
  kills: number;
}

// Regional mapping types
export interface RegionConfig {
  account: "americas" | "asia" | "europe";
  match: "americas" | "asia" | "europe" | "sea";
  platform: string; // e.g., "na1", "euw1", "oc1"
}

export type PlatformRegion = 
  | "na" | "br" | "lan" | "las"
  | "euw" | "eune" | "tr" | "ru"
  | "kr" | "jp"
  | "oce" | "ph" | "sg" | "th" | "tw" | "vn";

// Summoner data from SUMMONER-V4
export interface SummonerData {
  id: string; // Encrypted summoner ID
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

// Rank data from LEAGUE-V4
export interface RankData {
  leagueId: string;
  queueType: string; // "RANKED_SOLO_5x5" | "RANKED_FLEX_SR"
  tier: string; // "IRON" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "EMERALD" | "DIAMOND" | "MASTER" | "GRANDMASTER" | "CHALLENGER"
  rank: string; // "I" | "II" | "III" | "IV"
  summonerId: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

// Profile response interface
export interface ProfileData {
  summoner: {
    gameName: string;
    tagLine: string;
    level: number;
    profileIconId: number;
  };
  rank: {
    tier: string;
    rank: string;
    lp: number;
    wins: number;
    losses: number;
    winRate: number;
  } | null;
  overallStats: {
    totalGames: number;
    winRate: number;
    avgKDA: number;
  };
  recentChampions: Array<{
    championName: string;
    games: number;
    wins: number;
    winRate: number;
  }>;
  recentMatches: Array<{
    matchId: string;
    championName: string;
    role: string;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
    cs: number;
    csPerMin: number;
    visionScore: number;
    damage: number;
    gold: number;
    gameDuration: number;
    timeAgo: string;
  }>;
}
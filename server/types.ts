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
}

export type PlatformRegion = 
  | "na" | "br" | "lan" | "las"
  | "euw" | "eune" | "tr" | "ru"
  | "kr" | "jp"
  | "oce" | "ph" | "sg" | "th" | "tw" | "vn";
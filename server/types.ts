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
  teamPosition: string; // TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY
  individualPosition: string;
  role: string;
  lane: string;
  
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
  magicDamageDealtToChampions: number;
  physicalDamageDealtToChampions: number;
  trueDamageDealtToChampions: number;
  
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
  
  // Summoner Spells
  summoner1Id: number;
  summoner2Id: number;
  
  // Perks/Runes
  perks: {
    styles: PerkStyle[];
  };
  
  // Objectives
  challenges?: {
    kda: number;
    killParticipation: number;
    damagePerMinute: number;
    goldPerMinute: number;
    [key: string]: number | undefined;
  };
  
  // Win/Loss
  win: boolean;
  teamId: number;
  
  // Timestamps
  firstBloodKill: boolean;
  firstTowerKill: boolean;
  
  // Other useful stats
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
  longestTimeSpentLiving: number;
  timeCCingOthers: number;
}

export interface PerkStyle {
  description: string;
  selections: PerkSelection[];
  style: number;
}

export interface PerkSelection {
  perk: number;
  var1: number;
  var2: number;
  var3: number;
}

export interface Team {
  teamId: number;
  win: boolean;
  objectives: {
    baron: ObjectiveStat;
    champion: ObjectiveStat;
    dragon: ObjectiveStat;
    inhibitor: ObjectiveStat;
    riftHerald: ObjectiveStat;
    tower: ObjectiveStat;
  };
  bans: Ban[];
}

export interface ObjectiveStat {
  first: boolean;
  kills: number;
}

export interface Ban {
  championId: number;
  pickTurn: number;
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
const axios = require("axios");

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Regional routing mapping
const REGION_MAPPINGS = {
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
  
  oce: { account: "asia", match: "sea" },  // i.e. OCE uses asia for account, sea for matches
  ph: { account: "asia", match: "sea" },
  sg: { account: "asia", match: "sea" },
  th: { account: "asia", match: "sea" },
  tw: { account: "asia", match: "sea" },
  vn: { account: "asia", match: "sea" },
};

async function getMatchData(gameName, tagLine, platformRegion = "oce") {
  const region = REGION_MAPPINGS[platformRegion.toLowerCase()];
  
  if (!region) {
    throw new Error(`Invalid region: ${platformRegion}`);
  }

  // 1. Get PUUID from gameName + tagLine (Account-v1 uses 3 regions: americas, asia, europe)
  const accountUrl = `https://${region.account}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const account = await axios.get(accountUrl, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  const puuid = account.data.puuid;

  // 2. Get recent match IDs (Match-v5 supports sea as well)
  const matchListUrl = `https://${region.match}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=1`;
  const matchIds = await axios.get(matchListUrl, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  const matchId = matchIds.data[0];

  // 3. Get match details
  const matchUrl = `https://${region.match}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const match = await axios.get(matchUrl, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  return match.data;
}

module.exports = { getMatchData };
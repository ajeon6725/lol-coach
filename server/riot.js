const axios = require("axios");

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const BASE_URL = "https://americas.api.riotgames.com";
const REGION_URL = "https://na1.api.riotgames.com"; // Change based on user region

async function getMatchData(summonerName, region = "americas") {
  // 1. Get PUUID from gameName + tagLine
  const accountUrl = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const account = await axios.get(accountUrl, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  const puuid = account.data.puuid;

  // 2. Get recent match IDs
  const matchListUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=1`;
  const matchIds = await axios.get(matchListUrl, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  const matchId = matchIds.data[0];

  const matchUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const match = await axios.get(matchUrl, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
  });

  return match.data;
}

module.exports = { getMatchData };

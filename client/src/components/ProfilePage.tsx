import { useEffect, useState } from "react";

interface ProfileData {
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

interface ProfilePageProps {
  gameName: string;
  tagLine: string;
  region: string;
  onGetAnalysis: (matches: ProfileData["recentMatches"]) => void;
}

export default function ProfilePage({
  gameName,
  tagLine,
  region,
  onGetAnalysis,
}: ProfilePageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChampion, setSelectedChampion] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedMatchCount, setSelectedMatchCount] = useState<number>(20);

  useEffect(() => {
    fetchProfile();
  }, [gameName, tagLine, region]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName, tagLine, region, matchCount: 10 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch profile");
      }

      const data: ProfileData = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = profile
    ? profile.recentMatches
        .filter(
          (match) =>
            selectedChampion === "all" ||
            match.championName === selectedChampion,
        )
        .filter(
          (match) => selectedRole === "all" || match.role === selectedRole,
        )
        .slice(0, selectedMatchCount)
    : [];

  const availableRoles = profile
    ? Array.from(new Set(profile.recentMatches.map((m) => m.role))).filter(
        (r) => r !== "UNKNOWN",
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-muted">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-danger/10 border border-danger rounded-xl p-6 max-w-md">
          <p className="text-danger text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const iconUrl = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${profile.summoner.profileIconId}.png`;

  return (
    <div className="min-h-screen bg-dark p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="bg-card border-2 border-primary/30 rounded-2xl p-6 md:p-8 mb-8 relative">
          <div className="absolute inset-0 bg-black/20 rounded-2xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <img
              src={iconUrl}
              alt="Summoner Icon"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white/30 shadow-lg"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
                {profile.summoner.gameName}
                <span className="text-muted">#{profile.summoner.tagLine}</span>
              </h1>
              <p className="text-white/90">Level {profile.summoner.level}</p>
            </div>
            {profile.rank ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center border border-white/20">
                <div className="font-display text-xl md:text-2xl font-bold text-white uppercase">
                  {profile.rank.tier} {profile.rank.rank}
                </div>
                <div className="text-lg md:text-xl text-white/90 mt-1">
                  {profile.rank.lp} LP
                </div>
                <div className="text-sm text-white/80 mt-1">
                  {profile.rank.winRate}% WR ({profile.rank.wins}W{" "}
                  {profile.rank.losses}L)
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center border border-white/20">
                <div className="font-display text-xl md:text-2xl font-bold text-white">
                  UNRANKED
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Recently Played Champions - Horizontal Scroll */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-light mb-4">
            Recently Played
          </h2>
          <div className="flex gap-4 overflow-x-auto py-2 px-2 -mx-2">
            {profile.recentChampions.map((champ) => (
              <div
                key={champ.championName}
                className={`bg-card border rounded-lg p-3 hover:scale-105 transition-all cursor-pointer flex-shrink-0 w-28 ${
                  selectedChampion === champ.championName
                    ? "border-primary border-2 shadow-lg shadow-primary/20"
                    : "border-border hover:border-primary"
                }`}
                onClick={() => setSelectedChampion(champ.championName)}
              >
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${champ.championName}.png`}
                  alt={champ.championName}
                  className="w-full aspect-square rounded-md mb-2"
                />
                <p className="font-semibold text-light text-sm text-center truncate">
                  {champ.championName}
                </p>
                <p className="text-xs text-muted text-center">
                  {champ.games} games
                </p>
                <p
                  className={`text-xs font-bold text-center ${champ.winRate >= 50 ? "text-primary" : "text-danger"}`}
                >
                  {champ.winRate}% WR
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Filter Controls + CTA Integrated */}
        <section className="mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={selectedChampion}
              onChange={(e) => setSelectedChampion(e.target.value)}
              className="flex-1 min-w-[180px] px-4 py-3 bg-card border border-border rounded-lg text-light focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="all">All Champions</option>
              {profile.recentChampions.map((champ) => (
                <option key={champ.championName} value={champ.championName}>
                  {champ.championName} ({champ.games}G)
                </option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="flex-1 min-w-[180px] px-4 py-3 bg-card border border-border rounded-lg text-light focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="all">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <select
              value={selectedMatchCount}
              onChange={(e) => setSelectedMatchCount(Number(e.target.value))}
              className="flex-1 min-w-[180px] px-4 py-3 bg-card border border-border rounded-lg text-light focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value={10}>Last 10 games</option>
              <option value={20}>Last 20 games</option>
              <option value={50}>Last 50 games</option>
            </select>

            <button
              onClick={() => onGetAnalysis(filteredMatches)}
              className="flex-shrink-0 px-6 py-3 font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 whitespace-nowrap"
            >
              Analyze {filteredMatches.length} games →
            </button>

            {/* Subtle Glow: <button 
              onClick={() => onGetAnalysis(filteredMatches)}
              className="flex-shrink-0 px-6 py-3 font-bold text-white bg-gradient-to-br from-primary to-primary/80 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all hover:scale-105 whitespace-nowrap border border-primary/30"
            >
              Analyze {filteredMatches.length} games →
            </button> */}
          </div>
        </section>

        {/* Match History */}
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-light mb-4">
            Recent Matches
          </h2>
          <div className="space-y-2">
            {filteredMatches.length === 0 ? (
              <p className="text-center text-muted py-8">
                No matches found for selected filters
              </p>
            ) : (
              filteredMatches.map((match) => (
                <div
                  key={match.matchId}
                  className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg border-l-[6px] transition-all hover:translate-x-1 ${
                    match.win
                      ? "bg-primary/5 border-l-primary"
                      : "bg-danger/5 border-l-danger"
                  }`}
                >
                  <div
                    className={`font-display font-bold text-sm md:text-base min-w-[70px] ${match.win ? "text-primary" : "text-danger"}`}
                  >
                    {match.win ? "VICTORY" : "DEFEAT"}
                  </div>
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${match.championName}.png`}
                    alt={match.championName}
                    className="w-12 h-12 rounded-lg"
                  />
                  <div className="min-w-[80px]">
                    <p className="font-semibold text-light text-sm">
                      {match.championName}
                    </p>
                    <p className="text-xs text-muted">{match.role}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-light text-sm">
                      {match.kills}/{match.deaths}/{match.assists}
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {match.kda.toFixed(2)} KDA
                    </span>
                  </div>
                  <div className="hidden md:flex flex-col gap-0.5 text-xs text-muted">
                    <span>
                      {match.cs} CS ({match.csPerMin}/min)
                    </span>
                    <span>Vision: {match.visionScore}</span>
                  </div>
                  <div className="ml-auto text-xs text-muted">
                    {match.timeAgo}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import "./ProfilePage.css";

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
  onGetAnalysis: () => void;
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
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!profile) return null;

  const iconUrl = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${profile.summoner.profileIconId}.png`;

  return (
    <div className="profile-page">
      {/* Header Section */}
      <header className="profile-header">
        <img src={iconUrl} alt="Summoner Icon" className="summoner-icon" />
        <div className="summoner-info">
          <h1 className="summoner-name">
            {profile.summoner.gameName}#{profile.summoner.tagLine}
          </h1>
          <p className="summoner-level">Level {profile.summoner.level}</p>
        </div>
        {profile.rank && (
          <div className="rank-badge">
            <div className="rank-tier">
              {profile.rank.tier} {profile.rank.rank}
            </div>
            <div className="rank-lp">{profile.rank.lp} LP</div>
            <div className="rank-wr">
              {profile.rank.winRate}% WR ({profile.rank.wins}W{" "}
              {profile.rank.losses}L)
            </div>
          </div>
        )}
        {!profile.rank && (
          <div className="rank-badge unranked">
            <div className="rank-tier">Unranked</div>
          </div>
        )}
      </header>

      {/* Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <h3>Total Games</h3>
          <p className="stat-value">{profile.overallStats.totalGames}</p>
        </div>
        <div className="stat-card">
          <h3>Win Rate</h3>
          <p className="stat-value">{profile.overallStats.winRate}%</p>
        </div>
        <div className="stat-card">
          <h3>Avg KDA</h3>
          <p className="stat-value">{profile.overallStats.avgKDA}</p>
        </div>
      </section>

      {/* Recently Played Champions */}
      <section className="recent-champions">
        <h2>Recently Played Champions</h2>
        <div className="champion-grid">
          {profile.recentChampions.map((champ) => (
            <div key={champ.championName} className="champion-card">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${champ.championName}.png`}
                alt={champ.championName}
                className="champion-icon"
              />
              <div className="champion-stats">
                <p className="champion-name">{champ.championName}</p>
                <p className="champion-games">{champ.games} games</p>
                <p
                  className={`champion-wr ${champ.winRate >= 50 ? "positive" : "negative"}`}
                >
                  {champ.winRate}% WR
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filter Controls */}
      <section className="filter-controls">
        <h2>Match History Filters</h2>
        <div className="filters">
          <select
            value={selectedChampion}
            onChange={(e) => setSelectedChampion(e.target.value)}
          >
            <option value="all">All Champions</option>
            {profile.recentChampions.map((champ) => (
              <option key={champ.championName} value={champ.championName}>
                {champ.championName} ({champ.games} games)
              </option>
            ))}
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
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
          >
            <option value={10}>Last 10 games</option>
            <option value={20}>Last 20 games</option>
            <option value={50}>Last 50 games</option>
          </select>
        </div>
      </section>

      {/* Recent Match History */}
      <section className="match-history">
        <h2>Recent Match History</h2>
        <div className="match-list">
          {filteredMatches.length === 0 ? (
            <p className="no-matches">No matches found for selected filters</p>
          ) : (
            filteredMatches.map((match) => (
              <div
                key={match.matchId}
                className={`match-card ${match.win ? "win" : "loss"}`}
              >
                <div className="match-result">
                  {match.win ? "Victory" : "Defeat"}
                </div>
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${match.championName}.png`}
                  alt={match.championName}
                  className="match-champion-icon"
                />
                <div className="match-details">
                  <p className="match-champion">{match.championName}</p>
                  <p className="match-role">{match.role}</p>
                </div>
                <div className="match-stats">
                  <span className="kda">
                    {match.kills}/{match.deaths}/{match.assists}
                  </span>
                  <span className="kda-ratio">{match.kda.toFixed(2)} KDA</span>
                </div>
                <div className="match-stats">
                  <span>
                    {match.cs} CS ({match.csPerMin}/min)
                  </span>
                  <span>Vision: {match.visionScore}</span>
                </div>
                <div className="match-time">{match.timeAgo}</div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Improve?</h2>
        <p>
          Analyze {filteredMatches.length}{" "}
          {selectedChampion !== "all" ? selectedChampion : ""}
          {selectedRole !== "all" ? ` ${selectedRole}` : ""} games
        </p>
        <button className="cta-button" onClick={onGetAnalysis}>
          Get AI Analysis
        </button>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import "./Dashboard.css";

interface DashboardProps {
  gameName: string;
  tagLine: string;
  region: string;
  filteredMatches: any[]; // Use ProfileData['recentMatches'] type
  onBack: () => void;
}

interface AnalysisResponse {
  aggregatedStats: {
    totalGames: number;
    winRate: number;
    avgCS: number;
    avgKDA: number;
    avgVision: number;
    avgDeaths: number;
  };
  analysis: string;
  matches: any[];
}

export default function Dashboard({
  gameName,
  tagLine,
  region,
  filteredMatches,
  onBack,
}: DashboardProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/analyze-multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameName,
          tagLine,
          region,
          matches: filteredMatches,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data: AnalysisResponse = await response.json();
      setAnalysisData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Analyzing your performance...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">{error}</div>
        <button onClick={onBack}>Back to Profile</button>
      </div>
    );
  }

  if (!analysisData) return null;

  return (
    <div className="dashboard">
      <button className="back-button" onClick={onBack}>
        ← Back to Profile
      </button>

      {/* Progress Indicator */}
      <div className="progress-steps">
        <span className="step completed">1. Search</span>
        <span className="step completed">2. Profile</span>
        <span className="step active">3. Analysis</span>
      </div>

      {/* Filter Summary */}
      <div className="filter-summary">
        Analyzing {analysisData.aggregatedStats.totalGames}{" "}
        {filteredMatches[0]?.championName || ""}{" "}
        {filteredMatches[0]?.role || ""} games
      </div>

      {/* Aggregated Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <h3>Win Rate</h3>
          <p className="stat-value">{analysisData.aggregatedStats.winRate}%</p>
        </div>
        <div className="stat-card">
          <h3>Avg CS/min</h3>
          <p className="stat-value">{analysisData.aggregatedStats.avgCS}</p>
        </div>
        <div className="stat-card">
          <h3>Avg KDA</h3>
          <p className="stat-value">{analysisData.aggregatedStats.avgKDA}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Vision</h3>
          <p className="stat-value">{analysisData.aggregatedStats.avgVision}</p>
        </div>
      </section>

      {/* AI Analysis */}
      <section className="ai-analysis">
        <h2>Your AI Coach's Feedback</h2>
        <div className="analysis-content">
          {analysisData.analysis}
        </div>
      </section>

      {/* Match History (expandable) */}
      <section className="match-details">
        <h2>Match Breakdown</h2>
        <div className="match-list">
          {analysisData.matches.map((match) => (
            <div
              key={match.matchId}
              className={`match-card ${match.win ? "win" : "loss"} ${
                expandedMatch === match.matchId ? "expanded" : ""
              }`}
              onClick={() =>
                setExpandedMatch(
                  expandedMatch === match.matchId ? null : match.matchId
                )
              }
            >
              {/* Collapsed View */}
              <div className="match-summary">
                <span className="match-result">
                  {match.win ? "Victory" : "Defeat"}
                </span>
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${match.championName}.png`}
                  alt={match.championName}
                  className="match-champion-icon"
                />
                <span className="match-kda">
                  {match.kills}/{match.deaths}/{match.assists}
                </span>
                <span className="match-cs">{match.csPerMin} CS/min</span>
                <span className="match-time">{match.timeAgo}</span>
              </div>

              {/* Expanded View */}
              {expandedMatch === match.matchId && (
                <div className="match-expanded">
                  <p>Damage: {match.damage.toLocaleString()}</p>
                  <p>Gold: {match.gold.toLocaleString()}</p>
                  <p>Vision Score: {match.visionScore}</p>
                  <p>Game Duration: {match.gameDuration} min</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
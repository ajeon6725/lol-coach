import { useEffect, useState } from "react";
import HeroPriorityCard from "./HeroPriorityCard"
import ChatSection from "../ChatSection";
import SecondaryInsights from "./SecondaryInsights";
import StatCard from "./StatCard";
import MatchCard from "./MatchCard";

interface DashboardProps {
  gameName: string;
  tagLine: string;
  region: string;
  filteredMatches: any[];
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
  const [showChat, setShowChat] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-muted">Analyzing your performance...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-danger/10 border border-danger rounded-xl p-6 max-w-md text-center">
          <p className="text-danger mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-card border border-border rounded-lg hover:border-primary transition-all"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) return null;

  const championName = filteredMatches[0]?.championName || "";
  const role = filteredMatches[0]?.role || "";

  return (
    <div className="min-h-screen bg-dark p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-card border border-border rounded-lg hover:border-primary hover:-translate-x-1 transition-all text-light font-medium"
          >
            ← Back to Profile
          </button>
          
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-primary/15 border border-primary/30 rounded-md text-primary text-xs md:text-sm font-semibold uppercase tracking-wide">
              Search
            </span>
            <span className="px-3 py-1 bg-primary/15 border border-primary/30 rounded-md text-primary text-xs md:text-sm font-semibold uppercase tracking-wide">
              Profile
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-primary to-secondary rounded-md text-dark text-xs md:text-sm font-bold uppercase tracking-wide shadow-lg shadow-primary/30">
              Analysis
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 tracking-tight">
            PERFORMANCE ANALYSIS
          </h1>
          <p className="text-muted text-base md:text-lg font-medium">
            Analyzing {analysisData.aggregatedStats.totalGames} {championName} {role} games
          </p>
        </div>

        {/* Hero Priority Card */}
        <HeroPriorityCard 
          stats={analysisData.aggregatedStats}
          championName={championName}
          onAskMore={() => setShowChat(true)}
        />

        {/* Chat Section */}
        {showChat && (
          <ChatSection 
            onClose={() => setShowChat(false)}
            playerContext={{ 
              championName, 
              role, 
              stats: analysisData.aggregatedStats,
              matches: analysisData.matches 
            }}
          />
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Win Rate"
            value={`${analysisData.aggregatedStats.winRate}%`}
            positive={analysisData.aggregatedStats.winRate >= 50}
          />
          <StatCard
            label="Avg CS/min"
            value={analysisData.aggregatedStats.avgCS.toFixed(1)}
            positive={analysisData.aggregatedStats.avgCS >= 6}
          />
          <StatCard
            label="Avg KDA"
            value={analysisData.aggregatedStats.avgKDA.toFixed(2)}
            positive={analysisData.aggregatedStats.avgKDA >= 3}
          />
          <StatCard
            label="Avg Vision"
            value={analysisData.aggregatedStats.avgVision.toFixed(1)}
            positive={analysisData.aggregatedStats.avgVision >= 20}
          />
        </div>

        {/* Secondary Insights */}
        <SecondaryInsights analysis={analysisData.analysis} />

        {/* Match History */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-display text-xl md:text-2xl font-bold mb-4 text-light flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded" />
            Match Breakdown
          </h2>
          
          <div className="space-y-2">
            {analysisData.matches.map((match) => (
              <MatchCard
                key={match.matchId}
                match={match}
                expanded={expandedMatch === match.matchId}
                onToggle={() =>
                  setExpandedMatch(
                    expandedMatch === match.matchId ? null : match.matchId
                  )
                }
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
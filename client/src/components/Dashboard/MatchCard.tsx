interface MatchCardProps {
  match: {
    matchId: string;
    championName: string;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    csPerMin: number;
    visionScore: number;
    damage: number;
    gold: number;
    gameDuration: number;
    timeAgo: string;
  };
  expanded: boolean;
  onToggle: () => void;
}

export default function MatchCard({ match, expanded, onToggle }: MatchCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
        match.win
          ? "bg-primary/5 border-l-primary hover:bg-primary/10"
          : "bg-danger/5 border-l-danger hover:bg-danger/10"
      } ${expanded ? "translate-x-2" : "hover:translate-x-1"}`}
    >
      {/* Match Summary */}
      <div className="flex items-center gap-3 md:gap-4">
        <span
          className={`font-display font-bold text-xs md:text-sm min-w-[60px] md:min-w-[70px] uppercase tracking-wide ${
            match.win ? "text-primary" : "text-danger"
          }`}
        >
          {match.win ? "Victory" : "Defeat"}
        </span>

        <img
          src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${match.championName}.png`}
          alt={match.championName}
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 border-border"
        />

        <div className="flex-1 flex flex-wrap gap-3 md:gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-muted text-xs">KDA</span>
            <span className="font-semibold text-light">
              {match.kills}/{match.deaths}/{match.assists}
            </span>
          </div>

          <div className="hidden md:flex flex-col">
            <span className="text-muted text-xs">CS/min</span>
            <span className="font-semibold text-light">{match.csPerMin}</span>
          </div>

          <div className="hidden md:flex flex-col">
            <span className="text-muted text-xs">Vision</span>
            <span className="font-semibold text-light">{match.visionScore}</span>
          </div>
        </div>

        <span className="text-muted text-xs ml-auto">{match.timeAgo}</span>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-muted text-xs mb-1">Damage</span>
            <span className="font-semibold text-primary font-display text-lg">
              {match.damage.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-muted text-xs mb-1">Gold</span>
            <span className="font-semibold text-primary font-display text-lg">
              {match.gold.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-muted text-xs mb-1">Vision Score</span>
            <span className="font-semibold text-light font-display text-lg">
              {match.visionScore}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-muted text-xs mb-1">Duration</span>
            <span className="font-semibold text-light font-display text-lg">
              {match.gameDuration}m
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
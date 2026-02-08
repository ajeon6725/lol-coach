interface HeroPriorityCardProps {
  stats: {
    avgCS: number;
    winRate: number;
    avgKDA: number;
    avgVision: number;
    avgDeaths: number;
  };
  championName: string;
  onAskMore: () => void;
}

export default function HeroPriorityCard({ 
  stats, 
  championName, 
  onAskMore 
}: HeroPriorityCardProps) {
  // Calculate priority issue
  const csTarget = 7.0;
  const csGap = Math.round((csTarget - stats.avgCS) * 30); // avg game ~30min
  const goldLost = csGap * 20; // rough estimate

  const copyDrill = () => {
    const drillText = `League AI Coach - Priority Drill

🎯 GOAL: Fix CS deficit (${stats.avgCS.toFixed(1)}/min → ${csTarget}/min)

⚡ DRILL:
Practice Tool - 10 min/day for 5 days
- Champion: ${championName}
- Items: None
- Target: 75 CS by 10 minutes
- Focus: Last-hitting only, no abilities on minions

✅ SUCCESS METRIC:
Hit 75 CS @ 10min three times in a row

📊 TRACKING:
After each ranked game, check if CS/min ≥ 6.5
Goal: 3 ranked games in a row with 6.5+ CS/min`;

    navigator.clipboard.writeText(drillText);
  };

  return (
    <div className="bg-card border-2 border-primary rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-xl shadow-primary/20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wide text-primary mb-4">
          🎯 Your #1 Priority
        </span>

        {/* Title */}
        <h2 className="font-display text-2xl md:text-4xl font-bold text-light mb-6">
          CS Deficit: Losing {goldLost}g Per Game
        </h2>

        {/* Stats Comparison */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 md:p-6 bg-black/20 rounded-xl border border-border">
          <div className="text-center">
            <div className="text-xs text-muted uppercase tracking-wide mb-1 font-semibold">
              Your CS/min
            </div>
            <div className="font-display text-2xl md:text-3xl font-bold text-danger">
              {stats.avgCS.toFixed(1)}
            </div>
            <div className="text-xs text-muted mt-1">Bottom 30%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted uppercase tracking-wide mb-1 font-semibold">
              Target CS/min
            </div>
            <div className="font-display text-2xl md:text-3xl font-bold text-primary">
              {csTarget}
            </div>
            <div className="text-xs text-muted mt-1">Rank average</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted uppercase tracking-wide mb-1 font-semibold">
              CS Missed
            </div>
            <div className="font-display text-2xl md:text-3xl font-bold text-warning">
              {csGap}
            </div>
            <div className="text-xs text-muted mt-1">Per game</div>
          </div>
        </div>

        {/* Impact */}
        <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-lg mb-6">
          <h3 className="font-bold text-light mb-2 flex items-center gap-2">
            <span className="text-lg">💥</span> Why This Matters
          </h3>
          <p className="text-muted leading-relaxed">
            You're missing the gold equivalent of a <strong className="text-light">full item component</strong> every game. 
            This means you can't afford core items before crucial teamfights. 
            You're entering mid-game with a 1-item disadvantage.
          </p>
        </div>

        {/* Drill */}
        <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-lg mb-6">
          <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
            <span className="text-lg">⚡</span> Your Quick Fix
          </h3>
          <p className="text-light leading-relaxed">
            <strong>Practice Tool Drill (10 min/day for 5 days):</strong><br />
            Pick {championName}, no items, and hit <strong>75 CS by 10 minutes</strong>. 
            Focus only on last-hitting — no abilities on minions until you can do this consistently.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={onAskMore}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-display font-bold uppercase tracking-wide text-dark shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
          >
            💬 Ask Coach More
          </button>
          <button 
            onClick={copyDrill}
            className="px-6 py-3 bg-card border border-border rounded-lg font-display font-bold uppercase tracking-wide text-light hover:border-primary hover:text-primary transition-all"
          >
            📋 Copy Drill
          </button>
        </div>
      </div>
    </div>
  );
}
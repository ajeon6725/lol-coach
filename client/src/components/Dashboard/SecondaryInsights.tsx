interface SecondaryInsightsProps {
  analysis: {
    criticalIssues: Array<{ title: string; description: string }>;
    areasToImprove: Array<{ title: string; description: string }>;
    strengths: Array<{ title: string; description: string }>;
  };
}

interface InsightCardProps {
  icon: string;
  title: string;
  description: string;
  variant: "success" | "danger" | "warning";
}

export default function SecondaryInsights({ analysis }: SecondaryInsightsProps) {
  // Map AI insights to cards - prioritize issues over strengths
  const insights: InsightCardProps[] = [
    // 1 critical issue (most important)
    ...analysis.criticalIssues.slice(0, 1).map(c => ({
      icon: "🔴",
      title: c.title,
      description: c.description,
      variant: "danger" as const
    })),
    
    // 1 area to improve
    ...analysis.areasToImprove.slice(0, 1).map(a => ({
      icon: "⚠️",
      title: a.title,
      description: a.description,
      variant: "warning" as const
    })),
    
    // 1 strength (positive reinforcement last)
    ...analysis.strengths.slice(0, 1).map(s => ({
      icon: "✅",
      title: s.title,
      description: s.description,
      variant: "success" as const
    }))
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      {insights.map((insight, i) => (
        <InsightCard key={i} {...insight} />
      ))}
    </div>
  );
}

function InsightCard({ icon, title, description, variant }: InsightCardProps) {
  const colors = {
    success: "border-primary bg-primary/5 hover:bg-primary/10",
    danger: "border-danger bg-danger/5 hover:bg-danger/10",
    warning: "border-warning bg-warning/5 hover:bg-warning/10"
  };

  return (
    <div className={`border-l-4 ${colors[variant]} rounded-lg p-4 transition-colors`}>
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-bold text-light mb-2 text-base md:text-lg">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}
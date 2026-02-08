interface SecondaryInsightsProps {
  analysis: string;
}

interface InsightCardProps {
  icon: string;
  title: string;
  description: string;
  variant: "success" | "danger" | "warning";
}

export default function SecondaryInsights({ analysis }: SecondaryInsightsProps) {
  // TODO: Parse analysis text to extract actual insights
  // For now, using placeholder data
  
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      <InsightCard
        icon="✅"
        title="Strong Teamfight Presence"
        description="68% kill participation is excellent. You're showing up when it matters."
        variant="success"
      />
      <InsightCard
        icon="🔴"
        title="Vision Control Issues"
        description="Only buying control wards in 40% of games. This is getting you killed."
        variant="danger"
      />
      <InsightCard
        icon="⚠️"
        title="Itemization Timing"
        description="Completing core items 2min slower than average. Focus on efficient recalls."
        variant="warning"
      />
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
interface StatCardProps {
  label: string;
  value: string;
  positive: boolean;
}

export default function StatCard({ label, value, positive }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary hover:-translate-y-1 transition-all group relative overflow-hidden">
      {/* Top accent line on hover */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="text-xs text-muted uppercase tracking-wider mb-1 font-semibold">
        {label}
      </div>
      <div
        className={`font-display text-2xl md:text-3xl font-bold ${
          positive ? "text-primary" : "text-danger"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
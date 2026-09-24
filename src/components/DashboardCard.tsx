export function DashboardCard({ label, value, onClick }: { label: string; value: string | number; onClick?: () => void }) {
  return <button className="dashboard-card" onClick={onClick}><strong>{value}</strong><span>{label}</span></button>;
}

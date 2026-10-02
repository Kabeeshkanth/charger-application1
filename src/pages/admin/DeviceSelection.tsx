interface DeviceSelectionProps {
  title: string;
  description: string;
  onBack: () => void;
  onCharger: () => void;
  onPhone: () => void;
}

export default function DeviceSelection({
  title,
  description,
  onBack,
  onCharger,
  onPhone,
}: DeviceSelectionProps) {
  return (
    <div className="app-page">
      <header className="app-header">
        <div>
          <h1>MELWIRE LANKA (PVT) LTD</h1>
          <p>PHONE & CHARGER MANAGEMENT SYSTEM</p>
        </div>
      </header>
      <main className="dashboard">
        <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
        <div className="data-card">
          <h2>{title}</h2>
          <p>{description}</p>
          <div className="menu-grid">
            <button className="primary-button" onClick={onCharger}>Chargers</button>
            <button className="primary-button" onClick={onPhone}>Phones</button>
          </div>
        </div>
      </main>
    </div>
  );
}

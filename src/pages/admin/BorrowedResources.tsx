export default function BorrowedResources({
  onBack,
  onBorrowedCharger,
  onBorrowedPhone,
}: {
  onBack: () => void;
  onBorrowedCharger: () => void;
  onBorrowedPhone: () => void;
}) {
  return (
    <div className="app-page">
      <header className="app-header">
        <div>
          <h1>MELWIRE LANKA (PVT) LTD</h1>
          <p>PHONE & CHARGER MANAGEMENT SYSTEM</p>
        </div>
      </header>

      <main className="dashboard">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div className="data-card">
          <h2>Borrowed Phones & Chargers</h2>
          <p>Choose the borrowed device list you want to view.</p>

          <div className="menu-grid">
            <button className="primary-button" onClick={onBorrowedCharger}>
              Borrowed Chargers
            </button>
            <button className="primary-button" onClick={onBorrowedPhone}>
              Borrowed Phones
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

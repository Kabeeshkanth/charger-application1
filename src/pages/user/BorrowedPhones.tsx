import { useEffect, useState } from 'react';
import { FeedbackMessage } from '../../components/FeedbackMessage';
import { getCurrentlyBorrowedPhones } from '../../services/phoneTransactionService';

type BorrowedPhone = Awaited<ReturnType<typeof getCurrentlyBorrowedPhones>>[number];

export default function BorrowedPhones({ onBack }: { onBack: () => void }) {
  const [rows, setRows] = useState<BorrowedPhone[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setRows(await getCurrentlyBorrowedPhones());
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load borrowed phones.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="app-page user-app-page">
      {error && <FeedbackMessage type="error" message={error} onClose={() => setError('')} />}
      <header className="app-header">
        <div>
          <h1>MELWIRE LANKA (PVT) LTD</h1>
          <p>PHONE & CHARGER MANAGEMENT SYSTEM</p>
        </div>
      </header>
      <main className="dashboard">
        <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
        <div className="data-card">
          <div className="data-card-header">
            <div>
              <h2>Currently Borrowed Phones</h2>
              <p>See which employees currently have company phones.</p>
            </div>
            <span className="count-badge">{rows.length}</span>
          </div>
          {loading ? (
            <div className="empty-state">Loading borrowed phones...</div>
          ) : rows.length === 0 ? (
            <div className="empty-state">No phones are currently borrowed.</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Phone</th>
                    <th>Borrowed By</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const phone = Array.isArray(row.phones) ? row.phones[0] : row.phones;
                    return (
                      <tr key={row.id}>
                        <td>{phone?.phone_identifier || '—'}</td>
                        <td>{row.borrowed_person || 'Not recorded'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

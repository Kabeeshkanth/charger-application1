import { useEffect, useState } from 'react';
import { getTransactions } from '../../services/transactionService';

interface ReturnedChargersProps {
  onBack: () => void;
}

interface Transaction {
  id: number;
  charger_id: number;
  borrowed_date: string;
  borrowed_time: string;
  borrowed_person: string;
  returned_date: string | null;
  returned_time: string | null;
  returned_person: string | null;
  status: string;
  chargers?: {
    charger_name: string;
  };
}

export default function ReturnedChargers({
                                           onBack,
                                         }: ReturnedChargersProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(
      []
  );

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const data = await getTransactions();

      const returned = (data as Transaction[]).filter(
          (item) => item.status === 'returned'
      );

      setTransactions(returned);
    } catch (error) {
      alert(
          error instanceof Error
              ? error.message
              : 'Failed to load returned history.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
      <div className="app-page">
        <header className="app-header">
          <div>
            <h1>MELWIRE LANKA (PVT) LTD</h1>
            <p>CHARGER MANAGEMENT SYSTEM</p>
          </div>
        </header>

        <main className="dashboard">
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>

          <div className="data-card">
            <div className="data-card-header">
              <div>
                <h2>Returned Charger History</h2>
                <p>Complete history of returned chargers.</p>
              </div>

              <span className="count-badge">
              {transactions.length}
            </span>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : transactions.length === 0 ? (
                <div className="empty-state">
                  No returned charger records found.
                </div>
            ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                    <tr>
                      <th>Charger</th>
                      <th>Borrowed By</th>
                      <th>Borrowed Date</th>
                      <th>Returned To</th>
                      <th>Returned Date</th>
                      <th>Returned Time</th>
                      <th>Status</th>
                    </tr>
                    </thead>

                    <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <strong>
                              {transaction.chargers?.charger_name ||
                                  `Charger #${transaction.charger_id}`}
                            </strong>
                          </td>

                          <td>{transaction.borrowed_person}</td>

                          <td>{transaction.borrowed_date}</td>

                          <td>
                            {transaction.returned_person || '-'}
                          </td>

                          <td>
                            {transaction.returned_date || '-'}
                          </td>

                          <td>
                            {transaction.returned_time || '-'}
                          </td>

                          <td>
                        <span className="status-badge status-returned">
                          Returned
                        </span>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}
          </div>
        </main>
      </div>
  );
}
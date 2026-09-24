import { useEffect, useState } from 'react';
import { getTransactions } from '../../services/transactionService';
import { getBorrowedChargers } from '../../services/chargerService';
import { supabase } from '../../lib/supabase';

interface BorrowedChargersProps {
    onBack: () => void;
}

interface BorrowedTransaction {
    id: number | string;
    charger_id: number;
    borrowed_date: string | null;
    borrowed_time: string | null;
    borrowed_person: string | null;
    status: string;
    chargers?: {
        charger_name: string;
    };
}

export default function BorrowedChargers({
                                             onBack,
                                         }: BorrowedChargersProps) {
    const [transactions, setTransactions] = useState<
        BorrowedTransaction[]
    >([]);

    const [loading, setLoading] = useState(true);

    const loadData = async (showError = true) => {
        try {
            setLoading(true);

            const [borrowedChargers, transactionData] = await Promise.all([
                getBorrowedChargers(),
                getTransactions(),
            ]);
            const activeTransactions = transactionData.filter(
                (transaction) => transaction.status.toLowerCase() === 'borrowed'
            ) as BorrowedTransaction[];
            const transactionByCharger = new Map(
                activeTransactions.map((transaction) => [
                    transaction.charger_id,
                    transaction,
                ])
            );

            setTransactions(
                borrowedChargers.map((charger) => {
                    const transaction = transactionByCharger.get(charger.id);

                    return transaction || {
                        id: `charger-${charger.id}`,
                        charger_id: charger.id,
                        borrowed_date: null,
                        borrowed_time: null,
                        borrowed_person: null,
                        status: 'borrowed',
                        chargers: { charger_name: charger.charger_name },
                    };
                })
            );
        } catch (error) {
            if (showError) {
                alert(
                    error instanceof Error
                        ? error.message
                        : 'Failed to load borrowed chargers.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        const channel = supabase
            .channel('admin-borrowed-chargers')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'chargers' },
                () => {
                    void loadData(false);
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'charger_transactions' },
                () => {
                    void loadData(false);
                }
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
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
                            <h2>Borrowed Chargers</h2>
                            <p>Chargers currently issued to employees.</p>
                        </div>

                        <span className="count-badge">
              {transactions.length}
            </span>

                        <button
                            className="secondary-button"
                            onClick={() => void loadData()}
                            disabled={loading}
                        >
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : transactions.length === 0 ? (
                        <div className="empty-state">
                            No chargers are currently borrowed.
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                <tr>
                                    <th>Charger ID</th>
                                    <th>Charger</th>
                                    <th>Borrowed By</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                                </thead>

                                <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>#{transaction.charger_id}</td>
                                        <td>
                                            <strong>
                                                {transaction.chargers?.charger_name ||
                                                    `Charger #${transaction.charger_id}`}
                                            </strong>
                                        </td>

                                        <td>{transaction.borrowed_person || 'Not recorded'}</td>

                                        <td>{transaction.borrowed_date || '—'}</td>

                                        <td>{transaction.borrowed_time || '—'}</td>

                                        <td>
                        <span className="status-badge status-borrowed">
                          Borrowed
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
import { useEffect, useState } from 'react';
import { FeedbackMessage } from '../../components/FeedbackMessage';
import { getTransactions } from '../../services/transactionService';

interface ChargerReportRow {
    id: number;
    charger_id: number;
    borrowed_date: string;
    borrowed_time: string;
    borrowed_person: string;
    returned_date: string | null;
    returned_time: string | null;
    returned_person: string | null;
    status: string;
    chargers?: { charger_name: string };
}

interface ChargerReportsProps {
    onBack: () => void;
}

export default function ChargerReports({ onBack }: ChargerReportsProps) {
    const [rows, setRows] = useState<ChargerReportRow[]>([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const loadReport = async () => {
        try {
            setLoading(true);
            const data = await getTransactions();
            setRows(data as ChargerReportRow[]);
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load charger report.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadReport();
    }, []);

    const filteredRows = rows.filter((row) => {
        const activityDates = [row.borrowed_date, row.returned_date].filter(Boolean) as string[];
        return activityDates.some((date) =>
            (!fromDate || date >= fromDate) &&
            (!toDate || date <= toDate)
        );
    });

    return (
        <div className="app-page">
            {message && (
                <FeedbackMessage
                    type={message.type}
                    message={message.text}
                    onClose={() => setMessage(null)}
                />
            )}
            <header className="app-header">
                <div className="brand">
                    <div className="brand-mark">M</div>
                    <div>
                        <h1>MELWIRE LANKA (PVT) LTD</h1>
                        <p>CHARGER MANAGEMENT SYSTEM</p>
                    </div>
                </div>
            </header>

            <main className="dashboard">
                <button className="back-button" onClick={onBack}>← Back to Dashboard</button>

                <div className="data-card">
                    <div className="data-card-header report-header">
                        <div>
                            <h2>Charger Borrow & Return Report</h2>
                            <p>Filter charger activity by borrow or return date.</p>
                        </div>
                        <span className="count-badge">{filteredRows.length}</span>
                    </div>

                    <div className="report-filters">
                        <div className="form-group">
                            <label htmlFor="reportFrom">From date</label>
                            <input id="reportFrom" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reportTo">To date</label>
                            <input id="reportTo" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
                        </div>
                        <button className="secondary-button report-reset" onClick={() => { setFromDate(''); setToDate(''); }}>
                            Clear dates
                        </button>
                        <button className="secondary-button report-reset" onClick={() => void loadReport()} disabled={loading}>
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">Loading report...</div>
                    ) : filteredRows.length === 0 ? (
                        <div className="empty-state">No charger activity found for the selected dates.</div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                <tr>
                                    <th>Charger</th>
                                    <th>Borrowed Date</th>
                                    <th>Borrowed Time</th>
                                    <th>Borrowed By</th>
                                    <th>Returned Date</th>
                                    <th>Returned Time</th>
                                    <th>Returned To</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredRows.map((row) => (
                                    <tr key={row.id}>
                                        <td><strong>{row.chargers?.charger_name || `Charger #${row.charger_id}`}</strong></td>
                                        <td>{row.borrowed_date}</td>
                                        <td>{row.borrowed_time}</td>
                                        <td>{row.borrowed_person}</td>
                                        <td>{row.returned_date || '—'}</td>
                                        <td>{row.returned_time || '—'}</td>
                                        <td>{row.returned_person || '—'}</td>
                                        <td>
                                            <span className={`status-badge ${row.status === 'returned' ? 'status-returned' : 'status-borrowed'}`}>
                                                {row.status === 'returned' ? 'Returned' : 'Borrowed'}
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

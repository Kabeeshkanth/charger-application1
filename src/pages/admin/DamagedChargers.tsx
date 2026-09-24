import { useEffect, useState } from 'react';
import { FeedbackMessage } from '../../components/FeedbackMessage';
import { getAllChargers } from '../../services/chargerService';
import {
    addDamageReport,
    getDamageReports,
    isDamageTableMissing,
    updateDamageReport,
} from '../../services/damageService';
import type { Charger } from '../../types/charger';
import type { DamageRepairStatus, DamageReport } from '../../types/damage';

interface DamagedChargersProps {
    onBack: () => void;
}

export default function DamagedChargers({ onBack }: DamagedChargersProps) {
    const [chargers, setChargers] = useState<Charger[]>([]);
    const [reports, setReports] = useState<DamageReport[]>([]);
    const [chargerId, setChargerId] = useState('');
    const [description, setDescription] = useState('');
    const [filter, setFilter] = useState<'all' | DamageRepairStatus>('all');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [databaseSetupRequired, setDatabaseSetupRequired] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [chargerData, reportData] = await Promise.all([
                getAllChargers(),
                getDamageReports(),
            ]);
            setChargers(chargerData);
            setReports(reportData);
        } catch (error) {
            setDatabaseSetupRequired(isDamageTableMissing(error));
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to load damage records.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const resetForm = () => {
        setEditingId(null);
        setChargerId('');
        setDescription('');
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (databaseSetupRequired) {
            setMessage({
                type: 'error',
                text: 'Apply the damage tracking SQL migration in Supabase before adding records.',
            });
            return;
        }
        if (!chargerId || !description.trim()) {
            setMessage({ type: 'error', text: 'Select a charger and describe the damage.' });
            return;
        }

        try {
            setSaving(true);
            if (editingId === null) {
                await addDamageReport(Number(chargerId), description);
                setMessage({ type: 'success', text: 'Damaged charger recorded successfully.' });
            } else {
                const current = reports.find((report) => report.id === editingId);
                await updateDamageReport(
                    editingId,
                    description,
                    current?.repair_status || 'pending'
                );
                setMessage({ type: 'success', text: 'Damage report updated successfully.' });
            }
            resetForm();
            await loadData();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to save damage report.',
            });
        } finally {
            setSaving(false);
        }
    };

    const editReport = (report: DamageReport) => {
        setEditingId(report.id);
        setChargerId(String(report.charger_id));
        setDescription(report.damage_description);
    };

    const changeStatus = async (report: DamageReport, status: DamageRepairStatus) => {
        try {
            await updateDamageReport(report.id, report.damage_description, status);
            setMessage({
                type: 'success',
                text: status === 'repaired' ? 'Charger marked as repaired.' : 'Charger marked as pending repair.',
            });
            await loadData();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to update repair status.',
            });
        }
    };

    const visibleReports = reports.filter(
        (report) => filter === 'all' || report.repair_status === filter
    );

    return (
        <div className="app-page">
            <header className="app-header">
                <div>
                    <h1>MELWIRE LANKA (PVT) LTD</h1>
                    <p>CHARGER MANAGEMENT SYSTEM</p>
                </div>
            </header>

            {message && (
                <FeedbackMessage
                    type={message.type}
                    message={message.text}
                    onClose={() => setMessage(null)}
                />
            )}

            <main className="dashboard">
                <button className="back-button" onClick={onBack}>← Back to Dashboard</button>

                <div className="data-card damage-form-card">
                    {databaseSetupRequired && (
                        <div className="form-notice">
                            <strong>Database setup required</strong>
                            <span>
                                Run <code>supabase/migrations/001_damage_chargers.sql</code> in the Supabase SQL Editor,
                                then reload this page.
                            </span>
                        </div>
                    )}
                    <div className="data-card-header">
                        <div>
                            <h2>{editingId === null ? 'Record Damaged Charger' : 'Edit Damage Report'}</h2>
                            <p>Track damaged chargers and repair progress.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="damageCharger">Charger</label>
                                <select
                                    id="damageCharger"
                                    value={chargerId}
                                    onChange={(event) => setChargerId(event.target.value)}
                                    disabled={editingId !== null}
                                    required
                                >
                                    <option value="">Select a charger</option>
                                    {chargers.map((charger) => (
                                        <option key={charger.id} value={charger.id}>
                                            {charger.charger_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="damageDescription">Damage description</label>
                                <input
                                    id="damageDescription"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="Example: Cable is damaged"
                                    required
                                />
                            </div>
                        </div>
                        <button className="primary-button" type="submit" disabled={saving}>
                            {saving ? 'Saving...' : editingId === null ? 'Record Damage' : 'Update Report'}
                        </button>
                        {editingId !== null && (
                            <button className="secondary-button damage-cancel-button" type="button" onClick={resetForm}>
                                Cancel Edit
                            </button>
                        )}
                    </form>
                </div>

                <div className="data-card">
                    <div className="data-card-header">
                        <div>
                            <h2>Damage Records</h2>
                            <p>Pending repairs and repaired charger history.</p>
                        </div>
                        <div className="damage-filters">
                            {(['all', 'pending', 'repaired'] as const).map((value) => (
                                <button
                                    key={value}
                                    className={filter === value ? 'primary-button' : 'secondary-button'}
                                    onClick={() => setFilter(value)}
                                >
                                    {value === 'all' ? 'All' : value === 'pending' ? 'Needs Repair' : 'Repaired'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading">Loading damage records...</div>
                    ) : visibleReports.length === 0 ? (
                        <div className="empty-state">No damage records found.</div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                <tr>
                                    <th>Charger</th>
                                    <th>Damage</th>
                                    <th>Reported</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {visibleReports.map((report) => (
                                    <tr key={report.id}>
                                        <td>{report.chargers?.charger_name || `Charger #${report.charger_id}`}</td>
                                        <td>{report.damage_description}</td>
                                        <td>{new Date(report.reported_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${report.repair_status === 'repaired' ? 'status-returned' : 'status-borrowed'}`}>
                                                {report.repair_status === 'repaired' ? 'Repaired' : 'Needs Repair'}
                                            </span>
                                        </td>
                                        <td className="damage-actions">
                                            <button className="secondary-button" onClick={() => editReport(report)}>Edit</button>
                                            <button
                                                className="secondary-button"
                                                onClick={() => void changeStatus(report, report.repair_status === 'repaired' ? 'pending' : 'repaired')}
                                            >
                                                {report.repair_status === 'repaired' ? 'Needs Repair' : 'Mark Repaired'}
                                            </button>
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

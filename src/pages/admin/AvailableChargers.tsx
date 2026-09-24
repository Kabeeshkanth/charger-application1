import { useEffect, useState } from 'react';
import {
    deleteCharger,
    getAvailableChargers,
    updateCharger,
} from '../../services/chargerService';
import type { Charger } from '../../types/charger';
import { FeedbackMessage } from '../../components/FeedbackMessage';

interface AvailableChargersProps {
    onBack: () => void;
}

export default function AvailableChargers({
                                              onBack,
                                          }: AvailableChargersProps) {
    const [chargers, setChargers] = useState<Charger[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const loadChargers = async () => {
        try {
            setLoading(true);

            const data = await getAvailableChargers();

            setChargers(data);
        } catch (error) {
            console.error(error);

            alert(
                error instanceof Error
                    ? error.message
                    : 'Failed to load available chargers.'
            );
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (charger: Charger) => {
        setEditingId(charger.id);
        setEditName(charger.charger_name);
        setEditDescription(charger.description || '');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
        setEditDescription('');
    };

    const saveEdit = async () => {
        if (!editingId || !editName.trim()) {
            setMessage({ type: 'error', text: 'Enter a charger name before saving.' });
            return;
        }

        try {
            await updateCharger(editingId, editName, editDescription);
            setMessage({ type: 'success', text: 'Charger updated successfully.' });
            cancelEditing();
            await loadChargers();
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update charger.' });
        }
    };

    const removeCharger = async (charger: Charger) => {
        if (!window.confirm(`Delete ${charger.charger_name}? This cannot be undone.`)) {
            return;
        }

        try {
            await deleteCharger(charger.id);
            setMessage({ type: 'success', text: 'Charger deleted successfully.' });
            await loadChargers();
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete charger.' });
        }
    };

    useEffect(() => {
        loadChargers();
    }, []);

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
                <div>
                    <h1>MELWIRE LANKA (PVT) LTD</h1>
                    <p>CHARGER MANAGEMENT SYSTEM</p>
                </div>
            </header>

            <main className="dashboard">

                <button
                    className="back-button"
                    onClick={onBack}
                >
                    ← Back to Dashboard
                </button>

                <div className="data-card">

                    <div className="data-card-header">
                        <div>
                            <h2>Available Chargers</h2>

                            <p>
                                Chargers currently available for borrowing.
                            </p>
                        </div>

                        <span className="count-badge">
              {chargers.length}
            </span>
                    </div>

                    {loading ? (
                        <div className="loading">
                            Loading available chargers...
                        </div>
                    ) : chargers.length === 0 ? (
                        <div className="empty-state">
                            <strong>No chargers available</strong>
                            <p>
                                All chargers are currently borrowed.
                            </p>
                        </div>
                    ) : (
                        <div className="table-wrapper">

                            <table>

                                <thead>
                                <tr>
                                    <th>Charger Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>

                                <tbody>

                                {chargers.map((charger) => (
                                    <tr key={charger.id}>

                                        {editingId === charger.id ? (
                                            <>
                                                <td>
                                                    <input
                                                        className="table-edit-input"
                                                        value={editName}
                                                        onChange={(event) => setEditName(event.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className="table-edit-input"
                                                        value={editDescription}
                                                        onChange={(event) => setEditDescription(event.target.value)}
                                                    />
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td><strong>{charger.charger_name}</strong></td>
                                                <td>{charger.description || 'Mobile Charger'}</td>
                                            </>
                                        )}

                                        <td>
                                            <span className="status-badge status-available">Available</span>
                                        </td>
                                        <td className="damage-actions">
                                            {editingId === charger.id ? (
                                                <>
                                                    <button className="primary-button table-action-button" onClick={() => void saveEdit()}>Save</button>
                                                    <button className="secondary-button table-action-button" onClick={cancelEditing}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="secondary-button table-action-button" onClick={() => startEditing(charger)}>Edit</button>
                                                    <button className="secondary-button table-action-button danger-action" onClick={() => void removeCharger(charger)}>Delete</button>
                                                </>
                                            )}
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
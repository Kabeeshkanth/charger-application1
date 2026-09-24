import { useState } from 'react';
import { addCharger } from '../../services/chargerService';
import { FeedbackMessage } from '../../components/FeedbackMessage';

interface AddChargerProps {
  onBack: () => void;
}

export default function AddCharger({ onBack }: AddChargerProps) {
  const [chargerName, setChargerName] = useState('');
  const [description, setDescription] = useState('Mobile Charger');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!chargerName.trim()) {
      setMessage({ type: 'error', text: 'Please enter charger name.' });
      return;
    }

    try {
      setLoading(true);

      await addCharger(chargerName, description);

      setMessage({ type: 'success', text: 'Charger added successfully.' });

      setChargerName('');
      setDescription('Mobile Charger');
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to add charger.' });
    } finally {
      setLoading(false);
    }
  };

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

        <main className="form-page">
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>

          <div className="form-card">
            <h2>Add New Charger</h2>
            <p>Register a new company mobile charger.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Charger Name</label>

                <input
                    type="text"
                    placeholder="Example: CHARGER-06"
                    value={chargerName}
                    onChange={(e) => setChargerName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <input
                    type="text"
                    placeholder="Mobile Charger"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                  type="submit"
                  className="primary-button full-width"
                  disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Charger'}
              </button>
            </form>
          </div>
        </main>
      </div>
  );
}
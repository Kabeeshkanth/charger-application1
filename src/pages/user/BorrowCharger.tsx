import { useEffect, useState } from 'react';

import { getAvailableChargers } from '../../services/chargerService';
import { borrowCharger } from '../../services/transactionService';

import type { Charger } from '../../types/charger';
import { FeedbackMessage } from '../../components/FeedbackMessage';
import { getLocalDateTime } from '../../lib/dateTime';

interface BorrowChargerProps {
  onBack: () => void;
}

export default function BorrowCharger({
                                        onBack,
                                      }: BorrowChargerProps) {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [chargerId, setChargerId] = useState('');
  const [borrowedDate, setBorrowedDate] = useState('');
  const [borrowedTime, setBorrowedTime] = useState('');
  const [borrowedPerson, setBorrowedPerson] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const now = getLocalDateTime();
    setBorrowedDate(now.date);
    setBorrowedTime(now.time);

    loadChargers();
  }, []);

  const loadChargers = async () => {
    try {
      setLoading(true);

      const data = await getAvailableChargers();

      setChargers(data);

      if (data.length > 0) {
        setChargerId(String(data[0].id));
      } else {
        setChargerId('');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load available chargers.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
      event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!chargerId) {
      setMessage({ type: 'error', text: 'Please select a charger.' });
      return;
    }

    if (!borrowedPerson.trim()) {
      setMessage({ type: 'error', text: 'Please enter your name.' });
      return;
    }

    try {
      setSaving(true);

      await borrowCharger(
          Number(chargerId),
          borrowedDate,
          borrowedTime,
          borrowedPerson
      );

      setMessage({ type: 'success', text: 'Charger borrowed successfully.' });
      window.setTimeout(onBack, 1200);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to borrow charger.' });

      await loadChargers();
    } finally {
      setSaving(false);
    }
  };

  return (
      <div className="app-page user-app-page">
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

        <main className="form-page user-form-page">
          <button
              className="back-button"
              onClick={onBack}
          >
            ← Back to Dashboard
          </button>

          <div className="form-card user-form-card">
            <div className="form-title-area">
              <div className="large-page-icon borrow-icon">
                ↓
              </div>

              <div>
                <h2>Borrow Charger</h2>

                <p>
                  Select an available company charger and enter
                  your details.
                </p>
              </div>
            </div>

            <div className="form-step">
              <span>1</span>

              <div>
                <strong>Select Charger</strong>

                <small>
                  Only available chargers are shown.
                </small>
              </div>
            </div>

            {loading ? (
                <div className="loading-box">
                  <div className="spinner"></div>

                  <span>
                Checking available chargers...
              </span>
                </div>
            ) : chargers.length === 0 ? (
                <div className="empty-state user-empty-state">
                  <div className="empty-icon">!</div>

                  <strong>No Chargers Available</strong>

                  <p>
                    All company chargers are currently borrowed.
                    Please try again later.
                  </p>

                  <button
                      className="secondary-button"
                      onClick={loadChargers}
                  >
                    Refresh
                  </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="charger">
                      Available Charger
                    </label>

                    <select
                        id="charger"
                        value={chargerId}
                        onChange={(e) =>
                            setChargerId(e.target.value)
                        }
                        required
                    >
                      <option value="">
                        Select a charger
                      </option>

                      {chargers.map((charger) => (
                          <option
                              key={charger.id}
                              value={charger.id}
                          >
                            {charger.charger_name}
                          </option>
                      ))}
                    </select>

                    <small className="field-help">
                      {chargers.length} charger
                      {chargers.length !== 1 ? 's' : ''}{' '}
                      currently available
                    </small>
                  </div>

                  <div className="form-step">
                    <span>2</span>

                    <div>
                      <strong>Borrowing Details</strong>

                      <small>
                        Confirm the date, time and employee name.
                      </small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="borrowedDate">
                        Date
                      </label>

                      <input
                          id="borrowedDate"
                          type="date"
                          value={borrowedDate}
                          onChange={(e) =>
                              setBorrowedDate(e.target.value)
                          }
                          required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="borrowedTime">
                        Time
                      </label>

                      <input
                          id="borrowedTime"
                          type="time"
                          value={borrowedTime}
                          onChange={(e) =>
                              setBorrowedTime(e.target.value)
                          }
                          required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="borrowedPerson">
                      Employee Name
                    </label>

                    <input
                        id="borrowedPerson"
                        type="text"
                        placeholder="Enter your name"
                        value={borrowedPerson}
                        onChange={(e) =>
                            setBorrowedPerson(e.target.value)
                        }
                        required
                    />
                  </div>

                  <div className="form-notice">
                    <strong>Before borrowing</strong>

                    <span>
                  Please make sure the charger is physically
                  collected before submitting this record.
                </span>
                  </div>

                  <button
                      type="submit"
                      className="primary-button full-width submit-button"
                      disabled={saving}
                  >
                    {saving
                        ? 'Processing...'
                        : 'Confirm Borrowing'}
                  </button>
                </form>
            )}
          </div>
        </main>

        <footer className="app-footer">
          Melwire Lanka (Pvt) Ltd
        </footer>
      </div>
  );
}
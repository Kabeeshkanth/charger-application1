import { useEffect, useState } from 'react';

import { getBorrowedChargers } from '../../services/chargerService';
import { returnCharger } from '../../services/transactionService';

import type { Charger } from '../../types/charger';
import { FeedbackMessage } from '../../components/FeedbackMessage';
import { getLocalDateTime } from '../../lib/dateTime';
import { getItTeamMembers } from '../../services/teamService';
import type { ItTeamMember } from '../../types/team';

interface ReturnChargerProps {
  onBack: () => void;
}

export default function ReturnCharger({
                                        onBack,
                                      }: ReturnChargerProps) {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [chargerId, setChargerId] = useState('');
  const [returnedDate, setReturnedDate] = useState('');
  const [returnedTime, setReturnedTime] = useState('');
  const [returnedToMemberId, setReturnedToMemberId] = useState('');
  const [teamMembers, setTeamMembers] = useState<ItTeamMember[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const now = getLocalDateTime();
    setReturnedDate(now.date);
    setReturnedTime(now.time);

    void loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadChargers(), loadTeamMembers()]);
  };

  const loadTeamMembers = async () => {
    try {
      const data = await getItTeamMembers();
      setTeamMembers(data);
      setReturnedToMemberId(data.length > 0 ? String(data[0].id) : '');
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load IT team members.' });
    }
  };

  const loadChargers = async () => {
    try {
      setLoading(true);

      const data = await getBorrowedChargers();

      setChargers(data);

      if (data.length > 0) {
        setChargerId(String(data[0].id));
      } else {
        setChargerId('');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load borrowed chargers.' });
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

    const returnedToMember = teamMembers.find((member) => String(member.id) === returnedToMemberId);
    if (!returnedToMember) {
      setMessage({ type: 'error', text: 'Please select the IT team member who received the charger.' });
      return;
    }

    try {
      setSaving(true);

      await returnCharger(
          Number(chargerId),
          returnedDate,
          returnedTime,
          returnedToMember.name,
          returnedToMember.id
      );

      setChargers((currentChargers) =>
          currentChargers.filter((charger) => charger.id !== Number(chargerId))
      );
      setChargerId('');
      setMessage({ type: 'success', text: 'Charger returned successfully.' });
      window.setTimeout(onBack, 1200);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to return charger.' });

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
              <div className="large-page-icon return-icon">
                ↑
              </div>

              <div>
                <h2>Return Charger</h2>

                <p>
                  Select the charger being returned and confirm
                  the return details.
                </p>
              </div>
            </div>

            <div className="form-step">
              <span>1</span>

              <div>
                <strong>Select Charger</strong>

                <small>
                  Only currently borrowed chargers are shown.
                </small>
              </div>
            </div>

            {loading ? (
                <div className="loading-box">
                  <div className="spinner"></div>

                  <span>
                Checking borrowed chargers...
              </span>
                </div>
            ) : chargers.length === 0 ? (
                <div className="empty-state user-empty-state">
                  <div className="empty-icon return-empty-icon">
                    ✓
                  </div>

                  <strong>No Borrowed Chargers</strong>

                  <p>
                    There are currently no chargers that need to
                    be returned.
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
                    <label htmlFor="returnCharger">
                      Borrowed Charger
                    </label>

                    <select
                        id="returnCharger"
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
                      {chargers.length !== 1 ? 's are' : ' is'}{' '}
                      currently borrowed
                    </small>
                  </div>

                  <div className="form-step">
                    <span>2</span>

                    <div>
                      <strong>Return Details</strong>

                      <small>Confirm the date, time and IT team member.</small>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="returnedDate">
                        Date
                      </label>

                      <input
                          id="returnedDate"
                          type="date"
                          value={returnedDate}
                          onChange={(e) =>
                              setReturnedDate(e.target.value)
                          }
                          required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="returnedTime">
                        Time
                      </label>

                      <input
                          id="returnedTime"
                          type="time"
                          value={returnedTime}
                          onChange={(e) =>
                              setReturnedTime(e.target.value)
                          }
                          required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="returnedToMember">Returned To</label>
                    <select
                        id="returnedToMember"
                        value={returnedToMemberId}
                        onChange={(e) => setReturnedToMemberId(e.target.value)}
                        required
                        disabled={teamMembers.length === 0}
                    >
                      <option value="">Select an IT team member</option>
                      {teamMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} - {member.position}
                          </option>
                      ))}
                    </select>
                    {teamMembers.length === 0 && (
                        <small className="field-help">An admin must add IT team members before a return can be recorded.</small>
                    )}
                  </div>

                  <div className="form-notice return-notice">
                    <strong>Before returning</strong>

                    <span>
                  Please return the charger to the designated
                  location before completing this record.
                </span>
                  </div>

                  <button
                      type="submit"
                      className="primary-button full-width submit-button"
                      disabled={saving}
                  >
                    {saving
                        ? 'Processing...'
                        : 'Confirm Return'}
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
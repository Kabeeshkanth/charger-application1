import { useState } from 'react';
import { addPhone } from '../../services/phoneService';
import { FeedbackMessage } from '../../components/FeedbackMessage';

export default function AddPhone({ onBack }: { onBack: () => void }) {
  const [phoneIdentifier, setPhoneIdentifier] = useState('');
  const [description, setDescription] = useState('Company Phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!phoneIdentifier.trim() || !phoneNumber.trim()) { setMessage({ type: 'error', text: 'Phone ID and phone number are required.' }); return; }
    if (!/^\d{10}$/.test(phoneNumber)) { setMessage({ type: 'error', text: 'Phone number must contain exactly 10 digits.' }); return; }
    try { setSaving(true); await addPhone(phoneIdentifier, description, phoneNumber); setPhoneIdentifier(''); setDescription('Company Phone'); setPhoneNumber(''); setMessage({ type: 'success', text: 'Phone added successfully.' }); }
    catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to add phone.' }); }
    finally { setSaving(false); }
  };
  return <div className="app-page">{message && <FeedbackMessage type={message.type} message={message.text} onClose={() => setMessage(null)} />}<header className="app-header"><div><h1>MELWIRE LANKA (PVT) LTD</h1><p>PHONE & CHARGER MANAGEMENT SYSTEM</p></div></header><main className="form-page"><button className="back-button" onClick={onBack}>← Back</button><div className="form-card"><h2>Add New Phone</h2><p>Register a company phone for borrowing.</p><form onSubmit={submit}><div className="form-group"><label htmlFor="phoneIdentifier">Phone ID</label><input id="phoneIdentifier" value={phoneIdentifier} onChange={e => setPhoneIdentifier(e.target.value)} placeholder="Example: PHONE-01" required /></div><div className="form-group"><label htmlFor="phoneDescription">Description</label><input id="phoneDescription" value={description} onChange={e => setDescription(e.target.value)} /></div><div className="form-group"><label htmlFor="phoneNumber">Phone number</label><input id="phoneNumber" type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit phone number" title="Enter exactly 10 digits" required /><small className="field-help">Enter exactly 10 digits.</small></div><button className="primary-button full-width" disabled={saving}>{saving ? 'Adding...' : 'Add Phone'}</button></form></div></main></div>;
}

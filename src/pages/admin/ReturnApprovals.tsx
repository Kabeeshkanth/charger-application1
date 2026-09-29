import { useEffect, useState } from 'react';
import type { AppUser } from '../../types/auth';
import { approveChargerReturn, getPendingReturns } from '../../services/transactionService';

interface Props { user: AppUser; onBack: () => void; }
interface PendingReturn {
  id: number; borrowed_person: string; returned_by_username: string;
  returned_date: string; returned_time: string; returned_person: string;
  chargers?: { charger_name: string };
}

export default function ReturnApprovals({ user, onBack }: Props) {
  const [items, setItems] = useState<PendingReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try { setItems(await getPendingReturns(user.user_id) as PendingReturn[]); }
    catch (error) { alert(error instanceof Error ? error.message : 'Failed to load pending returns.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [user.user_id]);
  const approve = async (id: number) => {
    try { await approveChargerReturn(id, user.user_id); await load(); }
    catch (error) { alert(error instanceof Error ? error.message : 'Failed to approve return.'); }
  };
  return <div className="app-page"><header className="app-header"><div><h1>MELWIRE LANKA (PVT) LTD</h1><p>CHARGER MANAGEMENT SYSTEM</p></div></header>
    <main className="dashboard"><button className="back-button" onClick={onBack}>← Back to Dashboard</button>
      <div className="data-card"><div className="data-card-header"><div><h2>Return Approvals</h2><p>Confirm chargers received by you.</p></div><span className="count-badge">{items.length}</span></div>
        {loading ? <div className="loading">Loading...</div> : items.length === 0 ? <div className="empty-state">No returns are waiting for confirmation.</div> :
          <div className="table-wrapper"><table><thead><tr><th>Charger</th><th>Returning User</th><th>Date</th><th>Returned To</th><th>Action</th></tr></thead><tbody>
            {items.map(item => <tr key={item.id}><td><strong>{item.chargers?.charger_name || 'Charger'}</strong></td><td>{item.returned_by_username || item.borrowed_person}</td><td>{item.returned_date} {item.returned_time}</td><td>{item.returned_person}</td><td><button className="primary-button" onClick={() => void approve(item.id)}>Approve Receipt</button></td></tr>)}
          </tbody></table></div>}
      </div>
    </main></div>;
}

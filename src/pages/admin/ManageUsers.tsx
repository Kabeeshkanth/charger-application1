import { useEffect, useState } from 'react';
import { createAppUser, deleteAppUser, getAppUsers, updateAppUser } from '../../services/authService';
import type { AppUser } from '../../types/auth';

interface ManageUsersProps {
  onBack: () => void;
}

export default function ManageUsers({ onBack }: ManageUsersProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await getAppUsers());
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingId === null) {
        await createAppUser(username, password);
      } else {
        await updateAppUser(editingId, username, password);
      }
      resetForm();
      await loadUsers();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save user.');
    }
  };

  const handleDelete = async (appUser: AppUser) => {
    if (appUser.role === 'admin') {
      alert('Admin accounts cannot be deleted here.');
      return;
    }

    if (!window.confirm(`Delete user "${appUser.username}"?`)) {
      return;
    }

    try {
      await deleteAppUser(appUser.user_id);
      if (editingId === appUser.user_id) {
        resetForm();
      }
      await loadUsers();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete user.');
    }
  };

  return (
    <div className="app-page">
      <header className="app-header">
        <div><h1>MELWIRE LANKA (PVT) LTD</h1><p>CHARGER MANAGEMENT SYSTEM</p></div>
      </header>
      <main className="dashboard">
        <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
        <div className="section-title">User Management</div>
        <div className="admin-management-grid">
          <form className="form-card admin-management-card" onSubmit={handleSubmit}>
            <h3>{editingId === null ? 'Create User' : 'Edit User'}</h3>
            <p>Create or update a user ID and password.</p>
            <div className="form-group">
              <label htmlFor="managedUsername">User ID</label>
              <input id="managedUsername" value={username} onChange={(event) => setUsername(event.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="managedPassword">Password {editingId !== null && '(leave blank to keep current)'}</label>
              <input id="managedPassword" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required={editingId === null} />
            </div>
            <button className="primary-button full-width" type="submit">
              {editingId === null ? 'Create User' : 'Save Changes'}
            </button>
            {editingId !== null && <button className="secondary-button full-width" type="button" onClick={resetForm}>Cancel Edit</button>}
          </form>
          <div className="team-member-list">
            <h3>Created Users</h3>
            {loading ? <p>Loading users...</p> : users.map((appUser) => (
              <div className="team-member-row" key={appUser.user_id}>
                <span><strong>{appUser.username}</strong> ({appUser.role})</span>
                <div className="user-row-actions">
                  <button className="secondary-button" type="button" onClick={() => {
                    setEditingId(appUser.user_id);
                    setUsername(appUser.username);
                    setPassword('');
                  }}>Edit</button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => void handleDelete(appUser)}
                    disabled={appUser.role === 'admin'}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

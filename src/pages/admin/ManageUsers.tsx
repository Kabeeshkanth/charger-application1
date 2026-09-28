import { useEffect, useState } from 'react';
import { createAppUser, deleteAppUser, getAppUsers, updateAppUserRole } from '../../services/authService';
import type { AppUser } from '../../types/auth';

interface ManageUsersProps {
  onBack: () => void;
}

export default function ManageUsers({ onBack }: ManageUsersProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [section] = useState<'users'>('users');

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createAppUser(username, password);
      setUsername('');
      setPassword('');
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
        <div className="management-options">
          <button className="primary-button" type="button">
            Add User
          </button>
        </div>
        {section === 'users' ? (
          <div className="admin-management-grid">
          <form className="form-card admin-management-card" onSubmit={handleSubmit}>
            <h3>Create User</h3>
            <p>Create a regular user account.</p>
            <div className="form-group">
              <label htmlFor="managedUsername">User ID</label>
              <input id="managedUsername" value={username} onChange={(event) => setUsername(event.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="managedPassword">Password</label>
              <input id="managedPassword" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <button className="primary-button full-width" type="submit">Create User</button>
          </form>
          <div className="team-member-list">
            <h3>Created Users</h3>
            {loading ? <p>Loading users...</p> : users.map((appUser) => (
              <div className="team-member-row" key={appUser.user_id}>
                <span><strong>{appUser.username}</strong></span>
                <div className="user-row-actions">
                  <select
                    value={appUser.role}
                    aria-label={`Role for ${appUser.username}`}
                    onChange={async (event) => {
                      try {
                        await updateAppUserRole(appUser.user_id, event.target.value as AppUser['role']);
                        await loadUsers();
                      } catch (error) {
                        alert(error instanceof Error ? error.message : 'Failed to update user role.');
                      }
                    }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
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
        ) : null}
      </main>
    </div>
  );
}

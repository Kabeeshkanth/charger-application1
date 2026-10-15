import { useEffect, useState } from 'react';
import { createAppUser, deleteAppUser, getAppUsers, updateAppUser, updateAppUserRole } from '../../services/authService';
import type { AppUser } from '../../types/auth';

interface ManageUsersProps {
  onBack: () => void;
}

export default function ManageUsers({ onBack }: ManageUsersProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
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

  const startEditing = (appUser: AppUser) => {
    setEditingUser(appUser);
    setEditUsername(appUser.username);
    setEditPassword('');
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditUsername('');
    setEditPassword('');
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    try {
      await updateAppUser(editingUser.user_id, editUsername, editPassword);
      cancelEditing();
      await loadUsers();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update user.');
    } finally {
      setSavingEdit(false);
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
            {editingUser ? (
              <form className="user-edit-form" onSubmit={handleEditSubmit}>
                <div className="user-edit-heading">
                  <div>
                    <h4>Edit User</h4>
                    <p>Update the username or set a new password for {editingUser.username}.</p>
                  </div>
                  <button className="secondary-button" type="button" onClick={cancelEditing} disabled={savingEdit}>
                    Cancel
                  </button>
                </div>
                <div className="form-group">
                  <label htmlFor="editManagedUsername">Username</label>
                  <input
                    id="editManagedUsername"
                    value={editUsername}
                    onChange={(event) => setEditUsername(event.target.value)}
                    required
                    disabled={savingEdit}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editManagedPassword">New password</label>
                  <input
                    id="editManagedPassword"
                    type="password"
                    value={editPassword}
                    onChange={(event) => setEditPassword(event.target.value)}
                    placeholder="Leave blank to keep the current password"
                    disabled={savingEdit}
                  />
                </div>
                <button className="primary-button full-width" type="submit" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : null}
            {loading ? <p>Loading users...</p> : users.map((appUser) => (
              <div className="team-member-row" key={appUser.user_id}>
                <span><strong>{appUser.username}</strong></span>
                <div className="user-row-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => startEditing(appUser)}
                  >
                    Edit
                  </button>
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

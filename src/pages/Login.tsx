import { useState } from 'react';
import { login } from '../services/authService';
import type { AppUser } from '../types/auth';

interface LoginProps {
  onLogin: (user: AppUser) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError('Please enter username and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const user = await login(username, password);

      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-header">
            <div className="login-logo" aria-hidden="true">M</div>
            <h1>MELWIRE LANKA (PVT) LTD</h1>
            <p>CHARGER MANAGEMENT SYSTEM</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>

            <div className="login-field">
              <label htmlFor="username">Username</label>

              <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>

              <input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
              />
            </div>

            {error && (
                <div className="login-error" role="alert">
                  {error}
                </div>
            )}

            <button
                className="login-button"
                type="submit"
                disabled={loading}
            >
              {loading ? 'LOGIN...' : 'LOGIN'}
            </button>

          </form>

          <div className="login-footer">
            Secure charger tracking and management
          </div>

        </div>
      </div>
  );
}
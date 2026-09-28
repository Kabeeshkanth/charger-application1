import type { AppUser } from '../../types/auth';
import { useEffect, useState } from 'react';
import { getUserReturnStatus } from '../../services/transactionService';

interface UserDashboardProps {
    user: AppUser;
    onLogout: () => void;
    onBorrow: () => void;
    onReturn: () => void;
}

export default function UserDashboard({
                                          user,
                                          onLogout,
                                          onBorrow,
                                          onReturn,
                                      }: UserDashboardProps) {
    const [returnStatus, setReturnStatus] = useState<{ status: string; chargerName: string } | null>(null);
    useEffect(() => {
        let active = true;
        const loadStatus = async () => {
            const result = await getUserReturnStatus(user.username);
            const charger = result?.chargers as { charger_name: string } | null | undefined;
            if (active && result) setReturnStatus({ status: result.status, chargerName: charger?.charger_name || 'Your charger' });
        };
        void loadStatus();
        const timer = window.setInterval(() => void loadStatus(), 10000);
        return () => { active = false; window.clearInterval(timer); };
    }, [user.username]);
    return (
        <div className="app-page user-app-page">
            {returnStatus && <div className={`return-status-popup ${returnStatus.status === 'returned' ? 'return-status-success' : ''}`}>
                <strong>{returnStatus.status === 'returned' ? 'Return Confirmed' : 'Return Pending Confirmation'}</strong>
                <span>{returnStatus.chargerName} - {returnStatus.status === 'returned' ? 'An admin confirmed receipt.' : 'Waiting for the selected admin to approve receipt.'}</span>
                {returnStatus.status === 'returned' && <button onClick={() => setReturnStatus(null)}>Close</button>}
            </div>}
            <header className="app-header">
                <div className="brand">
                    <div className="brand-mark">M</div>

                    <div>
                        <h1>MELWIRE LANKA (PVT) LTD</h1>
                        <p>CHARGER MANAGEMENT SYSTEM</p>
                    </div>
                </div>

                <div className="user-info">
                    <div className="user-avatar">
                        {user.username.charAt(0).toUpperCase()}
                    </div>

                    <div className="user-details">
                        <strong>{user.username}</strong>
                        <span>Employee</span>
                    </div>

                    <button
                        className="logout-button"
                        onClick={onLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="user-dashboard">
                <section className="welcome-section">
                    <span className="welcome-label">WELCOME</span>

                    <h2>Hello, {user.username}</h2>

                    <p>
                        Manage your company mobile charger easily and securely.
                    </p>
                </section>

                <section className="user-actions">
                    <div className="section-heading">
                        <h3>Charger Services</h3>
                        <p>Select an action below</p>
                    </div>

                    <div className="user-action-list">
                        <button
                            className="user-action-card borrow-action"
                            onClick={onBorrow}
                        >
                            <div className="action-icon">↓</div>

                            <div className="action-content">
                                <strong>Borrow Charger</strong>

                                <span>
                  Select an available charger and record the
                  borrowing.
                </span>
                            </div>

                            <span className="action-arrow">›</span>
                        </button>

                        <button
                            className="user-action-card return-action"
                            onClick={onReturn}
                        >
                            <div className="action-icon">↑</div>

                            <div className="action-content">
                                <strong>Return Charger</strong>

                                <span>
                  Return a charger that is currently assigned.
                </span>
                            </div>

                            <span className="action-arrow">›</span>
                        </button>
                    </div>
                </section>

                <section className="user-info-card">
                    <div className="info-icon">i</div>

                    <div>
                        <strong>Important</strong>

                        <p>
                            Please return the charger after use so it becomes
                            available for the next employee.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="app-footer">
                <span>Melwire Lanka (Pvt) Ltd</span>
                <span>Charger Management System</span>
            </footer>
        </div>
    );
}
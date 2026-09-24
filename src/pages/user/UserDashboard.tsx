import type { AppUser } from '../../types/auth';

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
    return (
        <div className="app-page user-app-page">
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
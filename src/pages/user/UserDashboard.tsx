import type { AppUser } from '../../types/auth';
import { useEffect, useState } from 'react';
import { getUserReturnStatus } from '../../services/transactionService';
import { getUserPhoneReturnStatus } from '../../services/phoneTransactionService';

interface UserDashboardProps {
    user: AppUser;
    onLogout: () => void;
    onBorrow: () => void;
    onReturn: () => void;
    onBorrowPhone: () => void;
    onReturnPhone: () => void;
}

export default function UserDashboard({
                                          user,
                                          onLogout,
                                          onBorrow,
                                          onReturn,
                                          onBorrowPhone,
                                          onReturnPhone,
                                      }: UserDashboardProps) {
    const [returnStatus, setReturnStatus] = useState<{ status: string; deviceName: string } | null>(null);
    const [device, setDevice] = useState<'phone' | 'charger' | null>(null);
    useEffect(() => {
        let active = true;
        const loadStatus = async () => {
            const [chargerResult, phoneResult] = await Promise.all([
                getUserReturnStatus(user.username),
                getUserPhoneReturnStatus(user.username),
            ]);
            const result = phoneResult && (!chargerResult || phoneResult.id > chargerResult.id)
                ? phoneResult
                : chargerResult;
            if (!active || !result) return;
            const chargerRelation = 'chargers' in result ? result.chargers : null;
            const phoneRelation = 'phones' in result ? result.phones : null;
            const charger = Array.isArray(chargerRelation) ? chargerRelation[0] : chargerRelation;
            const phone = Array.isArray(phoneRelation) ? phoneRelation[0] : phoneRelation;
            setReturnStatus({
                status: result.status,
                deviceName: charger?.charger_name || phone?.phone_identifier || 'Your device',
            });
        };
        void loadStatus();
        const timer = window.setInterval(() => void loadStatus(), 10000);
        return () => { active = false; window.clearInterval(timer); };
    }, [user.username]);
    return (
        <div className="app-page user-app-page">
            {returnStatus && <div className={`return-status-popup ${returnStatus.status === 'returned' ? 'return-status-success' : ''}`}>
                <strong>{returnStatus.status === 'returned' ? 'Return Confirmed' : 'Return Pending Confirmation'}</strong>
                <span>{returnStatus.deviceName} - {returnStatus.status === 'returned' ? 'An admin confirmed receipt.' : 'Waiting for the selected admin to approve receipt.'}</span>
                {returnStatus.status === 'returned' && <button onClick={() => setReturnStatus(null)}>Close</button>}
            </div>}
            {device && (
                <div className="device-modal-backdrop" role="presentation" onClick={() => setDevice(null)}>
                    <div className="device-modal" role="dialog" aria-modal="true" aria-labelledby="device-modal-title" onClick={(event) => event.stopPropagation()}>
                        <button className="device-modal-close" aria-label="Close device actions" onClick={() => setDevice(null)}>×</button>
                        <div className={`device-modal-icon ${device === 'phone' ? 'phone-modal-icon' : 'charger-modal-icon'}`}>
                            {device === 'phone' ? '☎' : '⚡'}
                        </div>
                        <span className="selection-kicker">DEVICE SELECTED</span>
                        <h2 id="device-modal-title">{device === 'phone' ? 'Phone Services' : 'Charger Services'}</h2>
                        <p>Select the transaction you want to continue.</p>
                        <div className="device-modal-actions">
                            <button className="user-action-card borrow-action" onClick={device === 'phone' ? onBorrowPhone : onBorrow}>
                                <div className="action-icon">↓</div>
                                <div className="action-content"><strong>Borrow {device === 'phone' ? 'Phone' : 'Charger'}</strong><span>Choose an available device.</span></div>
                                <span className="action-arrow">›</span>
                            </button>
                            <button className="user-action-card return-action" onClick={device === 'phone' ? onReturnPhone : onReturn}>
                                <div className="action-icon">↑</div>
                                <div className="action-content"><strong>Return {device === 'phone' ? 'Phone' : 'Charger'}</strong><span>Submit it for admin confirmation.</span></div>
                                <span className="action-arrow">›</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                <section className="welcome-section user-hero">
                    <span className="welcome-label">WELCOME BACK</span>

                    <h2>Hello, {user.username}</h2>

                    <p>
                        Manage company phones and chargers easily and securely.
                    </p>
                </section>

                <section className="user-actions">
                    <div className="section-heading">
                        <span className="selection-kicker">QUICK ACCESS</span>
                        <h3 className="device-question">Which device do you need?</h3>
                        <p>Choose a device to borrow or return</p>
                    </div>

                    <div className="user-action-list">
                        <button className={`user-action-card device-choice-card phone-choice ${device === 'phone' ? 'device-choice-active' : ''}`} onClick={() => setDevice('phone')}>
                            <div className="action-icon">☎</div><div className="action-content"><strong>Phones</strong><span>Borrow or return a company phone.</span></div><span className="action-arrow">›</span>
                        </button>
                        <button className={`user-action-card device-choice-card charger-choice ${device === 'charger' ? 'device-choice-active' : ''}`} onClick={() => setDevice('charger')}>
                            <div className="action-icon">⚡</div><div className="action-content"><strong>Chargers</strong><span>Borrow or return a company charger.</span></div><span className="action-arrow">›</span>
                        </button>
                    </div>
                </section>

                <section className="user-info-card">
                    <div className="info-icon">i</div>

                    <div>
                        <strong>Important</strong>

                        <p>
                            Please return phones and chargers after use so they become available for the next employee.
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
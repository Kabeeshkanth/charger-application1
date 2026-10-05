import { useEffect, useState } from 'react';

import type { AppUser } from '../../types/auth';

import {
    getAllChargers,
    getBorrowedChargers,
} from '../../services/chargerService';
import { getAllPhones } from '../../services/phoneService';
import { getPhoneDamageReports } from '../../services/phoneDamageService';

import { getTransactions } from '../../services/transactionService';
import { getPendingDamageReports } from '../../services/damageService';
import type { ChargerTransaction } from '../../types/transaction';
import ReturnNotifications from '../../components/ReturnNotifications';

interface AdminDashboardProps {
    user: AppUser;
    onLogout: () => void;
    onAdd: () => void;
    onAvailable: () => void;
    onBorrowed: () => void;
    onReturned: () => void;
    onDamaged: () => void;
    onReports: () => void;
    onUsers: () => void;
    onReturnApprovals: () => void;
    onAvailableResources: () => void;
    onBorrowedPhones: () => void;
    onBorrowedResources: () => void;
    onDamagedResources: () => void;
    onReportsResources: () => void;
}

export default function AdminDashboard({
                                           user,
                                           onLogout,
                                           onAdd,
                                           onAvailable,
                                           onBorrowed,
                                           onReturned,
                                           onDamaged,
                                           onReports,
                                           onUsers,
                                           onReturnApprovals,
                                           onAvailableResources,
                                           onBorrowedPhones,
                                           onBorrowedResources,
                                           onDamagedResources,
                                           onReportsResources,
                                       }: AdminDashboardProps) {

    const [total, setTotal] = useState(0);
    const [available, setAvailable] = useState(0);
    const [borrowed, setBorrowed] = useState(0);
    const [returnedToday, setReturnedToday] = useState(0);
    const [damaged, setDamaged] = useState(0);
    const [phoneTotal, setPhoneTotal] = useState(0);
    const [phoneAvailable, setPhoneAvailable] = useState(0);
    const [phoneBorrowed, setPhoneBorrowed] = useState(0);
    const [phoneDamaged, setPhoneDamaged] = useState(0);

    const [loading, setLoading] = useState(true);

    const loadDashboard = async () => {
        try {

            setLoading(true);

            const [
                allChargers,
                borrowedChargers,
                allPhones,
                phoneDamageReports,
                transactions,
                pendingDamageReports,
            ] = await Promise.all([
                getAllChargers(),
                getBorrowedChargers(),
                getAllPhones(),
                getPhoneDamageReports(),
                getTransactions(),
                getPendingDamageReports(),
            ]);

            /*
             * TOTAL
             */
            setTotal(allChargers.length);

            /*
             * AVAILABLE
             */
            const pendingDamagedIds = new Set(
                pendingDamageReports.map((report) => report.charger_id)
            );
            const calculatedAvailable = allChargers.filter(
                (charger) =>
                    charger.status === 'available' &&
                    !pendingDamagedIds.has(charger.id)
            ).length;

            setAvailable(calculatedAvailable);

            /*
             * BORROWED
             */
            setBorrowed(borrowedChargers.length);
            setDamaged(
                new Set(pendingDamageReports.map((report) => report.charger_id)).size
            );
            const pendingPhoneIds = new Set(
                phoneDamageReports
                    .filter((report) => report.repair_status === 'pending')
                    .map((report) => report.phone_id)
            );
            setPhoneTotal(allPhones.length);
            setPhoneBorrowed(allPhones.filter((phone) => phone.status === 'borrowed').length);
            setPhoneDamaged(pendingPhoneIds.size);
            setPhoneAvailable(
                allPhones.filter(
                    (phone) => phone.status === 'available' && !pendingPhoneIds.has(phone.id)
                ).length
            );

            /*
             * RETURNED TODAY
             */

            const today = new Date()
                .toLocaleDateString('en-CA');

            const returnedTodayCount = transactions.filter(
                (transaction: ChargerTransaction) =>
                    transaction.status === 'returned' &&
                    transaction.returned_date === today
            ).length;

            setReturnedToday(returnedTodayCount);

        } catch (error) {

            console.error(error);

            alert(
                error instanceof Error
                    ? error.message
                    : 'Failed to load dashboard.'
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    return (
        <div className="app-page admin-dashboard-page">
            <ReturnNotifications user={user} />

            <header className="app-header">

                <div className="brand">
                    <img className="brand-mark" src="/melwa-logo.jpg" alt="MELWA" />

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
                        <span>Administrator</span>
                    </div>

                    <button className="logout-button" onClick={onLogout}>
                        Logout
                    </button>

                </div>

            </header>


            <main className="dashboard">

                <div className="page-heading admin-dashboard-heading">

                    <span className="dashboard-kicker">Operations center</span>
                    <h2>
                        Admin Dashboard
                    </h2>

                    <p>
                        Phone and charger management overview
                    </p>

                </div>


                {loading ? (

                    <div className="loading admin-dashboard-loading">
                        Loading dashboard...
                    </div>

                ) : (

                    <>

                        {/* =========================
                DASHBOARD COUNTS
            ========================== */}

                        <div className="resource-overview">
                            <div className="resource-summary charger-summary">
                                <div className="resource-summary-heading">
                                    <img className="resource-icon" src="/chargerlogo.jpg" alt="Charger" />
                                    <div>
                                        <span className="resource-eyebrow">Company IT items inventory</span>
                                        <strong>Chargers</strong>
                                    </div>
                                    <span className="resource-total">{total}</span>
                                </div>
                                <div className="resource-metrics">
                                    <span><b>{available}</b> available</span>
                                    <span><b>{borrowed}</b> borrowed</span>
                                    <span><b>{damaged}</b> repair</span>
                                </div>
                            </div>
                            <div className="resource-summary phone-summary">
                                <div className="resource-summary-heading">
                                    <img className="resource-icon" src="/phonelogo.jpg" alt="Phone" />
                                    <div>
                                        <span className="resource-eyebrow">Company inventory</span>
                                        <strong>Phones</strong>
                                    </div>
                                    <span className="resource-total">{phoneTotal}</span>
                                </div>
                                <div className="resource-metrics">
                                    <span><b>{phoneAvailable}</b> available</span>
                                    <span><b>{phoneBorrowed}</b> borrowed</span>
                                    <span><b>{phoneDamaged}</b> repair</span>
                                </div>
                            </div>
                            <div className="resource-today">
                                <span className="today-label">Today</span>
                                <strong>{returnedToday}</strong>
                                <span>items returned</span>
                            </div>
                        </div>




                        <div className="section-title">
                            Charger Management
                        </div>

                        <div className="menu-grid">

                            <button
                                className="primary-button"
                                onClick={onAdd}
                            >
                                + Add Charger and Phones
                            </button>

                            <button
                                className="primary-button"
                                onClick={onUsers}
                            >
                                + Add Users
                            </button>
                            <button className="primary-button return-approval-button" onClick={onReturnApprovals}>
                                Return Approvals
                            </button>
                            <button onClick={onAvailableResources}>Available Phones & Chargers</button>
                            <button onClick={onBorrowedResources}>Borrowed Phones & Chargers</button>
                            <button onClick={onDamagedResources}>Damaged Phones & Chargers</button>
                            <button onClick={onReportsResources}>Borrow & Return Reports</button>



                        </div>

                    </>

                )}

            </main>

        </div>
    );
}
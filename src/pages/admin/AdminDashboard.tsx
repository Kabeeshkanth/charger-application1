import { useEffect, useState } from 'react';

import type { AppUser } from '../../types/auth';

import {
    getAllChargers,
    getBorrowedChargers,
} from '../../services/chargerService';

import { getTransactions } from '../../services/transactionService';
import { getPendingDamageReports } from '../../services/damageService';

interface AdminDashboardProps {
    user: AppUser;
    onLogout: () => void;
    onAdd: () => void;
    onAvailable: () => void;
    onBorrowed: () => void;
    onReturned: () => void;
    onDamaged: () => void;
    onReports: () => void;
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
                                       }: AdminDashboardProps) {

    const [total, setTotal] = useState(0);
    const [available, setAvailable] = useState(0);
    const [borrowed, setBorrowed] = useState(0);
    const [returnedToday, setReturnedToday] = useState(0);
    const [damaged, setDamaged] = useState(0);

    const [loading, setLoading] = useState(true);

    const loadDashboard = async () => {
        try {

            setLoading(true);

            const [
                allChargers,
                borrowedChargers,
                transactions,
                pendingDamageReports,
            ] = await Promise.all([
                getAllChargers(),
                getBorrowedChargers(),
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

            /*
             * RETURNED TODAY
             */

            const today = new Date()
                .toLocaleDateString('en-CA');

            const returnedTodayCount = transactions.filter(
                (transaction: any) =>
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
        <div className="app-page">

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
                        <span>Administrator</span>
                    </div>

                    <button className="logout-button" onClick={onLogout}>
                        Logout
                    </button>

                </div>

            </header>


            <main className="dashboard">

                <div className="page-heading">

                    <h2>
                        Admin Dashboard
                    </h2>

                    <p>
                        Charger management overview
                    </p>

                </div>


                {loading ? (

                    <div className="loading">
                        Loading dashboard...
                    </div>

                ) : (

                    <>

                        {/* =========================
                DASHBOARD COUNTS
            ========================== */}

                        <div className="dashboard-grid admin-stats-grid">

                            <div className="dashboard-card stat-total">

                <span className="card-number">
                  {total}
                </span>

                                <span>
                  Total Chargers
                </span>

                            </div>


                            <div className="dashboard-card stat-available">

                <span className="card-number">
                  {available}
                </span>

                                <span>
                  Available
                </span>

                            </div>


                            <div className="dashboard-card stat-borrowed">

                <span className="card-number">
                  {borrowed}
                </span>

                                <span>
                  Borrowed
                </span>

                            </div>


                            <div className="dashboard-card stat-returned">

                <span className="card-number">
                  {returnedToday}
                </span>

                                <span>
                  Returned Today
                </span>

                            </div>

                            <div className="dashboard-card stat-damaged">
                <span className="card-number">
                  {damaged}
                </span>

                                <span>
                  Damaged / Repair
                </span>

                            </div>

                        </div>


                        {/* =========================
                MANAGEMENT MENU
            ========================== */}

                        <div className="section-title">
                            Charger Management
                        </div>

                        <div className="menu-grid">

                            <button
                                className="primary-button"
                                onClick={onAdd}
                            >
                                + Add Charger
                            </button>


                            <button
                                onClick={onAvailable}
                            >
                                Available Chargers
                            </button>


                            <button
                                onClick={onBorrowed}
                            >
                                Borrowed Chargers
                            </button>


                            <button
                                onClick={onReturned}
                            >
                                Returned History
                            </button>

                            <button
                                onClick={onDamaged}
                            >
                                Damaged Chargers
                            </button>

                            <button
                                onClick={onReports}
                            >
                                Borrow & Return Reports
                            </button>

                        </div>

                    </>

                )}

            </main>

        </div>
    );
}
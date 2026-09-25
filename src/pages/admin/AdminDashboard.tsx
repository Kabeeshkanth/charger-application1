import { useEffect, useState } from 'react';

import type { AppUser } from '../../types/auth';

import {
    getAllChargers,
    getBorrowedChargers,
} from '../../services/chargerService';

import { getTransactions } from '../../services/transactionService';
import { getPendingDamageReports } from '../../services/damageService';
import { createAppUser } from '../../services/authService';
import { createItTeamMember, getItTeamMembers } from '../../services/teamService';
import type { ItTeamMember } from '../../types/team';

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
                                       }: AdminDashboardProps) {

    const [total, setTotal] = useState(0);
    const [available, setAvailable] = useState(0);
    const [borrowed, setBorrowed] = useState(0);
    const [returnedToday, setReturnedToday] = useState(0);
    const [damaged, setDamaged] = useState(0);

    const [loading, setLoading] = useState(true);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [teamName, setTeamName] = useState('');
    const [teamPosition, setTeamPosition] = useState('');
    const [teamMembers, setTeamMembers] = useState<ItTeamMember[]>([]);

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
        void loadTeamMembers();
    }, []);

    const loadTeamMembers = async () => {
        try {
            setTeamMembers(await getItTeamMembers());
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to load IT team members.');
        }
    };

    const handleCreateUser = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newUsername.trim() || !newPassword) {
            alert('Enter a username and password.');
            return;
        }

        try {
            await createAppUser(newUsername, newPassword);
            setNewUsername('');
            setNewPassword('');
            alert('User created successfully.');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to create user.');
        }
    };

    const handleCreateTeamMember = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!teamName.trim() || !teamPosition.trim()) {
            alert('Enter the team member name and position.');
            return;
        }

        try {
            await createItTeamMember(teamName, teamPosition);
            setTeamName('');
            setTeamPosition('');
            await loadTeamMembers();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to add IT team member.');
        }
    };

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
                                className="primary-button"
                                onClick={onUsers}
                            >
                                + Add User
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

                        <div className="section-title">User & IT Team Management</div>

                        <div className="admin-management-grid">
                            <form className="form-card admin-management-card" onSubmit={handleCreateUser}>
                                <h3>Create User Login</h3>
                                <p>Create credentials for a charger-management user.</p>
                                <div className="form-group">
                                    <label htmlFor="newUsername">User ID</label>
                                    <input id="newUsername" value={newUsername} onChange={(event) => setNewUsername(event.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="newPassword">Password</label>
                                    <input id="newPassword" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
                                </div>
                                <button className="primary-button full-width" type="submit">Create User</button>
                            </form>

                            <form className="form-card admin-management-card" onSubmit={handleCreateTeamMember}>
                                <h3>Add IT Team Member</h3>
                                <p>Add the people available in the return selection list.</p>
                                <div className="form-group">
                                    <label htmlFor="teamName">Name</label>
                                    <input id="teamName" value={teamName} onChange={(event) => setTeamName(event.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="teamPosition">Position</label>
                                    <input id="teamPosition" value={teamPosition} onChange={(event) => setTeamPosition(event.target.value)} required />
                                </div>
                                <button className="primary-button full-width" type="submit">Add Team Member</button>
                            </form>
                        </div>

                        <div className="team-member-list">
                            <h3>IT Team Members</h3>
                            {teamMembers.length === 0 ? (
                                <p>No IT team members have been added.</p>
                            ) : (
                                teamMembers.map((member) => (
                                    <div className="team-member-row" key={member.id}>
                                        <strong>{member.name}</strong>
                                        <span>{member.position}</span>
                                    </div>
                                ))
                            )}
                        </div>

                    </>

                )}

            </main>

        </div>
    );
}
import { useEffect, useState } from 'react';

import Login from './pages/Login';
import InstallGate from './components/InstallGate';

import AdminDashboard from './pages/admin/AdminDashboard';
import AddCharger from './pages/admin/AddCharger';
import AvailableChargers from './pages/admin/AvailableChargers';
import BorrowedChargers from './pages/admin/BorrowedChargers';
import ReturnedChargers from './pages/admin/ReturnedChargers';
import DamagedChargers from './pages/admin/DamagedChargers';
import ChargerReports from './pages/admin/ChargerReports';

import UserDashboard from './pages/user/UserDashboard';
import BorrowCharger from './pages/user/BorrowCharger';
import ReturnCharger from './pages/user/ReturnCharger';

import type { AppUser } from './types/auth';

type Screen =
    | 'dashboard'
    | 'borrow'
    | 'return'
    | 'add'
    | 'available'
    | 'borrowed'
    | 'returned'
    | 'damaged'
    | 'reports';

const STORED_USER_KEY = 'charger-manager-user';

function getStoredUser(): AppUser | null {
  const storedUser = localStorage.getItem(STORED_USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser: unknown = JSON.parse(storedUser);

    if (
      typeof parsedUser === 'object' &&
      parsedUser !== null &&
      'user_id' in parsedUser &&
      'username' in parsedUser &&
      'role' in parsedUser &&
      typeof parsedUser.user_id === 'number' &&
      typeof parsedUser.username === 'string' &&
      (parsedUser.role === 'admin' || parsedUser.role === 'user')
    ) {
      return parsedUser as AppUser;
    }
  } catch {
    localStorage.removeItem(STORED_USER_KEY);
  }

  return null;
}

function App() {
  const [user, setUser] = useState<AppUser | null>(getStoredUser);
  const [screen, setScreen] = useState<Screen>('dashboard');

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORED_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORED_USER_KEY);
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setScreen('dashboard');
  };

  if (!user) {
    return (
        <InstallGate>
          <Login
              onLogin={(loggedUser) => {
                setUser(loggedUser);
                setScreen('dashboard');
              }}
          />
        </InstallGate>
    );
  }

  // =========================
  // ADMIN
  // =========================

  if (user.role === 'admin') {
    if (screen === 'add') {
      return (
          <AddCharger
              onBack={() => setScreen('dashboard')}
          />
      );
    }

    if (screen === 'available') {
      return (
          <AvailableChargers
              onBack={() => setScreen('dashboard')}
          />
      );
    }

    if (screen === 'borrowed') {
      return (
          <BorrowedChargers
              onBack={() => setScreen('dashboard')}
          />
      );
    }

    if (screen === 'returned') {
      return (
          <ReturnedChargers
              onBack={() => setScreen('dashboard')}
          />
      );
    }

    if (screen === 'damaged') {
      return <DamagedChargers onBack={() => setScreen('dashboard')} />;
    }

    if (screen === 'reports') {
      return <ChargerReports onBack={() => setScreen('dashboard')} />;
    }

    return (
        <AdminDashboard
            user={user}
            onLogout={handleLogout}
            onAdd={() => setScreen('add')}
            onAvailable={() => setScreen('available')}
            onBorrowed={() => setScreen('borrowed')}
            onReturned={() => setScreen('returned')}
            onDamaged={() => setScreen('damaged')}
            onReports={() => setScreen('reports')}
        />
    );
  }

  // =========================
  // USER
  // =========================

  if (screen === 'borrow') {
    return (
        <BorrowCharger
            onBack={() => setScreen('dashboard')}
        />
    );
  }

  if (screen === 'return') {
    return (
        <ReturnCharger
            onBack={() => setScreen('dashboard')}
        />
    );
  }

  return (
      <UserDashboard
          user={user}
          onLogout={handleLogout}
          onBorrow={() => setScreen('borrow')}
          onReturn={() => setScreen('return')}
      />
  );
}

export default App;
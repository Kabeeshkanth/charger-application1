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
import ManageUsers from './pages/admin/ManageUsers';
import ReturnApprovals from './pages/admin/ReturnApprovals';
import ResourceManagement from './pages/admin/ResourceManagement';
import AddPhone from './pages/admin/AddPhone';
import AvailablePhones from './pages/admin/AvailablePhones';
import BorrowedPhones from './pages/admin/BorrowedPhones';
import BorrowedResources from './pages/admin/BorrowedResources';
import DamagedPhones from './pages/admin/DamagedPhones';
import PhoneReports from './pages/admin/PhoneReports';
import DeviceSelection from './pages/admin/DeviceSelection';

import UserDashboard from './pages/user/UserDashboard';
import BorrowCharger from './pages/user/BorrowCharger';
import ReturnCharger from './pages/user/ReturnCharger';
import BorrowPhone from './pages/user/BorrowPhone';
import ReturnPhone from './pages/user/ReturnPhone';

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
    | 'reports'
    | 'users'
    | 'returnApprovals'
    | 'resources'
    | 'addPhone'
    | 'availablePhones'
    | 'borrowedPhones'
    | 'borrowedResources'
    | 'damagedPhones'
    | 'phoneReports'
    | 'borrowPhone'
    | 'returnPhone'
    | 'availableResources'
    | 'damagedResources'
    | 'reportsResources';

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
    if (screen === 'resources') return <ResourceManagement onBack={() => setScreen('dashboard')} onAddCharger={() => setScreen('add')} onAddPhone={() => setScreen('addPhone')} />;
    if (screen === 'addPhone') return <AddPhone onBack={() => setScreen('resources')} />;
    if (screen === 'availablePhones') return <AvailablePhones onBack={() => setScreen('availableResources')} />;
    if (screen === 'availableResources') return <DeviceSelection title="Available Phones & Chargers" description="Choose the available device list you want to view." onBack={() => setScreen('dashboard')} onCharger={() => setScreen('available')} onPhone={() => setScreen('availablePhones')} />;
    if (screen === 'borrowedPhones') return <BorrowedPhones onBack={() => setScreen('borrowedResources')} />;
    if (screen === 'borrowedResources') {
      return (
        <BorrowedResources
          onBack={() => setScreen('dashboard')}
          onBorrowedCharger={() => setScreen('borrowed')}
          onBorrowedPhone={() => setScreen('borrowedPhones')}
        />
      );
    }
    if (screen === 'damagedPhones') return <DamagedPhones onBack={() => setScreen('damagedResources')} />;
    if (screen === 'damagedResources') return <DeviceSelection title="Damaged Phones & Chargers" description="Choose the damaged device list you want to view." onBack={() => setScreen('dashboard')} onCharger={() => setScreen('damaged')} onPhone={() => setScreen('damagedPhones')} />;
    if (screen === 'phoneReports') return <PhoneReports onBack={() => setScreen('reportsResources')} />;
    if (screen === 'reportsResources') return <DeviceSelection title="Borrow & Return Reports" description="Choose the device report you want to view." onBack={() => setScreen('dashboard')} onCharger={() => setScreen('reports')} onPhone={() => setScreen('phoneReports')} />;
    if (screen === 'add') {
      return (
          <AddCharger
              onBack={() => setScreen('resources')}
          />
      );
    }

    if (screen === 'available') {
      return (
          <AvailableChargers
              onBack={() => setScreen('availableResources')}
          />
      );
    }

    if (screen === 'borrowed') {
      return (
          <BorrowedChargers
              onBack={() => setScreen('borrowedResources')}
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
      return <DamagedChargers onBack={() => setScreen('damagedResources')} />;
    }

    if (screen === 'reports') {
      return <ChargerReports onBack={() => setScreen('reportsResources')} />;
    }

    if (screen === 'users') {
      return <ManageUsers onBack={() => setScreen('dashboard')} />;
    }
    if (screen === 'returnApprovals') {
      return <ReturnApprovals user={user} onBack={() => setScreen('dashboard')} />;
    }

    return (
        <AdminDashboard
            user={user}
            onLogout={handleLogout}
            onAdd={() => setScreen('resources')}
            onAvailable={() => setScreen('available')}
            onBorrowed={() => setScreen('borrowed')}
            onReturned={() => setScreen('returned')}
            onDamaged={() => setScreen('damaged')}
            onReports={() => setScreen('reports')}
            onUsers={() => setScreen('users')}
            onReturnApprovals={() => setScreen('returnApprovals')}
            onAvailableResources={() => setScreen('availableResources')}
            onBorrowedPhones={() => setScreen('borrowedPhones')}
            onBorrowedResources={() => setScreen('borrowedResources')}
            onDamagedResources={() => setScreen('damagedResources')}
            onReportsResources={() => setScreen('reportsResources')}
        />
    );
  }

  // =========================
  // USER
  // =========================

  if (screen === 'borrow') {
    return (
        <BorrowCharger
            user={user}
            onBack={() => setScreen('dashboard')}
        />
    );
  }

  if (screen === 'return') {
    return (
        <ReturnCharger
            user={user}
            onBack={() => setScreen('dashboard')}
        />
    );
  }

  if (screen === 'borrowPhone') return <BorrowPhone user={user} onBack={() => setScreen('dashboard')} />;
  if (screen === 'returnPhone') return <ReturnPhone user={user} onBack={() => setScreen('dashboard')} />;

  return (
      <UserDashboard
          user={user}
          onLogout={handleLogout}
          onBorrow={() => setScreen('borrow')}
          onReturn={() => setScreen('return')}
          onBorrowPhone={() => setScreen('borrowPhone')}
          onReturnPhone={() => setScreen('returnPhone')}
      />
  );
}

export default App;
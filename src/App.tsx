import { useEffect, useRef, useState } from 'react';

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
import UserBorrowedPhones from './pages/user/BorrowedPhones';

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
    | 'borrowedPhones'
    | 'availableResources'
    | 'damagedResources'
    | 'reportsResources';

function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const isHandlingBackNavigation = useRef(false);

  useEffect(() => {
    const currentState = window.history.state as { chargerScreen?: Screen } | null;

    if (currentState?.chargerScreen !== screen) {
      if (currentState?.chargerScreen) {
        window.history.pushState({ chargerScreen: screen }, '');
      } else {
        window.history.replaceState({ chargerScreen: screen }, '');
      }
    }

    const handleBackNavigation = (event: PopStateEvent) => {
      const nextState = event.state as { chargerScreen?: Screen } | null;

      if (nextState?.chargerScreen) {
        isHandlingBackNavigation.current = true;
        setScreen(nextState.chargerScreen);
      } else {
        window.history.pushState({ chargerScreen: 'dashboard' }, '');
        isHandlingBackNavigation.current = true;
        setScreen('dashboard');
      }
    };

    window.addEventListener('popstate', handleBackNavigation);

    return () => {
      window.removeEventListener('popstate', handleBackNavigation);
    };
  }, [screen]);

  useEffect(() => {
    if (isHandlingBackNavigation.current) {
      isHandlingBackNavigation.current = false;
    }
  }, [screen]);

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
  if (screen === 'borrowedPhones') return <UserBorrowedPhones onBack={() => setScreen('dashboard')} />;

  return (
      <UserDashboard
          user={user}
          onLogout={handleLogout}
          onBorrow={() => setScreen('borrow')}
          onReturn={() => setScreen('return')}
          onBorrowPhone={() => setScreen('borrowPhone')}
          onReturnPhone={() => setScreen('returnPhone')}
          onBorrowedPhones={() => setScreen('borrowedPhones')}
      />
  );
}

export default App;
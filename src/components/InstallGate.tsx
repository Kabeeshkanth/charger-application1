import { useEffect, useState, type ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallGateProps {
  children: ReactNode;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

function isRunningAsInstalledApp() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isAppleMobileDevice() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function InstallGate({ children }: InstallGateProps) {
  const [installed, setInstalled] = useState(isRunningAsInstalledApp);
  const [continueOnWeb, setContinueOnWeb] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [isAppleDevice] = useState(isAppleMobileDevice);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowInstallInstructions(true);
      return;
    }

    setInstalling(true);
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstalling(false);

    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }
  };

  if (installed || continueOnWeb) {
    return children;
  }

  return (
    <div className="install-page">
      <div className="install-card">
        <img
          className="install-logo"
          src="/mobile-charger%20logo.jpg"
          alt="Mobile charger"
        />
        <h1>Install Charger Manager</h1>
        <p>
          Install the app on your device before signing in for the best
          experience.
        </p>

        <a
          className={`install-link${installing ? ' is-installing' : ''}`}
          href="#install"
          onClick={(event) => {
            event.preventDefault();
            void handleInstall();
          }}
          aria-disabled={installing}
        >
          {installing ? 'INSTALLING...' : 'CLICK HERE TO DOWNLOAD AND INSTALL'}
        </a>

        <button
          className="continue-web-button"
          type="button"
          onClick={() => setContinueOnWeb(true)}
        >
          CONTINUE WITH WEB
        </button>

        {(!installPrompt || showInstallInstructions) && (
          <p className="install-instructions">
            {isAppleDevice ? (
              <>
                On your iPhone or iPad, tap the <strong>Share</strong> button,
                choose <strong>Add to Home Screen</strong>, then tap
                <strong> Add</strong>.
              </>
            ) : (
              <>
                Use your browser&apos;s menu and choose
                <strong> Install app</strong> or <strong>Add to Home Screen</strong>.
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

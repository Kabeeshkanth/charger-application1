import { useEffect, useRef, useState } from 'react';
import type { AppUser } from '../types/auth';
import { getPendingReturns } from '../services/transactionService';
import { getPendingPhoneReturns, getUserPhoneReturnStatus } from '../services/phoneTransactionService';
import { getUserReturnStatus } from '../services/transactionService';

interface Props {
  user: AppUser;
}

interface AlertMessage {
  id: string;
  title: string;
  body: string;
}

function deviceName(item: { chargers?: { charger_name: string } | { charger_name: string }[]; phones?: { phone_identifier: string } | { phone_identifier: string }[] }) {
  const charger = Array.isArray(item.chargers) ? item.chargers[0] : item.chargers;
  const phone = Array.isArray(item.phones) ? item.phones[0] : item.phones;
  return charger?.charger_name || phone?.phone_identifier || 'device';
}

function showBrowserNotification(message: AlertMessage) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const notification = new Notification(message.title, { body: message.body, icon: '/icon-192.png', tag: message.id });
  notification.onclick = () => window.focus();
}

export default function ReturnNotifications({ user }: Props) {
  const [message, setMessage] = useState<AlertMessage | null>(null);
  const initialized = useRef(false);
  const previousUserStatuses = useRef(new Map<string, string>());

  useEffect(() => {
    let active = true;
    const requestPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };
    void requestPermission();

    const publish = (next: AlertMessage) => {
      if (!active) return;
      setMessage(next);
      showBrowserNotification(next);
      window.setTimeout(() => setMessage((current) => current?.id === next.id ? null : current), 7000);
    };

    const check = async () => {
      if (user.role === 'admin') {
        const [chargers, phones] = await Promise.all([
          getPendingReturns(user.user_id),
          getPendingPhoneReturns(user.user_id),
        ]);
        const pending = [
          ...chargers.map((item) => ({ ...item, kind: 'charger' })),
          ...phones.map((item) => ({ ...item, kind: 'phone' })),
        ];
        const seenKey = `return-alerts-admin-${user.user_id}`;
        const seen = new Set(JSON.parse(localStorage.getItem(seenKey) || '[]') as string[]);
        for (const item of pending) {
          const id = `${item.kind}-${item.id}`;
          if (!initialized.current && !seen.has(id)) seen.add(id);
          if (initialized.current && !seen.has(id)) {
            const name = item.returned_by_username || item.borrowed_person || 'A user';
            publish({
              id,
              title: 'Return approval needed',
              body: `${name} wants to return the ${item.kind} (${deviceName(item)}). Would you like to approve it?`,
            });
            seen.add(id);
            break;
          }
        }
        localStorage.setItem(seenKey, JSON.stringify([...seen]));
      } else {
        const [charger, phone] = await Promise.all([
          getUserReturnStatus(user.username),
          getUserPhoneReturnStatus(user.username),
        ]);
        const results = [charger, phone].filter(Boolean).sort((a, b) => (b?.id || 0) - (a?.id || 0));
        const latest = results[0];
        if (latest) {
          const kind = 'phones' in latest ? 'phone' : 'charger';
          const statusKey = `${kind}-${latest.id}`;
          const previous = previousUserStatuses.current.get(statusKey);
          if (initialized.current && previous === 'return_pending' && latest.status === 'returned') {
            publish({
              id: `approved-${statusKey}`,
              title: 'Return approved',
              body: `An admin approved your ${kind} return (${deviceName(latest)}).`,
            });
          }
          previousUserStatuses.current.set(statusKey, latest.status);
        }
      }
      initialized.current = true;
    };

    void check().catch((error) => console.error('Return notification check failed:', error));
    const timer = window.setInterval(() => {
      void check().catch((error) => console.error('Return notification check failed:', error));
    }, 4000);
    return () => { active = false; window.clearInterval(timer); };
  }, [user]);

  if (!message) return null;
  return (
    <div className="return-notification" role="status">
      <span className="return-notification-icon">!</span>
      <div>
        <strong>{message.title}</strong>
        <span>{message.body}</span>
      </div>
      <button type="button" aria-label="Dismiss notification" onClick={() => setMessage(null)}>×</button>
    </div>
  );
}

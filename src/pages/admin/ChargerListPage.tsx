import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { ChargerCard } from '../../components/ChargerCard';
import { Header } from '../../components/Header';
import { listChargers } from '../../services/chargerService';
import type { Charger, ChargerStatus } from '../../types/charger';

export default function ChargerListPage({ title, status, onBack }: { title: string; status: ChargerStatus; onBack: () => void }) {
  const [items, setItems] = useState<Charger[]>([]);
  useEffect(() => {
    listChargers(status)
        .then(setItems)
        .catch((error) => {
          console.error(error);
          alert(error instanceof Error ? error.message : 'Failed to load chargers.');
        });
  }, [status]);
  return <><Header title={title} /><main className="page"><Button variant="secondary" onClick={onBack}>Back</Button><div className="list">{items.map(item => <ChargerCard key={item.id} charger={item} />)}</div></main></>;
}

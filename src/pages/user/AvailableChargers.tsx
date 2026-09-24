import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { ChargerCard } from '../../components/ChargerCard';
import { Header } from '../../components/Header';
import { listChargers } from '../../services/chargerService';
import type { Charger } from '../../types/charger';

export default function AvailableChargers({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<Charger[]>([]);
  useEffect(() => {
    listChargers('available')
        .then(setItems)
        .catch((error) => {
          console.error(error);
          alert(error instanceof Error ? error.message : 'Failed to load chargers.');
        });
  }, []);
  return <><Header title="Available Chargers" /><main className="page"><Button variant="secondary" onClick={onBack}>Back</Button><div className="list">{items.map(item => <ChargerCard key={item.id} charger={item} />)}</div></main></>;
}

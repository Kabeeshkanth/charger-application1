import type { ReactNode } from 'react';
import { Charger } from '../types/charger';

export function ChargerCard({ charger, action }: { charger: Charger; action?: ReactNode }) {
  return <article className="card charger-card"><div><h3>{charger.charger_name}</h3><p>{charger.description || 'No description provided.'}</p></div><div className="card-side"><span className={`status status-${charger.status}`}>{charger.status}</span>{action}</div></article>;
}

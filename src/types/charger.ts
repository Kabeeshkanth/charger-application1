export type ChargerStatus = 'available' | 'borrowed';

export interface Charger {
    id: number;
    charger_name: string;
    description: string | null;
    status: ChargerStatus;
    created_at: string;
}
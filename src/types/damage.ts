export type DamageRepairStatus = 'pending' | 'repaired';

export interface DamageReport {
    id: number;
    charger_id: number;
    damage_description: string;
    repair_status: DamageRepairStatus;
    reported_at: string;
    repaired_at: string | null;
    chargers?: {
        charger_name: string;
    };
}

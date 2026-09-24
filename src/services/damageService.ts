import { supabase } from '../lib/supabase';
import type { DamageRepairStatus, DamageReport } from '../types/damage';

export function isDamageTableMissing(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const databaseError = error as { code?: string; message?: string };
    return databaseError.code === '42P01' ||
        databaseError.code === 'PGRST205' ||
        databaseError.message?.includes('charger_damage_reports') === true;
}

export async function getDamageReports(
    status?: DamageRepairStatus
): Promise<DamageReport[]> {
    let query = supabase
        .from('charger_damage_reports')
        .select('*, chargers(charger_name)')
        .order('id', { ascending: false });

    if (status) {
        query = query.eq('repair_status', status);
    }

    const { data, error } = await query;
    if (error) {
        if (isDamageTableMissing(error)) {
            return [];
        }
        throw new Error(error.message);
    }

    return (data || []) as DamageReport[];
}

export async function getPendingDamageReports(): Promise<DamageReport[]> {
    return getDamageReports('pending');
}

export async function addDamageReport(
    chargerId: number,
    damageDescription: string
): Promise<DamageReport> {
    const { data, error } = await supabase
        .from('charger_damage_reports')
        .insert({
            charger_id: chargerId,
            damage_description: damageDescription.trim(),
            repair_status: 'pending',
        })
        .select('*, chargers(charger_name)')
        .single();

    if (error) {
        if (isDamageTableMissing(error)) {
            throw new Error('Damage tracking is not enabled yet. Run supabase/migrations/001_damage_chargers.sql in the Supabase SQL Editor.');
        }
        throw new Error(error.message);
    }

    return data as DamageReport;
}

export async function updateDamageReport(
    id: number,
    damageDescription: string,
    repairStatus: DamageRepairStatus
): Promise<DamageReport> {
    const { data, error } = await supabase
        .from('charger_damage_reports')
        .update({
            damage_description: damageDescription.trim(),
            repair_status: repairStatus,
            repaired_at: repairStatus === 'repaired' ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select('*, chargers(charger_name)')
        .single();

    if (error) {
        if (isDamageTableMissing(error)) {
            throw new Error('Damage tracking is not enabled yet. Run supabase/migrations/001_damage_chargers.sql in the Supabase SQL Editor.');
        }
        throw new Error(error.message);
    }

    return data as DamageReport;
}

import { supabase } from '../lib/supabase';
import type { Charger } from '../types/charger';

export async function getAllChargers(): Promise<Charger[]> {
  const { data, error } = await supabase
      .from('chargers')
      .select('*')
      .order('id', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getAvailableChargers(): Promise<Charger[]> {
  const { data: damageReports, error: damageError } = await supabase
      .from('charger_damage_reports')
      .select('charger_id')
      .eq('repair_status', 'pending');

  if (damageError &&
      damageError.code !== '42P01' &&
      damageError.code !== 'PGRST205') {
    throw new Error(damageError.message);
  }

  const damagedIds = (damageReports || []).map((report) => report.charger_id);
  const { data: availableChargers, error } = await supabase
      .from('chargers')
      .select('*')
      .eq('status', 'available')
      .order('charger_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const damagedIdSet = new Set(damagedIds);
  return (availableChargers || []).filter(
      (charger) => !damagedIdSet.has(charger.id)
  );
}

export async function getBorrowedChargers(): Promise<Charger[]> {
  const { data: activeTransactions, error: transactionError } = await supabase
      .from('charger_transactions')
      .select('charger_id')
      .eq('status', 'borrowed');

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  const activeIds = [
    ...new Set((activeTransactions || []).map((transaction) => transaction.charger_id)),
  ];

  const { data: staleChargers, error: staleLookupError } = await supabase
      .from('chargers')
      .select('id')
      .eq('status', 'borrowed');

  if (staleLookupError) {
    throw new Error(staleLookupError.message);
  }

  const staleIds = (staleChargers || [])
      .map((charger) => charger.id)
      .filter((id) => !activeIds.includes(id));

  if (staleIds.length > 0) {
    const { error: repairError } = await supabase
        .from('chargers')
        .update({ status: 'available' })
        .in('id', staleIds)
        .eq('status', 'borrowed');

    if (repairError) {
      throw new Error(repairError.message);
    }
  }

  if (activeIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
      .from('chargers')
      .select('*')
      .eq('status', 'borrowed')
      .in('id', activeIds)
      .order('charger_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function listChargers(
    status?: Charger['status']
): Promise<Charger[]> {
  if (status === 'available') {
    return getAvailableChargers();
  }

  if (status === 'borrowed') {
    return getBorrowedChargers();
  }

  return getAllChargers();
}

export async function addCharger(
    chargerName: string,
    description: string
) {
  const { data, error } = await supabase
      .from('chargers')
      .insert({
        charger_name: chargerName.trim(),
        description: description.trim() || 'Mobile Charger',
        status: 'available',
      })
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCharger(
    chargerId: number,
    chargerName: string,
    description: string
): Promise<Charger> {
  const { data, error } = await supabase
      .from('chargers')
      .update({
        charger_name: chargerName.trim(),
        description: description.trim() || 'Mobile Charger',
      })
      .eq('id', chargerId)
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Charger;
}

export async function deleteCharger(chargerId: number): Promise<void> {
  const { error } = await supabase
      .from('chargers')
      .delete()
      .eq('id', chargerId);

  if (error) {
    if (error.code === '23503') {
      throw new Error('This charger has borrowing history and cannot be deleted.');
    }

    if (error.code === '42501' || error.message.toLowerCase().includes('row-level security')) {
      throw new Error('Deleting chargers is blocked by Supabase permissions. Run supabase/migrations/004_charger_management.sql.');
    }

    throw new Error(error.message);
  }
}
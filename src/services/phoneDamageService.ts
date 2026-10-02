import { supabase } from '../lib/supabase';

export type PhoneRepairStatus = 'pending' | 'repaired';
export interface PhoneDamageReport {
  id: number; phone_id: number; damage_description: string; repair_status: PhoneRepairStatus; reported_at: string;
  phones?: { phone_identifier: string };
}

export async function getPhoneDamageReports() {
  const { data, error } = await supabase.from('phone_damage_reports').select('*, phones(phone_identifier)').order('id', { ascending: false });
  if (error && error.code !== '42P01' && error.code !== 'PGRST205') throw new Error(error.message);
  return (data || []) as PhoneDamageReport[];
}

export async function addPhoneDamageReport(phoneId: number, description: string) {
  const { error } = await supabase.from('phone_damage_reports').insert({ phone_id: phoneId, damage_description: description.trim(), repair_status: 'pending' });
  if (error) throw new Error(error.message);
}

export async function updatePhoneDamageReport(id: number, description: string, status: PhoneRepairStatus) {
  const { error } = await supabase.from('phone_damage_reports').update({
    damage_description: description.trim(), repair_status: status, repaired_at: status === 'repaired' ? new Date().toISOString() : null,
  }).eq('id', id);
  if (error) throw new Error(error.message);
}

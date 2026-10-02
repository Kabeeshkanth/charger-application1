import { supabase } from '../lib/supabase';
import type { Phone } from '../types/phone';

export async function getAllPhones(): Promise<Phone[]> {
  const { data, error } = await supabase.from('phones').select('*').order('id');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAvailablePhones(): Promise<Phone[]> {
  const { data, error } = await supabase.from('phones').select('*').eq('status', 'available').order('phone_identifier');
  if (error) throw new Error(error.message);
  const { data: damageReports, error: damageError } = await supabase
    .from('phone_damage_reports').select('phone_id').eq('repair_status', 'pending');
  if (damageError && damageError.code !== '42P01' && damageError.code !== 'PGRST205') {
    throw new Error(damageError.message);
  }
  const damagedIds = new Set((damageReports || []).map((report) => report.phone_id));
  return (data || []).filter((phone) => !damagedIds.has(phone.id));
}

export async function getBorrowedPhones(): Promise<Phone[]> {
  const { data, error } = await supabase.from('phones').select('*').eq('status', 'borrowed').order('phone_identifier');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addPhone(phoneIdentifier: string, description: string, phoneNumber: string) {
  const normalizedPhoneNumber = phoneNumber.trim();
  if (!/^\d{10}$/.test(normalizedPhoneNumber)) {
    throw new Error('Phone number must contain exactly 10 digits.');
  }
  const { data, error } = await supabase.from('phones').insert({
    phone_identifier: phoneIdentifier.trim(),
    description: description.trim() || 'Company Phone',
    phone_number: normalizedPhoneNumber,
    status: 'available',
  }).select().single();
  if (error) throw new Error(error.message);
  return data as Phone;
}

export async function updatePhone(id: number, phoneIdentifier: string, description: string, phoneNumber: string) {
  const normalizedPhoneNumber = phoneNumber.trim();
  if (!/^\d{10}$/.test(normalizedPhoneNumber)) {
    throw new Error('Phone number must contain exactly 10 digits.');
  }
  const { data, error } = await supabase.from('phones').update({
    phone_identifier: phoneIdentifier.trim(),
    description: description.trim() || 'Company Phone',
    phone_number: normalizedPhoneNumber,
  }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data as Phone;
}

export async function deletePhone(id: number) {
  const { error } = await supabase.from('phones').delete().eq('id', id);
  if (error) throw new Error(error.code === '23503' ? 'This phone has borrowing history and cannot be deleted.' : error.message);
}

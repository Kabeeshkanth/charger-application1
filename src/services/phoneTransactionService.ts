import { supabase } from '../lib/supabase';

export const DEPARTMENTS = ['Loading Sector', 'FG Sector', 'RM sector', 'Slitting Sector'] as const;
export type Department = typeof DEPARTMENTS[number];

export async function borrowPhone(phoneId: number, borrowedDate: string, borrowedTime: string, borrowedPerson: string, department: Department) {
  const { data: phone, error: phoneError } = await supabase.from('phones').select('status').eq('id', phoneId).maybeSingle();
  if (phoneError) throw new Error(phoneError.message);
  if (!phone) throw new Error('The selected phone no longer exists.');
  if (phone.status !== 'available') throw new Error('This phone is no longer available.');
  const { data: damaged, error: damageError } = await supabase.from('phone_damage_reports')
    .select('id').eq('phone_id', phoneId).eq('repair_status', 'pending').limit(1).maybeSingle();
  if (damageError && damageError.code !== '42P01' && damageError.code !== 'PGRST205') throw new Error(damageError.message);
  if (damaged) throw new Error('This phone is damaged and cannot be borrowed until it is repaired.');
  const { error } = await supabase.rpc('borrow_phone', {
    p_phone_id: phoneId, p_borrowed_date: borrowedDate, p_borrowed_time: borrowedTime,
    p_borrowed_person: borrowedPerson.trim(), p_department: department,
  });
  if (error) throw new Error(error.message);
}

export async function returnPhone(phoneId: number, returnedDate: string, returnedTime: string, adminId: number, adminUsername: string, username: string) {
  const { data, error } = await supabase.from('phone_transactions').update({
    returned_date: returnedDate, returned_time: returnedTime, returned_person: adminUsername.trim(),
    returned_by_username: username.trim(), returned_to_admin_id: adminId, status: 'return_pending',
  }).eq('phone_id', phoneId).eq('status', 'borrowed').select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('This phone is no longer borrowed or has already been returned.');
}

export async function getPhoneTransactions() {
  const { data, error } = await supabase.from('phone_transactions').select('*, phones(phone_identifier, phone_number)').order('id', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getPendingPhoneReturns(adminId: number) {
  const { data, error } = await supabase.from('phone_transactions')
    .select('*, phones(phone_identifier, phone_number)').eq('status', 'return_pending')
    .eq('returned_to_admin_id', adminId).order('id', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function approvePhoneReturn(transactionId: number, adminId: number) {
  const { error } = await supabase.rpc('approve_phone_return', { p_transaction_id: transactionId, p_admin_user_id: adminId });
  if (error) throw new Error(error.message);
}

export async function getUserPhoneReturnStatus(username: string) {
  const { data, error } = await supabase.from('phone_transactions')
    .select('id, status, returned_date, returned_time, returned_person, phones(phone_identifier)')
    .eq('returned_by_username', username)
    .in('status', ['return_pending', 'returned'])
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

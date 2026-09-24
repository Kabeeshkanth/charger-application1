import { supabase } from '../lib/supabase';

export async function borrowCharger(
    chargerId: number,
    borrowedDate: string,
    borrowedTime: string,
    borrowedPerson: string
) {
  const { data: charger, error: chargerLookupError } = await supabase
      .from('chargers')
      .select('id, status')
      .eq('id', chargerId)
      .maybeSingle();

  if (chargerLookupError) {
    throw new Error(chargerLookupError.message);
  }

  if (!charger) {
    throw new Error('The selected charger no longer exists.');
  }

  if (charger.status !== 'available') {
    throw new Error('This charger is no longer available.');
  }

  const { data: pendingDamage, error: damageLookupError } = await supabase
      .from('charger_damage_reports')
      .select('id')
      .eq('charger_id', chargerId)
      .eq('repair_status', 'pending')
      .limit(1)
      .maybeSingle();

  if (damageLookupError &&
      damageLookupError.code !== '42P01' &&
      damageLookupError.code !== 'PGRST205') {
    throw new Error(damageLookupError.message);
  }

  if (pendingDamage) {
    throw new Error(
        'This charger is damaged and cannot be borrowed until it is repaired.'
    );
  }

  const { data, error } = await supabase.rpc(
      'borrow_charger',
      {
        p_charger_id: chargerId,
        p_borrowed_date: borrowedDate,
        p_borrowed_time: borrowedTime,
        p_borrowed_person: borrowedPerson.trim(),
      }
  );

  if (error) {
    throw new Error(error.message);
  }

  const { data: activeTransaction, error: transactionLookupError } = await supabase
      .from('charger_transactions')
      .select('id')
      .eq('charger_id', chargerId)
      .eq('status', 'borrowed')
      .limit(1)
      .maybeSingle();

  if (transactionLookupError) {
    throw new Error(transactionLookupError.message);
  }

  if (!activeTransaction) {
    const { error: transactionInsertError } = await supabase
        .from('charger_transactions')
        .insert({
          charger_id: chargerId,
          borrowed_date: borrowedDate,
          borrowed_time: borrowedTime,
          borrowed_person: borrowedPerson.trim(),
          status: 'borrowed',
        });

    if (transactionInsertError) {
      if (transactionInsertError.code === '42501' ||
          transactionInsertError.message.toLowerCase().includes('row-level security')) {
        throw new Error(
            'Borrowing is blocked by Supabase permissions. Run supabase/migrations/002_transaction_rls.sql in the Supabase SQL Editor.'
        );
      }
      throw new Error(transactionInsertError.message);
    }
  }

  return data;
}

export async function returnCharger(
    chargerId: number,
    returnedDate: string,
    returnedTime: string,
    returnedPerson: string
) {
  const { data, error } = await supabase.rpc(
      'return_charger',
      {
        p_charger_id: chargerId,
        p_returned_date: returnedDate,
        p_returned_time: returnedTime,
        p_returned_person: returnedPerson.trim(),
      }
  );

  if (error) {
    if (error.message.toLowerCase().includes('charger_id') &&
        error.message.toLowerCase().includes('ambiguous')) {
      const { error: chargerError } = await supabase
          .from('chargers')
          .update({ status: 'available' })
          .eq('id', chargerId)
          .eq('status', 'borrowed');

      if (chargerError) {
        throw new Error(chargerError.message);
      }

      const { error: transactionError } = await supabase
          .from('charger_transactions')
          .update({
            returned_date: returnedDate,
            returned_time: returnedTime,
            returned_person: returnedPerson.trim(),
            status: 'returned',
          })
          .eq('charger_id', chargerId)
          .eq('status', 'borrowed');

      if (transactionError) {
        throw new Error(transactionError.message);
      }

      return null;
    }

    throw new Error(error.message);
  }

  // Keep the charger and its active transaction synchronized even when the
  // database function completes without updating both records.
  const { error: chargerError } = await supabase
      .from('chargers')
      .update({ status: 'available' })
      .eq('id', chargerId)
      .eq('status', 'borrowed');

  if (chargerError) {
    throw new Error(chargerError.message);
  }

  const { error: transactionError } = await supabase
      .from('charger_transactions')
      .update({
        returned_date: returnedDate,
        returned_time: returnedTime,
        returned_person: returnedPerson.trim(),
        status: 'returned',
      })
      .eq('charger_id', chargerId)
      .eq('status', 'borrowed');

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  return data;
}

export async function getTransactions() {
  const { data, error } = await supabase
      .from('charger_transactions')
      .select(`
      *,
      chargers (
        charger_name
      )
    `)
      .order('id', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getBorrowedTransactions() {
  const { data, error } = await supabase
      .from('charger_transactions')
      .select(`
      *,
      chargers (
        charger_name
      )
    `)
      .eq('status', 'borrowed')
      .order('id', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
import { supabase } from '../lib/supabase';
import type { AppUser } from '../types/auth';

export async function createAppUser(username: string, password: string) {
  const { error } = await supabase.rpc('create_app_user', {
    p_username: username.trim(),
    p_password: password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function login(
    username: string,
    password: string
): Promise<AppUser> {

  const { data, error } = await supabase.rpc(
      'login_app_user',
      {
        p_username: username.trim(),
        p_password: password,
      }
  );

  if (error) {
    throw new Error(error.message);
  }

  const users = Array.isArray(data) ? data : data ? [data] : [];
  if (users.length === 0) {
    throw new Error('Invalid username or password.');
  }

  return users[0] as AppUser;
}
import { supabase } from '../lib/supabase';
import type { ItTeamMember } from '../types/team';

export async function getItTeamMembers(): Promise<ItTeamMember[]> {
  const { data, error } = await supabase
      .from('it_team_members')
      .select('id, name, position')
      .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function createItTeamMember(name: string, position: string) {
  const { error } = await supabase
      .from('it_team_members')
      .insert({ name: name.trim(), position: position.trim() });

  if (error) {
    throw new Error(error.message);
  }
}

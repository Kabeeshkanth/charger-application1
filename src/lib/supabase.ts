import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://commerlrwqqcruaekwhn.supabase.co';

const SUPABASE_ANON_KEY = 'sb_publishable_8VYLwS7Nxn89nxfC0DoCNw_ZTxhb6hi';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
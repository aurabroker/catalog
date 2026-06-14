import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import type { LoadEvent } from '@sveltejs/kit';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

export function createSupabaseLoadClient(fetch: LoadEvent['fetch']) {
	return isBrowser()
		? createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
		: createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
				global: { fetch },
				cookies: { getAll: () => [], setAll: () => {} }
			});
}

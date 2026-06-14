import { createSupabaseLoadClient } from '$lib/supabase';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');
	const supabase = createSupabaseLoadClient(fetch);
	return { supabase, session: data.session, user: data.user };
};

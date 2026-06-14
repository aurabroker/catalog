import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const q        = url.searchParams.get('q')        ?? '';
	const city     = url.searchParams.get('city')     ?? '';
	const category = url.searchParams.get('category') ?? '';
	const plan     = url.searchParams.get('plan')     ?? '';

	const { data: salons, error } = await locals.supabase.rpc('search_catalog', {
		search_query: q || null,
		filter_city:  city || null,
		filter_plan:  plan || null,
		limit_rows:   24,
		offset_rows:  0
	});

	return {
		salons: salons ?? [],
		error:  error?.message ?? null,
		filters: { q, city, category, plan }
	};
};

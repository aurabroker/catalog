import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: featured } = await locals.supabase
		.from('public_catalog_salons')
		.select('*')
		.eq('plan', 'premium')
		.order('published_at', { ascending: false })
		.limit(6);

	return { featured: featured ?? [] };
};

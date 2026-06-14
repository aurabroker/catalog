import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { user } = await parent();

	const { data: memberships } = await locals.supabase
		.from('salon_memberships')
		.select('role, is_primary, salons(id, name, slug, status, plan, city, cover_image_url)')
		.eq('user_id', user!.id);

	const salons = (memberships ?? [])
		.map((m) => ({
			role: m.role,
			is_primary: m.is_primary,
			salon: Array.isArray(m.salons) ? m.salons[0] : m.salons
		}))
		.filter((m) => m.salon);

	return { salons };
};

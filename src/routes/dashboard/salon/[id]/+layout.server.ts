import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params, parent }) => {
	await parent();

	const { data: salon } = await locals.supabase
		.from('salons')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!salon) {
		redirect(303, '/dashboard/salon');
	}

	const { data: membership } = await locals.supabase
		.from('salon_memberships')
		.select('role')
		.eq('salon_id', params.id)
		.single();

	if (!membership) {
		redirect(303, '/dashboard/salon');
	}

	return { salon };
};

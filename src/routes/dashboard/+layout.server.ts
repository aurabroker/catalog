import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) {
		redirect(303, `/auth/login?next=${encodeURIComponent(url.pathname)}`);
	}
	return { session, user };
};

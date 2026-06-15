import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error');

	if (error) {
		redirect(303, `/auth/login?error=${encodeURIComponent(error)}`);
	}

	if (code) {
		const { error: exchangeError } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (exchangeError) {
			redirect(303, `/auth/login?error=${encodeURIComponent(exchangeError.message)}`);
		}
	}

	redirect(303, '/dashboard/salon');
};

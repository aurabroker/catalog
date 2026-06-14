import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { salon } = await parent();
	return { salon };
};

export const actions: Actions = {
	updateBasic: async ({ request, locals, params }) => {
		const { session } = await locals.safeGetSession();
		if (!session) {
			redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const values = Object.fromEntries(formData);

		const name = (formData.get('name') as string)?.trim() ?? '';
		const city = (formData.get('city') as string)?.trim() ?? '';

		if (name.length < 2) {
			return fail(422, { action: 'updateBasic', error: 'Nazwa salonu musi mieć co najmniej 2 znaki.', values });
		}
		if (!city) {
			return fail(422, { action: 'updateBasic', error: 'Miasto jest wymagane.', values });
		}

		const { error } = await locals.supabase
			.from('salons')
			.update({
				name,
				short_description: (formData.get('short_description') as string)?.trim() || null,
				description: (formData.get('description') as string)?.trim() || null,
				city,
				address_line: (formData.get('address_line') as string)?.trim() || null,
				postal_code: (formData.get('postal_code') as string)?.trim() || null,
				phone: (formData.get('phone') as string)?.trim() || null,
				email: (formData.get('email') as string)?.trim() || null,
				website_url: (formData.get('website_url') as string)?.trim() || null,
				facebook_url: (formData.get('facebook_url') as string)?.trim() || null,
				instagram_url: (formData.get('instagram_url') as string)?.trim() || null,
				tiktok_url: (formData.get('tiktok_url') as string)?.trim() || null,
				nip: (formData.get('nip') as string)?.trim() || null,
			})
			.eq('id', params.id);

		if (error) {
			return fail(422, { action: 'updateBasic', error: error.message, values });
		}

		return { action: 'updateBasic', success: true };
	},

	updateBooking: async ({ request, locals, params }) => {
		const { session } = await locals.safeGetSession();
		if (!session) {
			redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const values = Object.fromEntries(formData);

		const booking_enabled = formData.get('booking_enabled') === 'on';
		const booking_auto_confirm = formData.get('booking_auto_confirm') === 'on';
		const booking_slot_min = parseInt(formData.get('booking_slot_min') as string) || 30;
		const booking_advance_hours_min = parseInt(formData.get('booking_advance_hours_min') as string) || 0;
		const booking_advance_days_max = parseInt(formData.get('booking_advance_days_max') as string) || 60;

		const { error } = await locals.supabase
			.from('salons')
			.update({
				booking_enabled,
				booking_auto_confirm,
				booking_slot_min,
				booking_advance_hours_min,
				booking_advance_days_max,
			})
			.eq('id', params.id);

		if (error) {
			return fail(422, { action: 'updateBooking', error: error.message, values });
		}

		return { action: 'updateBooking', success: true };
	},

	publish: async ({ locals, params }) => {
		const { session } = await locals.safeGetSession();
		if (!session) {
			redirect(303, '/auth/login');
		}

		const { data: salon } = await locals.supabase
			.from('salons')
			.select('status')
			.eq('id', params.id)
			.single();

		if (!salon || salon.status !== 'draft') {
			return fail(422, { action: 'publish', error: 'Salon nie jest w stanie szkicu.' });
		}

		const { error } = await locals.supabase
			.from('salons')
			.update({ status: 'published', published_at: new Date().toISOString() })
			.eq('id', params.id);

		if (error) {
			return fail(422, { action: 'publish', error: error.message });
		}

		return { action: 'publish', success: true };
	},
};

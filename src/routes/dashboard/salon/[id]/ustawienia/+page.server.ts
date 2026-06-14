import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { data: workingHours } = await locals.supabase
		.from('working_hours')
		.select('id, day_of_week, is_open, open_time, close_time')
		.eq('salon_id', params.id)
		.is('staff_id', null)
		.order('day_of_week');

	return { workingHours: workingHours ?? [] };
};

export const actions: Actions = {
	saveHours: async ({ locals, params, request }) => {
		const form = await request.formData();
		const salonId = params.id;

		const rows = [];
		for (let day = 1; day <= 7; day++) {
			const is_open = form.get(`is_open_${day}`) === 'on';
			const open_time = (form.get(`open_time_${day}`) as string) || null;
			const close_time = (form.get(`close_time_${day}`) as string) || null;

			rows.push({
				salon_id: salonId,
				staff_id: null,
				day_of_week: day,
				is_open,
				open_time: is_open ? open_time : null,
				close_time: is_open ? close_time : null
			});
		}

		const { error } = await locals.supabase
			.from('working_hours')
			.upsert(rows, { onConflict: 'salon_id,staff_id,day_of_week' });

		if (error) return fail(500, { hoursError: error.message });
		return { hoursSaved: true };
	},

	deleteSalon: async ({ locals, params, request }) => {
		const form = await request.formData();
		const confirm = form.get('confirm') as string;

		if (confirm !== 'DELETE') {
			return fail(400, { deleteError: 'Wpisz DELETE aby potwierdzić' });
		}

		const { error } = await locals.supabase
			.from('salons')
			.update({ status: 'suspended' })
			.eq('id', params.id);

		if (error) return fail(500, { deleteError: error.message });

		redirect(303, '/dashboard/salon');
	}
};

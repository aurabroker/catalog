import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function getMondayOf(date: Date): Date {
	const d = new Date(date);
	const day = d.getUTCDay();
	const diff = day === 0 ? -6 : 1 - day;
	d.setUTCDate(d.getUTCDate() + diff);
	d.setUTCHours(0, 0, 0, 0);
	return d;
}

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const salonId = params.id;

	const weekParam = url.searchParams.get('week');
	let weekStart = weekParam ? new Date(weekParam + 'T00:00:00Z') : getMondayOf(new Date());
	if (isNaN(weekStart.getTime())) {
		redirect(303, `?week=${getMondayOf(new Date()).toISOString().slice(0, 10)}`);
	}

	const weekEnd = new Date(weekStart);
	weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

	const { data: appointments } = await locals.supabase
		.from('appointments')
		.select(`
			id, client_name, client_email, client_phone,
			starts_at, ends_at, duration_min, status, price, currency_code, notes,
			staff:staff_id(id, name, calendar_color),
			service:service_id(id, name)
		`)
		.eq('salon_id', salonId)
		.gte('starts_at', weekStart.toISOString())
		.lt('starts_at', weekEnd.toISOString())
		.order('starts_at');

	const { data: staff } = await locals.supabase
		.from('staff')
		.select('id, name, calendar_color, role_label')
		.eq('salon_id', salonId)
		.eq('is_active', true)
		.order('sort_order');

	const { data: services } = await locals.supabase
		.from('services')
		.select('id, name, duration_min, price_from')
		.eq('salon_id', salonId)
		.order('name');

	return {
		appointments: appointments ?? [],
		staff: staff ?? [],
		services: services ?? [],
		weekStart: weekStart.toISOString().slice(0, 10),
		weekEnd: weekEnd.toISOString().slice(0, 10)
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, locals, params }) => {
		const salonId = params.id;
		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId') as string;
		const status = formData.get('status') as string;

		const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
		if (!appointmentId || !validStatuses.includes(status)) {
			return fail(400, { error: 'Nieprawidłowe dane' });
		}

		const { error } = await locals.supabase
			.from('appointments')
			.update({ status })
			.eq('id', appointmentId)
			.eq('salon_id', salonId);

		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	createAppointment: async ({ request, locals, params }) => {
		const salonId = params.id;
		const formData = await request.formData();

		const client_name = formData.get('client_name') as string;
		const client_email = formData.get('client_email') as string | null;
		const client_phone = formData.get('client_phone') as string | null;
		const staff_id = formData.get('staff_id') as string | null;
		const service_id = formData.get('service_id') as string | null;
		const starts_at_raw = formData.get('starts_at') as string;
		const duration_min = parseInt(formData.get('duration_min') as string) || 60;
		const notes = formData.get('notes') as string | null;

		if (!client_name || !starts_at_raw) {
			return fail(400, { error: 'Imię klienta i godzina wizyty są wymagane' });
		}

		const starts_at = new Date(starts_at_raw);
		if (isNaN(starts_at.getTime())) {
			return fail(400, { error: 'Nieprawidłowa data' });
		}

		const ends_at = new Date(starts_at.getTime() + duration_min * 60 * 1000);

		const { error } = await locals.supabase.from('appointments').insert({
			salon_id: salonId,
			staff_id: staff_id || null,
			service_id: service_id || null,
			client_name,
			client_email: client_email || null,
			client_phone: client_phone || null,
			starts_at: starts_at.toISOString(),
			ends_at: ends_at.toISOString(),
			duration_min,
			status: 'confirmed',
			notes: notes || null,
			source: 'dashboard'
		});

		if (error) return fail(500, { error: error.message });
		return { success: true };
	}
};

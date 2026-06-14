import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const salonId = params.id;

	const [{ data: staff }, { data: services }] = await Promise.all([
		locals.supabase
			.from('staff')
			.select('*')
			.eq('salon_id', salonId)
			.order('sort_order'),
		locals.supabase
			.from('services')
			.select('id, name, service_categories(name)')
			.eq('salon_id', salonId)
			.eq('is_active', true)
			.order('sort_order')
	]);

	const staffIds = (staff ?? []).map((s) => s.id);
	let staffServices: { staff_id: string; service_id: string }[] = [];

	if (staffIds.length > 0) {
		const { data } = await locals.supabase
			.from('staff_services')
			.select('staff_id, service_id')
			.in('staff_id', staffIds);
		staffServices = data ?? [];
	}

	return {
		staff: staff ?? [],
		services: services ?? [],
		staffServices
	};
};

export const actions: Actions = {
	createStaff: async ({ locals, params, request }) => {
		const salonId = params.id;
		const form = await request.formData();

		const name = (form.get('name') as string)?.trim();
		if (!name) return fail(422, { error: 'Imię i nazwisko są wymagane.' });

		const role_label = (form.get('role_label') as string)?.trim() || null;
		const bio = (form.get('bio') as string)?.trim() || null;
		const calendar_color = (form.get('calendar_color') as string) || '#6366f1';

		const { error } = await locals.supabase.from('staff').insert({
			salon_id: salonId,
			name,
			role_label,
			bio,
			calendar_color,
			is_active: true
		});

		if (error) return fail(422, { error: error.message });
		return { success: true };
	},

	updateStaff: async ({ locals, params, request }) => {
		const salonId = params.id;
		const form = await request.formData();

		const staffId = form.get('staffId') as string;
		if (!staffId) return fail(422, { error: 'Brak ID pracownika.' });

		const name = (form.get('name') as string)?.trim();
		if (!name) return fail(422, { error: 'Imię i nazwisko są wymagane.' });

		const role_label = (form.get('role_label') as string)?.trim() || null;
		const bio = (form.get('bio') as string)?.trim() || null;
		const calendar_color = (form.get('calendar_color') as string) || '#6366f1';
		const is_active = form.get('is_active') === 'on';

		const { error } = await locals.supabase
			.from('staff')
			.update({ name, role_label, bio, calendar_color, is_active })
			.eq('id', staffId)
			.eq('salon_id', salonId);

		if (error) return fail(422, { error: error.message });
		return { success: true };
	},

	deleteStaff: async ({ locals, params, request }) => {
		const salonId = params.id;
		const form = await request.formData();
		const staffId = form.get('staffId') as string;
		if (!staffId) return fail(422, { error: 'Brak ID pracownika.' });

		const { error } = await locals.supabase
			.from('staff')
			.update({ is_active: false })
			.eq('id', staffId)
			.eq('salon_id', salonId);

		if (error) return fail(422, { error: error.message });
		return { success: true };
	},

	updateStaffServices: async ({ locals, params, request }) => {
		const salonId = params.id;
		const form = await request.formData();

		const staffId = form.get('staffId') as string;
		if (!staffId) return fail(422, { error: 'Brak ID pracownika.' });

		const { data: staffRow } = await locals.supabase
			.from('staff')
			.select('id')
			.eq('id', staffId)
			.eq('salon_id', salonId)
			.single();

		if (!staffRow) return fail(403, { error: 'Brak dostępu.' });

		const serviceIds = form.getAll('serviceIds') as string[];

		const { error: delError } = await locals.supabase
			.from('staff_services')
			.delete()
			.eq('staff_id', staffId);

		if (delError) return fail(422, { error: delError.message });

		if (serviceIds.length > 0) {
			const rows = serviceIds.map((service_id) => ({ staff_id: staffId, service_id }));
			const { error: insError } = await locals.supabase.from('staff_services').insert(rows);
			if (insError) return fail(422, { error: insError.message });
		}

		return { success: true };
	}
};

import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { data: promotions } = await locals.supabase
		.from('promotions')
		.select('id, title, description, image_url, discount_type, discount_value, valid_from, valid_until, is_active, sort_order')
		.eq('salon_id', params.id)
		.order('sort_order', { ascending: true });

	return { promotions: promotions ?? [] };
};

export const actions: Actions = {
	createPromotion: async ({ locals, params, request }) => {
		const form = await request.formData();
		const title = (form.get('title') as string)?.trim();
		const description = (form.get('description') as string)?.trim() || null;
		const discount_type = (form.get('discount_type') as string) || null;
		const discount_value = parseFloat(form.get('discount_value') as string) || null;
		const valid_from = (form.get('valid_from') as string) || null;
		const valid_until = (form.get('valid_until') as string) || null;

		if (!title) return fail(400, { createError: 'Tytuł jest wymagany' });

		const { error } = await locals.supabase.from('promotions').insert({
			salon_id: params.id,
			title,
			description,
			discount_type,
			discount_value,
			valid_from,
			valid_until,
			is_active: true,
			sort_order: 0
		});

		if (error) return fail(500, { createError: error.message });
		return { success: true };
	},

	updatePromotion: async ({ locals, params, request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const title = (form.get('title') as string)?.trim();
		const description = (form.get('description') as string)?.trim() || null;
		const discount_type = (form.get('discount_type') as string) || null;
		const discount_value = parseFloat(form.get('discount_value') as string) || null;
		const valid_from = (form.get('valid_from') as string) || null;
		const valid_until = (form.get('valid_until') as string) || null;
		const is_active = form.get('is_active') === 'true';

		if (!id || !title) return fail(400, { updateError: 'Brak wymaganych danych' });

		const { error } = await locals.supabase
			.from('promotions')
			.update({ title, description, discount_type, discount_value, valid_from, valid_until, is_active })
			.eq('id', id)
			.eq('salon_id', params.id);

		if (error) return fail(500, { updateError: error.message });
		return { success: true };
	},

	deletePromotion: async ({ locals, params, request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;

		if (!id) return fail(400, { deleteError: 'Brak ID promocji' });

		const { error } = await locals.supabase
			.from('promotions')
			.delete()
			.eq('id', id)
			.eq('salon_id', params.id);

		if (error) return fail(500, { deleteError: error.message });
		return { success: true };
	}
};

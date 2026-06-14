import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
		.replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
		.replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 60);
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const salonId = params.id;

	const [categoriesRes, servicesRes] = await Promise.all([
		locals.supabase
			.from('service_categories')
			.select('id, name, slug')
			.order('name'),

		locals.supabase
			.from('services')
			.select('*, service_categories(id, name, slug)')
			.eq('salon_id', salonId)
			.order('sort_order')
	]);

	return {
		categories: categoriesRes.data ?? [],
		services: servicesRes.data ?? []
	};
};

export const actions: Actions = {
	createService: async ({ locals, params, request }) => {
		const salonId = params.id;
		const data = await request.formData();

		const name = (data.get('name') as string)?.trim();
		if (!name) return fail(422, { error: 'Nazwa usługi jest wymagana' });

		const category_id = data.get('category_id') as string | null;
		const short_description = (data.get('short_description') as string)?.trim() || null;
		const duration_min = data.get('duration_min') ? Number(data.get('duration_min')) : null;
		const price_from = data.get('price_from') ? Number(data.get('price_from')) : null;
		const price_to = data.get('price_to') ? Number(data.get('price_to')) : null;
		const is_featured = data.get('is_featured') === 'on';

		const slug = slugify(name);

		const { error } = await locals.supabase.from('services').insert({
			salon_id: salonId,
			category_id: category_id || null,
			name,
			slug,
			short_description,
			duration_min,
			price_from,
			price_to,
			is_featured,
			is_active: true
		});

		if (error) return fail(422, { error: error.message });

		return { success: true };
	},

	updateService: async ({ locals, params, request }) => {
		const salonId = params.id;
		const data = await request.formData();

		const serviceId = data.get('serviceId') as string;
		const name = (data.get('name') as string)?.trim();
		if (!name) return fail(422, { error: 'Nazwa usługi jest wymagana' });

		const category_id = data.get('category_id') as string | null;
		const short_description = (data.get('short_description') as string)?.trim() || null;
		const duration_min = data.get('duration_min') ? Number(data.get('duration_min')) : null;
		const price_from = data.get('price_from') ? Number(data.get('price_from')) : null;
		const price_to = data.get('price_to') ? Number(data.get('price_to')) : null;
		const is_featured = data.get('is_featured') === 'on';
		const is_active = data.get('is_active') === 'on';

		const { error } = await locals.supabase
			.from('services')
			.update({
				name,
				category_id: category_id || null,
				short_description,
				duration_min,
				price_from,
				price_to,
				is_featured,
				is_active
			})
			.eq('id', serviceId)
			.eq('salon_id', salonId);

		if (error) return fail(422, { error: error.message });

		return { success: true };
	},

	deleteService: async ({ locals, params, request }) => {
		const salonId = params.id;
		const data = await request.formData();
		const serviceId = data.get('serviceId') as string;

		const { error } = await locals.supabase
			.from('services')
			.update({ is_active: false })
			.eq('id', serviceId)
			.eq('salon_id', salonId);

		if (error) return fail(422, { error: error.message });

		return { success: true };
	}
};

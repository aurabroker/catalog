import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { data: reviews } = await locals.supabase
		.from('reviews')
		.select('id, author_name, rating, content, source, is_featured, published_at')
		.eq('salon_id', params.id)
		.order('published_at', { ascending: false });

	return { reviews: reviews ?? [] };
};

export const actions: Actions = {
	featureReview: async ({ locals, params, request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const isFeatured = form.get('is_featured') === 'true';

		if (!id) return fail(400, { error: 'Brak ID opinii' });

		const { error } = await locals.supabase
			.from('reviews')
			.update({ is_featured: isFeatured })
			.eq('id', id)
			.eq('salon_id', params.id);

		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	deleteReview: async ({ locals, params, request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;

		if (!id) return fail(400, { error: 'Brak ID opinii' });

		const { error } = await locals.supabase
			.from('reviews')
			.delete()
			.eq('id', id)
			.eq('salon_id', params.id);

		if (error) return fail(500, { error: error.message });
		return { success: true };
	}
};

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const [salonRes, servicesRes, reviewsRes, staffRes, hoursRes, promosRes] = await Promise.all([
		locals.supabase
			.from('public_catalog_salons')
			.select('*')
			.eq('slug', params.slug)
			.single(),

		locals.supabase
			.from('public_catalog_services')
			.select('*')
			.eq('salon_slug', params.slug)
			.order('is_featured', { ascending: false }),

		locals.supabase
			.from('public_salon_reviews')
			.select('*')
			.eq('salon_slug', params.slug)
			.order('published_at', { ascending: false })
			.limit(20),

		locals.supabase
			.from('staff')
			.select('id, name, role_label, bio, photo_url, calendar_color, sort_order')
			.eq('is_active', true)
			.order('sort_order'),

		locals.supabase
			.from('working_hours')
			.select('day_of_week, is_open, open_time, close_time')
			.is('staff_id', null)
			.order('day_of_week'),

		locals.supabase
			.from('promotions')
			.select('*')
			.eq('is_active', true)
			.order('sort_order')
			.limit(6)
	]);

	if (salonRes.error || !salonRes.data) {
		error(404, 'Salon nie został znaleziony');
	}

	const salon = salonRes.data;

	// Filter working hours and staff to this salon
	const salonHours = (hoursRes.data ?? []).filter(
		(h: { salon_id?: string }) => !h.salon_id || h.salon_id === salon.id
	);

	const avgRating = reviewsRes.data?.length
		? reviewsRes.data.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviewsRes.data.length
		: null;

	return {
		salon,
		services:   servicesRes.data ?? [],
		reviews:    reviewsRes.data  ?? [],
		staff:      staffRes.data    ?? [],
		hours:      salonHours,
		promotions: promosRes.data   ?? [],
		avgRating:  avgRating ? Math.round(avgRating * 10) / 10 : null
	};
};

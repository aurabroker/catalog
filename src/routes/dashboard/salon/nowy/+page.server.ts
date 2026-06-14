import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
		.replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
		.replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 60);
}

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			redirect(303, '/auth/login');
		}

		const formData = await request.formData();
		const values = Object.fromEntries(formData);

		const name = (formData.get('name') as string)?.trim() ?? '';
		const city = (formData.get('city') as string)?.trim() ?? '';

		if (name.length < 2) {
			return fail(422, { error: 'Nazwa salonu musi mieć co najmniej 2 znaki.', values });
		}
		if (!city) {
			return fail(422, { error: 'Miasto jest wymagane.', values });
		}

		const slug = slugify(name);

		const { data: salon, error: salonError } = await locals.supabase
			.from('salons')
			.insert({
				name,
				slug,
				city,
				address_line: (formData.get('address_line') as string)?.trim() || null,
				postal_code: (formData.get('postal_code') as string)?.trim() || null,
				short_description: (formData.get('short_description') as string)?.trim() || null,
				phone: (formData.get('phone') as string)?.trim() || null,
				email: (formData.get('email') as string)?.trim() || null,
				plan: 'basic',
				status: 'draft',
			})
			.select('id')
			.single();

		if (salonError || !salon) {
			return fail(422, { error: salonError?.message ?? 'Nie udało się utworzyć salonu.', values });
		}

		const { error: membershipError } = await locals.supabase
			.from('salon_memberships')
			.insert({
				salon_id: salon.id,
				user_id: user.id,
				role: 'owner',
				is_primary: true,
			});

		if (membershipError) {
			return fail(422, { error: membershipError.message, values });
		}

		redirect(303, `/dashboard/salon/${salon.id}/edytuj`);
	},
};

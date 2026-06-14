import { json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const schema = z.object({
	salon_id:    z.string().uuid(),
	name:        z.string().min(2).max(100),
	email:       z.string().email().optional(),
	phone:       z.string().max(30).optional(),
	message:     z.string().max(1000).optional(),
	source_type: z.string().default('form'),
	marketing_consent: z.boolean().default(false)
});

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 });
	}

	const data = parsed.data;

	const { error } = await locals.supabase.from('contact_leads').insert({
		salon_id:          data.salon_id,
		name:              data.name,
		email:             data.email ?? null,
		phone:             data.phone ?? null,
		message:           data.message ?? null,
		source_type:       data.source_type,
		source_path:       request.headers.get('referer') ?? null,
		marketing_consent: data.marketing_consent,
		contact_consent:   true,
		status:            'new'
	});

	if (error) {
		return json({ error: 'Failed to save lead' }, { status: 500 });
	}

	return json({ ok: true });
};

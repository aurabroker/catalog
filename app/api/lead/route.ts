import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const schema = z.object({
  salonId: z.string().uuid(),
  name: z.string().min(2),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  phone: z.string().optional(),
  message: z.string().min(5)
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('contact_leads').insert({
    salon_id: parsed.data.salonId,
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    message: parsed.data.message,
    source_type: 'form'
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { createSupabaseServerClient } from './supabase-server';

export async function getCatalog(params: { query?: string; city?: string; plan?: string }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('search_catalog', {
    query_text: params.query || null,
    city_filter: params.city || null,
    plan_filter: params.plan || null,
    limit_rows: 24,
    offset_rows: 0
  });
  if (error) throw error;
  return data ?? [];
}

export async function getSalonBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('public_catalog_salons').select('*').eq('slug', slug).single();
  if (error) throw error;
  return data;
}

export async function getSalonByHost(host: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('resolve_public_salon_by_host', { request_host: host });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function getSalonServices(salonId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('public_catalog_services').select('*').eq('salon_id', salonId).order('is_featured', { ascending: false }).order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getSalonReviews(salonId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('public_salon_reviews').select('*').eq('salon_id', salonId).order('published_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

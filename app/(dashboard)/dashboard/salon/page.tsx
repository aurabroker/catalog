import { createSupabaseServerClient } from '@/lib/supabase-server';

export default async function SalonDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: memberships } = await supabase.from('salon_memberships').select('role, salons(id, name, slug, plan, city, status)').limit(10);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-900">Panel salonu</h1>
        <p className="mt-2 text-neutral-600">Widok startowy po zalogowaniu właściciela lub zespołu salonu.</p>
      </div>
      <div className="grid gap-4">
        {memberships?.map((membership, index) => {
          const salon = Array.isArray(membership.salons) ? membership.salons[0] : membership.salons;
          return (
            <article key={index} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-sm uppercase tracking-wide text-neutral-500">Rola: {membership.role}</p>
              <h2 className="mt-2 text-xl font-semibold text-neutral-900">{salon?.name}</h2>
            </article>
          );
        })}
      </div>
    </main>
  );
}

import { LeadForm } from '@/components/lead-form';
import { getSalonBySlug, getSalonReviews, getSalonServices } from '@/lib/queries';

export default async function SalonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  const services = await getSalonServices(salon.id);
  const reviews = await getSalonReviews(salon.id);

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.5fr_0.8fr]">
      <section>
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-neutral-500">{salon.city || 'Salon beauty'}</p>
          <h1 className="mb-3 text-4xl font-semibold text-neutral-900">{salon.name}</h1>
          <p className="max-w-2xl text-neutral-600">{salon.description || salon.short_description}</p>
        </div>
        <section className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold">Usługi</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <strong>{service.name}</strong>
                  <span>{service.price_from ? `${service.price_from} ${service.currency_code}` : 'Zapytaj o cenę'}</span>
                </div>
                {service.short_description ? <p className="mt-2 text-sm text-neutral-600">{service.short_description}</p> : null}
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold">Opinie</h2>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-neutral-200 p-4">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <strong>{review.author_name}</strong>
                  <span>{review.rating}/5</span>
                </div>
                <p className="text-sm text-neutral-600">{review.content}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
      <aside>
        <LeadForm salonId={salon.id} />
      </aside>
    </main>
  );
}

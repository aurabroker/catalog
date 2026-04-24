import { CatalogCard } from '@/components/catalog-card';
import { getCatalog } from '@/lib/queries';

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ q?: string; city?: string; plan?: string }> }) {
  const params = await searchParams;
  const items = await getCatalog({ query: params.q, city: params.city, plan: params.plan });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-900">Katalog salonów</h1>
        <p className="mt-2 text-neutral-600">Publiczny listing oparty o funkcję search_catalog().</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <CatalogCard key={item.salon_id} item={item} />)}
      </div>
    </main>
  );
}

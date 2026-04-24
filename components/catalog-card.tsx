import Link from 'next/link';
import { CatalogItem } from '@/types';

export function CatalogCard({ item }: { item: CatalogItem }) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-neutral-900">{item.salon_name}</h3>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs uppercase tracking-wide text-neutral-600">{item.plan}</span>
      </div>
      <p className="mb-2 text-sm text-neutral-500">{item.city || 'Brak miasta'}</p>
      <p className="mb-4 text-sm text-neutral-700">{item.short_description || 'Profil salonu w katalogu beauty.'}</p>
      <div className="flex gap-3">
        <Link className="text-sm font-medium text-teal-700" href={`/salon/${item.salon_slug}`}>Zobacz profil</Link>
        {item.primary_host ? <a className="text-sm text-neutral-500" href={`https://${item.primary_host}`} target="_blank" rel="noopener noreferrer">Otwórz stronę</a> : null}
      </div>
    </article>
  );
}

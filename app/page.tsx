import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <section className="rounded-3xl bg-white p-10 shadow-sm">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-neutral-500">Beauty katalog</p>
        <h1 className="mb-4 max-w-3xl text-4xl font-semibold text-neutral-900">Katalog salonów beauty z profilem premium i stroną na własnej subdomenie.</h1>
        <p className="mb-8 max-w-2xl text-base text-neutral-600">Tu budujesz katalog, strony salonów, leady kontaktowe i panel właściciela w jednym systemie.</p>
        <div className="flex gap-4">
          <Link className="rounded-xl bg-teal-700 px-4 py-4 text-sm font-medium text-white" href="/katalog">Przeglądaj katalog</Link>
          <Link className="rounded-xl border border-neutral-300 px-4 py-4 text-sm font-medium" href="/dashboard/salon">Panel salonu</Link>
        </div>
      </section>
    </main>
  );
}

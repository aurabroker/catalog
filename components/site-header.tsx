import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-neutral-900">Beauty Katalog</Link>
        <nav className="flex gap-5 text-sm text-neutral-600">
          <Link href="/katalog">Katalog</Link>
          <Link href="/dashboard/salon">Panel salonu</Link>
        </nav>
      </div>
    </header>
  );
}

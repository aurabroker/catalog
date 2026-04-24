# Beauty katalog — krok 6

Starter frontendu w Next.js App Router pod katalog salonów beauty.

## Co jest w środku
- publiczna strona główna,
- listing `/katalog`,
- profil salonu `/salon/[slug]`,
- panel `/dashboard/salon`,
- endpoint `POST /api/lead`,
- middleware pod routing multi-tenant po hostcie,
- integracja z funkcjami SQL z kroków 3-5.

## Jak to spiąć
1. Uruchom backend SQL z kroków 1-5.
2. Ustaw `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Podłącz logowanie Supabase Auth.
4. Dodaj prawdziwe style, uploady i obsługę hostów premium w layoutach.

## Najważniejsze miejsca
- `lib/queries.ts` — odczyt katalogu i salonu,
- `app/api/lead/route.ts` — zapis leada,
- `middleware.ts` — rozpoznawanie hosta,
- `app/(public)/salon/[slug]/page.tsx` — publiczny profil salonu,
- `app/(dashboard)/dashboard/salon/page.tsx` — panel po zalogowaniu.

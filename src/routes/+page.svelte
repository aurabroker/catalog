<script lang="ts">
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SalonCard from '$lib/components/SalonCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const categories = [
		{ name: 'Fryzjerstwo', slug: 'fryzjerstwo', icon: '✂️', count: null },
		{ name: 'Kosmetologia', slug: 'kosmetologia', icon: '🌸', count: null },
		{ name: 'Paznokcie', slug: 'paznokcie', icon: '💅', count: null },
		{ name: 'Brwi i rzęsy', slug: 'brwi-rzesy', icon: '👁', count: null },
		{ name: 'Masaż i SPA', slug: 'masaz-spa', icon: '🌿', count: null },
		{ name: 'Depilacja', slug: 'depilacja', icon: '✨', count: null },
	];
</script>

<svelte:head>
	<title>BeautyKatalog — Znajdź salon beauty w Polsce</title>
	<meta name="description" content="Katalog salonów beauty w Polsce. Fryzjerzy, kosmetolożki, salony paznokci, brwi i rzęsy, masaż SPA. Rezerwuj wizyty online." />
</svelte:head>

<!-- HERO -->
<section class="hero">
	<div class="hero-bg" aria-hidden="true">
		<div class="hero-blob hero-blob-1"></div>
		<div class="hero-blob hero-blob-2"></div>
	</div>

	<div class="container hero-content">
		<p class="hero-eyebrow">Katalog salonów w Polsce</p>
		<h1 class="display-xl hero-title">
			Znajdź swój<br />
			<em>idealny salon</em> beauty
		</h1>
		<p class="hero-subtitle">
			Ponad tysiące salonów fryzjerskich, kosmetycznych i SPA w całej Polsce.<br />
			Przeglądaj opinie, oferty i rezerwuj wizytę online.
		</p>

		<div class="hero-search">
			<SearchBar large />
		</div>

		<div class="hero-suggestions">
			<span class="suggestions-label">Popularne:</span>
			<a href="/katalog?q=manicure" class="suggestion-chip">Manicure</a>
			<a href="/katalog?q=strzyżenie" class="suggestion-chip">Strzyżenie</a>
			<a href="/katalog?q=masaż" class="suggestion-chip">Masaż</a>
			<a href="/katalog?q=przedłużanie rzęs" class="suggestion-chip">Rzęsy</a>
		</div>
	</div>
</section>

<!-- STATS -->
<section class="stats-bar">
	<div class="container stats-inner">
		<div class="stat">
			<strong>1 200+</strong>
			<span>salonów</span>
		</div>
		<div class="stat-sep" aria-hidden="true"></div>
		<div class="stat">
			<strong>300+</strong>
			<span>miast</span>
		</div>
		<div class="stat-sep" aria-hidden="true"></div>
		<div class="stat">
			<strong>50+</strong>
			<span>rodzajów zabiegów</span>
		</div>
		<div class="stat-sep" aria-hidden="true"></div>
		<div class="stat">
			<strong>10 000+</strong>
			<span>opinii klientów</span>
		</div>
	</div>
</section>

<!-- CATEGORIES -->
<section class="section categories-section">
	<div class="container">
		<div class="section-header">
			<h2 class="display-md">Przeglądaj według kategorii</h2>
			<a href="/katalog" class="btn btn-ghost">Wszystkie zabiegi →</a>
		</div>

		<div class="categories-grid">
			{#each categories as cat}
				<a href="/katalog?category={cat.slug}" class="cat-card">
					<span class="cat-icon">{cat.icon}</span>
					<span class="cat-name">{cat.name}</span>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- FEATURED SALONS -->
{#if data.featured?.length}
<section class="section salons-section">
	<div class="container">
		<div class="section-header">
			<h2 class="display-md">Wyróżnione salony</h2>
			<a href="/katalog?plan=premium" class="btn btn-ghost">Zobacz wszystkie →</a>
		</div>

		<div class="salons-grid">
			{#each data.featured as salon}
				<SalonCard {salon} />
			{/each}
		</div>
	</div>
</section>
{/if}

<!-- HOW IT WORKS -->
<section class="section how-section">
	<div class="container">
		<div class="section-header centered">
			<h2 class="display-md">Jak to działa?</h2>
			<p class="text-muted">Rezerwacja wizyty w 3 prostych krokach</p>
		</div>

		<div class="how-steps">
			<div class="how-step">
				<div class="step-num">01</div>
				<h3>Znajdź salon</h3>
				<p>Wyszukaj po zabiegu, mieście lub nazwie salonu. Filtruj po ocenach i cenach.</p>
			</div>
			<div class="how-connector" aria-hidden="true">→</div>
			<div class="how-step">
				<div class="step-num">02</div>
				<h3>Wybierz termin</h3>
				<p>Sprawdź dostępność pracowników i wybierz pasujący termin w kalendarzu online.</p>
			</div>
			<div class="how-connector" aria-hidden="true">→</div>
			<div class="how-step">
				<div class="step-num">03</div>
				<h3>Gotowe!</h3>
				<p>Potwierdź wizytę. Otrzymasz przypomnienie emailem i SMS przed terminem.</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="cta-section">
	<div class="container cta-inner">
		<div class="cta-text">
			<h2 class="display-md" style="color:#fff">Prowadzisz salon beauty?</h2>
			<p>Dodaj swój salon do katalogu i docieraj do nowych klientów. Podstawowy profil jest bezpłatny.</p>
		</div>
		<div class="cta-actions">
			<a href="/auth/login" class="btn btn-rose btn-lg">Dodaj salon za darmo</a>
			<a href="/katalog" class="btn btn-outline btn-lg" style="color:#fff; border-color:rgba(255,255,255,.3)">
				Przeglądaj katalog
			</a>
		</div>
	</div>
</section>

<style>
/* Hero */
.hero {
	position: relative;
	overflow: hidden;
	padding: var(--space-20) 0 var(--space-16);
	background: var(--c-bg);
}

.hero-bg {
	position: absolute;
	inset: 0;
	pointer-events: none;
}

.hero-blob {
	position: absolute;
	border-radius: 50%;
	filter: blur(80px);
	opacity: .35;
}

.hero-blob-1 {
	width: 500px;
	height: 500px;
	background: radial-gradient(circle, var(--c-rose-light), transparent 70%);
	top: -100px;
	right: -100px;
}

.hero-blob-2 {
	width: 400px;
	height: 400px;
	background: radial-gradient(circle, var(--c-gold-light), transparent 70%);
	bottom: -50px;
	left: -80px;
}

.hero-content {
	position: relative;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--space-6);
}

.hero-eyebrow {
	display: inline-flex;
	align-items: center;
	gap: var(--space-2);
	background: var(--c-rose-light);
	color: var(--c-rose-dark);
	padding: var(--space-2) var(--space-4);
	border-radius: var(--radius-full);
	font-size: 0.8125rem;
	font-weight: 500;
	letter-spacing: .03em;
}

.hero-title {
	max-width: 700px;
}

.hero-title em {
	font-style: italic;
	color: var(--c-rose-dark);
}

.hero-subtitle {
	color: var(--c-muted);
	font-size: 1.0625rem;
	line-height: 1.7;
	max-width: 520px;
}

.hero-search {
	width: 100%;
	display: flex;
	justify-content: center;
}

.hero-suggestions {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	flex-wrap: wrap;
	justify-content: center;
}

.suggestions-label {
	font-size: 0.8125rem;
	color: var(--c-muted);
}

.suggestion-chip {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	padding: var(--space-1) var(--space-3);
	border-radius: var(--radius-full);
	font-size: 0.8125rem;
	color: var(--c-text);
	transition: border-color var(--transition), background var(--transition);
}

.suggestion-chip:hover {
	border-color: var(--c-rose);
	background: var(--c-rose-light);
	color: var(--c-rose-dark);
}

/* Stats bar */
.stats-bar {
	background: var(--c-surface);
	border-top: 1px solid var(--c-border);
	border-bottom: 1px solid var(--c-border);
}

.stats-inner {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: var(--space-8);
	padding: var(--space-8) 0;
	flex-wrap: wrap;
}

.stat {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.stat strong {
	font-family: var(--font-display);
	font-size: 1.875rem;
	font-weight: 700;
	color: var(--c-charcoal);
	line-height: 1;
}

.stat span {
	font-size: 0.8125rem;
	color: var(--c-muted);
	margin-top: 4px;
}

.stat-sep {
	width: 1px;
	height: 40px;
	background: var(--c-border);
}

@media (max-width: 640px) {
	.stats-inner { gap: var(--space-5); }
	.stat-sep { display: none; }
}

/* Section headers */
.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: var(--space-8);
	gap: var(--space-4);
}

.section-header.centered {
	flex-direction: column;
	text-align: center;
	margin-bottom: var(--space-10);
}

/* Categories */
.categories-section {
	background: var(--c-surface);
}

.categories-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: var(--space-4);
}

@media (min-width: 640px) {
	.categories-grid { grid-template-columns: repeat(6, 1fr); }
}

.cat-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--space-2);
	padding: var(--space-5) var(--space-3);
	background: var(--c-bg);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	text-decoration: none;
	transition: all var(--transition);
	text-align: center;
}

.cat-card:hover {
	border-color: var(--c-rose);
	background: var(--c-rose-light);
	transform: translateY(-2px);
	box-shadow: var(--shadow-sm);
}

.cat-icon {
	font-size: 1.75rem;
	line-height: 1;
}

.cat-name {
	font-size: 0.8125rem;
	font-weight: 500;
	color: var(--c-charcoal);
}

/* Salons grid */
.salons-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: var(--space-6);
}

/* How it works */
.how-section {
	background: var(--c-surface-2);
}

.how-steps {
	display: flex;
	align-items: flex-start;
	justify-content: center;
	gap: var(--space-4);
	flex-wrap: wrap;
}

.how-step {
	flex: 1;
	min-width: 220px;
	max-width: 280px;
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
	text-align: center;
	align-items: center;
}

.step-num {
	font-family: var(--font-display);
	font-size: 2.5rem;
	font-weight: 700;
	color: var(--c-rose);
	line-height: 1;
	opacity: .6;
}

.how-step h3 {
	font-family: var(--font-display);
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--c-charcoal);
}

.how-step p {
	font-size: 0.9rem;
	color: var(--c-muted);
	line-height: 1.6;
}

.how-connector {
	font-size: 1.5rem;
	color: var(--c-border-dark);
	padding-top: var(--space-8);
	flex-shrink: 0;
}

@media (max-width: 640px) {
	.how-connector { display: none; }
}

/* CTA */
.cta-section {
	background: linear-gradient(135deg, var(--c-charcoal) 0%, #3D3630 100%);
	padding: var(--space-16) 0;
}

.cta-inner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-8);
	flex-wrap: wrap;
}

.cta-text {
	max-width: 480px;
}

.cta-text p {
	color: #9A9692;
	margin-top: var(--space-3);
	font-size: 1.0625rem;
	line-height: 1.6;
}

.cta-actions {
	display: flex;
	gap: var(--space-3);
	flex-wrap: wrap;
}
</style>

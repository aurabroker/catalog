<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SalonCard from '$lib/components/SalonCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let q    = $state(data.filters.q);
	let city = $state(data.filters.city);

	$effect.pre(() => {
		q    = data.filters.q;
		city = data.filters.city;
	});

	const plans = [
		{ value: '',            label: 'Wszystkie' },
		{ value: 'premium_plus', label: 'Premium+' },
		{ value: 'premium',     label: 'Premium' },
		{ value: 'basic',       label: 'Basic (bezpłatne)' },
	];

	const categories = [
		{ value: '', label: 'Wszystkie kategorie' },
		{ value: 'fryzjerstwo',  label: 'Fryzjerstwo' },
		{ value: 'kosmetologia', label: 'Kosmetologia' },
		{ value: 'paznokcie',    label: 'Paznokcie' },
		{ value: 'brwi-rzesy',   label: 'Brwi i rzęsy' },
		{ value: 'masaz-spa',    label: 'Masaż i SPA' },
		{ value: 'depilacja',    label: 'Depilacja' },
	];

	function setPlan(value: string) {
		const params = new URLSearchParams($page.url.searchParams);
		if (value) params.set('plan', value); else params.delete('plan');
		goto('?' + params.toString(), { replaceState: true });
	}

	function setCategory(value: string) {
		const params = new URLSearchParams($page.url.searchParams);
		if (value) params.set('category', value); else params.delete('category');
		goto('?' + params.toString(), { replaceState: true });
	}
</script>

<svelte:head>
	<title>Katalog salonów beauty — BeautyKatalog</title>
	<meta name="description" content="Przeglądaj tysiące salonów beauty w Polsce. Fryzjerzy, kosmetolożki, paznokcie, masaż SPA. Filtruj i rezerwuj online." />
</svelte:head>

<div class="catalog-page">
	<!-- Top bar -->
	<div class="catalog-topbar">
		<div class="container topbar-inner">
			<SearchBar bind:q bind:city />

			<div class="filters">
				<select
					class="filter-select"
					value={data.filters.plan}
					onchange={(e) => setPlan((e.target as HTMLSelectElement).value)}
					aria-label="Filtruj według planu"
				>
					{#each plans as p}
						<option value={p.value}>{p.label}</option>
					{/each}
				</select>

				<select
					class="filter-select"
					value={data.filters.category}
					onchange={(e) => setCategory((e.target as HTMLSelectElement).value)}
					aria-label="Filtruj według kategorii"
				>
					{#each categories as c}
						<option value={c.value}>{c.label}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Results -->
	<div class="container catalog-body">
		<div class="results-header">
			<p class="results-count">
				{#if data.filters.q || data.filters.city}
					<strong>{data.salons.length}</strong> wyników
					{#if data.filters.q}dla <em>"{data.filters.q}"</em>{/if}
					{#if data.filters.city}w <em>{data.filters.city}</em>{/if}
				{:else}
					<strong>{data.salons.length}</strong> salonów
				{/if}
			</p>
		</div>

		{#if data.error}
			<div class="error-state">
				<p>Wystąpił błąd podczas pobierania danych. Spróbuj ponownie.</p>
			</div>
		{:else if data.salons.length === 0}
			<div class="empty-state">
				<p class="display-sm">Brak wyników</p>
				<p class="text-muted">Spróbuj zmienić kryteria wyszukiwania.</p>
				<a href="/katalog" class="btn btn-outline" style="margin-top:1rem">
					Pokaż wszystkie salony
				</a>
			</div>
		{:else}
			<div class="salons-grid">
				{#each data.salons as salon}
					<SalonCard {salon} />
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
.catalog-topbar {
	background: var(--c-surface);
	border-bottom: 1px solid var(--c-border);
	padding: var(--space-4) 0;
	position: sticky;
	top: 64px;
	z-index: 50;
}

.topbar-inner {
	display: flex;
	align-items: center;
	gap: var(--space-4);
	flex-wrap: wrap;
}

.filters {
	display: flex;
	gap: var(--space-3);
	flex-shrink: 0;
}

.filter-select {
	appearance: none;
	padding: var(--space-2) var(--space-8) var(--space-2) var(--space-4);
	border: 1.5px solid var(--c-border);
	border-radius: var(--radius-full);
	font-size: 0.875rem;
	color: var(--c-text);
	background: var(--c-surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C8480' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center;
	cursor: pointer;
	outline: none;
	transition: border-color var(--transition);
}

.filter-select:focus {
	border-color: var(--c-rose);
}

.catalog-body {
	padding-top: var(--space-8);
	padding-bottom: var(--space-16);
}

.results-header {
	margin-bottom: var(--space-6);
}

.results-count {
	font-size: 0.9375rem;
	color: var(--c-muted);
}

.results-count strong {
	color: var(--c-charcoal);
	font-weight: 600;
}

.salons-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: var(--space-6);
}

.empty-state, .error-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: var(--space-24) 0;
	gap: var(--space-3);
}
</style>

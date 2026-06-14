<script lang="ts">
	import { goto } from '$app/navigation';

	let {
		q = $bindable(''),
		city = $bindable(''),
		large = false
	}: {
		q?: string;
		city?: string;
		large?: boolean;
	} = $props();

	function handleSubmit(e: Event) {
		e.preventDefault();
		const params = new URLSearchParams();
		if (q.trim())    params.set('q', q.trim());
		if (city.trim()) params.set('city', city.trim());
		goto('/katalog?' + params.toString());
	}
</script>

<form class="search-bar" class:large onsubmit={handleSubmit} role="search">
	<div class="search-field">
		<svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
		</svg>
		<input
			type="search"
			bind:value={q}
			placeholder={large ? 'Zabieg, salon, fryzjer…' : 'Szukaj'}
			class="search-input"
			aria-label="Szukaj salonu lub zabiegu"
		/>
	</div>

	<div class="search-sep" aria-hidden="true"></div>

	<div class="search-field">
		<svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
		</svg>
		<input
			type="text"
			bind:value={city}
			placeholder="Miasto"
			class="search-input"
			aria-label="Miasto"
		/>
	</div>

	<button type="submit" class="search-btn" aria-label="Szukaj">
		{#if large}
			Znajdź salon
		{:else}
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
			</svg>
		{/if}
	</button>
</form>

<style>
.search-bar {
	display: flex;
	align-items: center;
	background: var(--c-surface);
	border: 1.5px solid var(--c-border);
	border-radius: var(--radius-full);
	box-shadow: var(--shadow-md);
	overflow: hidden;
	transition: box-shadow var(--transition), border-color var(--transition);
	max-width: 600px;
	width: 100%;
}

.search-bar:focus-within {
	border-color: var(--c-rose);
	box-shadow: 0 0 0 4px rgba(200,160,162,.12), var(--shadow-md);
}

.search-bar.large {
	max-width: 680px;
	height: 60px;
}

.search-field {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
	padding: 0 var(--space-4);
	gap: var(--space-2);
}

.search-icon {
	color: var(--c-muted);
	flex-shrink: 0;
}

.search-input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 0.9375rem;
	color: var(--c-text);
	min-width: 0;
}

.search-input::placeholder { color: var(--c-placeholder); }
.search-input::-webkit-search-cancel-button { display: none; }

.search-sep {
	width: 1px;
	height: 28px;
	background: var(--c-border);
	flex-shrink: 0;
}

.large .search-input { font-size: 1rem; }

.search-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 4px;
	padding: var(--space-2) var(--space-5);
	background: var(--c-charcoal);
	color: #fff;
	border: none;
	border-radius: var(--radius-full);
	font-size: 0.9375rem;
	font-weight: 500;
	white-space: nowrap;
	transition: background var(--transition);
	height: 40px;
}

.large .search-btn {
	padding: var(--space-3) var(--space-6);
	font-size: 1rem;
	height: 52px;
}

.search-btn:hover { background: #1a1816; }
</style>

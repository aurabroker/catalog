<script lang="ts">
	import { page } from '$app/stores';
	import type { User } from '@supabase/supabase-js';

	let { user }: { user: User | null } = $props();

	let menuOpen = $state(false);
	const isActive = (path: string) => $page.url.pathname.startsWith(path);
</script>

<header class="header">
	<div class="container header-inner">
		<a href="/" class="logo" aria-label="Beauty Katalog - strona główna">
			<span class="logo-icon">✦</span>
			<span class="logo-text">Beauty<strong>Katalog</strong></span>
		</a>

		<nav class="nav" aria-label="Główna nawigacja">
			<a href="/katalog" class="nav-link" class:active={isActive('/katalog')}>Katalog</a>
			<a href="/katalog?plan=premium" class="nav-link">Premium</a>
		</nav>

		<div class="header-actions">
			{#if user}
				<a href="/dashboard/salon" class="btn btn-outline btn-sm">Panel salonu</a>
			{:else}
				<a href="/auth/login" class="btn btn-primary btn-sm">Dodaj salon</a>
			{/if}

			<button
				class="menu-toggle"
				aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
				onclick={() => (menuOpen = !menuOpen)}
			>
				<span class="bar" class:open={menuOpen}></span>
			</button>
		</div>
	</div>

	{#if menuOpen}
		<div class="mobile-menu">
			<a href="/katalog" onclick={() => (menuOpen = false)}>Katalog</a>
			<a href="/katalog?plan=premium" onclick={() => (menuOpen = false)}>Salony Premium</a>
			<div class="divider"></div>
			{#if user}
				<a href="/dashboard/salon" onclick={() => (menuOpen = false)}>Panel salonu</a>
			{:else}
				<a href="/auth/login" onclick={() => (menuOpen = false)}>Dodaj salon</a>
			{/if}
		</div>
	{/if}
</header>

<style>
.header {
	position: sticky;
	top: 0;
	z-index: 100;
	background: rgba(250,248,245,.92);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	border-bottom: 1px solid var(--c-border);
}

.header-inner {
	display: flex;
	align-items: center;
	gap: var(--space-6);
	height: 64px;
}

.logo {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	flex-shrink: 0;
	text-decoration: none;
}

.logo-icon {
	color: var(--c-rose);
	font-size: 1.2rem;
}

.logo-text {
	font-family: var(--font-display);
	font-size: 1.125rem;
	color: var(--c-charcoal);
	letter-spacing: -0.01em;
}

.logo-text strong {
	font-weight: 700;
}

.nav {
	display: none;
	align-items: center;
	gap: var(--space-1);
	margin-left: var(--space-4);
}

@media (min-width: 768px) {
	.nav { display: flex; }
}

.nav-link {
	padding: var(--space-2) var(--space-4);
	border-radius: var(--radius-full);
	font-size: 0.9rem;
	font-weight: 500;
	color: var(--c-muted);
	transition: color var(--transition), background var(--transition);
}

.nav-link:hover, .nav-link.active {
	color: var(--c-charcoal);
	background: var(--c-surface-2);
}

.header-actions {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	margin-left: auto;
}

.menu-toggle {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border: none;
	background: none;
	border-radius: var(--radius-sm);
}

@media (min-width: 768px) {
	.menu-toggle { display: none; }
}

.bar {
	display: block;
	width: 20px;
	height: 2px;
	background: var(--c-charcoal);
	border-radius: 2px;
	position: relative;
	transition: background var(--transition);
}

.bar::before, .bar::after {
	content: '';
	position: absolute;
	width: 100%;
	height: 100%;
	background: var(--c-charcoal);
	border-radius: 2px;
	transition: transform var(--transition);
}

.bar::before { transform: translateY(-6px); }
.bar::after  { transform: translateY(6px); }

.bar.open { background: transparent; }
.bar.open::before { transform: rotate(45deg); }
.bar.open::after  { transform: rotate(-45deg); }

.mobile-menu {
	background: var(--c-surface);
	border-top: 1px solid var(--c-border);
	padding: var(--space-4) var(--space-5);
	display: flex;
	flex-direction: column;
	gap: var(--space-1);
}

@media (min-width: 768px) {
	.mobile-menu { display: none; }
}

.mobile-menu a {
	padding: var(--space-3) var(--space-4);
	border-radius: var(--radius-md);
	font-weight: 500;
	color: var(--c-text);
	transition: background var(--transition);
}

.mobile-menu a:hover { background: var(--c-surface-2); }

.mobile-menu .divider {
	margin: var(--space-2) 0;
}
</style>

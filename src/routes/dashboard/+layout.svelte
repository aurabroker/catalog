<script lang="ts">
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	const navItems = [
		{ href: '/dashboard/salon',            label: 'Przegląd',    icon: '◉' },
		{ href: '/dashboard/salon/uslugi',      label: 'Usługi',      icon: '✦' },
		{ href: '/dashboard/salon/pracownicy',  label: 'Pracownicy',  icon: '◈' },
		{ href: '/dashboard/salon/kalendarz',   label: 'Kalendarz',   icon: '▦' },
		{ href: '/dashboard/salon/opinie',      label: 'Opinie',      icon: '★' },
		{ href: '/dashboard/salon/promocje',    label: 'Promocje',    icon: '⊕' },
		{ href: '/dashboard/salon/ustawienia',  label: 'Ustawienia',  icon: '⚙' },
	];

	const isActive = (href: string) => $page.url.pathname === href;

	async function signOut() {
		await data.supabase.auth.signOut();
	}
</script>

<div class="dashboard">
	<aside class="sidebar">
		<div class="sidebar-top">
			<a href="/" class="sidebar-logo">
				<span class="logo-icon">✦</span>
				<span>Beauty<strong>Katalog</strong></span>
			</a>
		</div>

		<nav class="sidebar-nav">
			{#each navItems as item}
				<a
					href={item.href}
					class="nav-item"
					class:active={isActive(item.href)}
					aria-current={isActive(item.href) ? 'page' : undefined}
				>
					<span class="nav-icon" aria-hidden="true">{item.icon}</span>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="sidebar-bottom">
			<div class="user-info">
				<div class="user-avatar">
					{(data.user?.email ?? 'U')[0].toUpperCase()}
				</div>
				<div class="user-meta">
					<p class="user-email text-xs truncate">{data.user?.email}</p>
				</div>
			</div>
			<button class="btn btn-ghost btn-sm" onclick={signOut} style="width:100%; justify-content:center; margin-top:.5rem">
				Wyloguj się
			</button>
		</div>
	</aside>

	<main class="dashboard-main">
		{@render children()}
	</main>
</div>

<style>
.dashboard {
	display: grid;
	grid-template-columns: 240px 1fr;
	min-height: calc(100vh - 64px);
}

@media (max-width: 1023px) {
	.dashboard { grid-template-columns: 1fr; }
	.sidebar { display: none; }
}

.sidebar {
	background: var(--c-surface);
	border-right: 1px solid var(--c-border);
	display: flex;
	flex-direction: column;
	position: sticky;
	top: 64px;
	height: calc(100vh - 64px);
	overflow-y: auto;
}

.sidebar-top {
	padding: var(--space-5) var(--space-5) var(--space-4);
	border-bottom: 1px solid var(--c-border);
}

.sidebar-logo {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	font-family: var(--font-display);
	font-size: 1rem;
	color: var(--c-charcoal);
	text-decoration: none;
}

.logo-icon { color: var(--c-rose); }
.sidebar-logo strong { font-weight: 700; }

.sidebar-nav {
	flex: 1;
	padding: var(--space-4) var(--space-3);
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.nav-item {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	padding: var(--space-3) var(--space-3);
	border-radius: var(--radius-md);
	font-size: 0.9rem;
	font-weight: 500;
	color: var(--c-muted);
	text-decoration: none;
	transition: background var(--transition), color var(--transition);
}

.nav-item:hover { background: var(--c-surface-2); color: var(--c-charcoal); }
.nav-item.active { background: var(--c-rose-light); color: var(--c-rose-dark); }

.nav-icon {
	font-size: 0.875rem;
	width: 20px;
	text-align: center;
	flex-shrink: 0;
}

.sidebar-bottom {
	padding: var(--space-4) var(--space-4);
	border-top: 1px solid var(--c-border);
}

.user-info {
	display: flex;
	align-items: center;
	gap: var(--space-3);
}

.user-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: var(--c-rose-light);
	color: var(--c-rose-dark);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	font-size: 0.875rem;
	flex-shrink: 0;
}

.user-email { color: var(--c-muted); max-width: 140px; }

.dashboard-main {
	background: var(--c-bg);
	min-height: calc(100vh - 64px);
}
</style>

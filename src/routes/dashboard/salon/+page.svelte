<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const planLabel: Record<string, string> = {
		basic: 'Basic',
		premium: 'Premium',
		premium_plus: 'Premium+'
	};

	const statusLabel: Record<string, { label: string; cls: string }> = {
		draft:     { label: 'Szkic',      cls: 'badge-surface' },
		published: { label: 'Opublikowany', cls: 'badge-rose' },
		suspended: { label: 'Zawieszony', cls: 'badge-surface' }
	};
</script>

<svelte:head><title>Panel salonu — BeautyKatalog</title></svelte:head>

<div class="dash-page">
	<div class="dash-header">
		<h1 class="display-md">Panel salonu</h1>
		<a href="/dashboard/salon/nowy" class="btn btn-primary">+ Dodaj salon</a>
	</div>

	{#if data.salons.length === 0}
		<div class="empty-dashboard">
			<div class="empty-icon">✦</div>
			<h2 class="display-sm">Nie masz jeszcze salonu</h2>
			<p class="text-muted">Dodaj swój salon beauty do katalogu i zacznij przyjmować rezerwacje online.</p>
			<a href="/dashboard/salon/nowy" class="btn btn-primary btn-lg">Dodaj pierwszy salon</a>
		</div>
	{:else}
		<div class="salons-list">
			{#each data.salons as m}
				{@const salon = m.salon}
				<div class="salon-row">
					<div class="salon-thumb">
						{#if salon.cover_image_url}
							<img src={salon.cover_image_url} alt={salon.name} />
						{:else}
							<div class="thumb-placeholder">✦</div>
						{/if}
					</div>
					<div class="salon-info">
						<div class="salon-row-header">
							<h2 class="salon-row-name">{salon.name}</h2>
							<div class="salon-row-badges">
								{#if salon.status}
									<span class="badge {statusLabel[salon.status]?.cls ?? 'badge-surface'}">
										{statusLabel[salon.status]?.label ?? salon.status}
									</span>
								{/if}
								{#if salon.plan}
									<span class="badge badge-gold">{planLabel[salon.plan] ?? salon.plan}</span>
								{/if}
								<span class="badge badge-surface">{m.role}</span>
							</div>
						</div>
						{#if salon.city}<p class="text-sm text-muted">{salon.city}</p>{/if}
					</div>
					<div class="salon-actions">
						<a href="/salon/{salon.slug}" class="btn btn-outline btn-sm" target="_blank">
							Podgląd ↗
						</a>
						<a href="/dashboard/salon/{salon.id}/edytuj" class="btn btn-primary btn-sm">
							Edytuj
						</a>
					</div>
				</div>
			{/each}
		</div>

		<!-- Quick actions -->
		<div class="quick-actions">
			<h2 class="display-sm" style="margin-bottom:1.5rem">Szybkie akcje</h2>
			<div class="actions-grid">
				<a href="/dashboard/salon/uslugi" class="action-card">
					<span class="action-icon">✦</span>
					<strong>Zabiegi i usługi</strong>
					<p class="text-sm text-muted">Dodaj lub edytuj ofertę salonu</p>
				</a>
				<a href="/dashboard/salon/pracownicy" class="action-card">
					<span class="action-icon">◈</span>
					<strong>Pracownicy</strong>
					<p class="text-sm text-muted">Zarządzaj zespołem i grafikami</p>
				</a>
				<a href="/dashboard/salon/kalendarz" class="action-card">
					<span class="action-icon">▦</span>
					<strong>Kalendarz</strong>
					<p class="text-sm text-muted">Przeglądaj i zarządzaj wizytami</p>
				</a>
				<a href="/dashboard/salon/promocje" class="action-card">
					<span class="action-icon">⊕</span>
					<strong>Promocje</strong>
					<p class="text-sm text-muted">Dodaj aktualne oferty specjalne</p>
				</a>
			</div>
		</div>
	{/if}
</div>

<style>
.dash-page {
	padding: var(--space-8) var(--space-8) var(--space-16);
	max-width: 900px;
}

.dash-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: var(--space-8);
	gap: var(--space-4);
}

/* Empty state */
.empty-dashboard {
	text-align: center;
	padding: var(--space-16) 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--space-4);
}

.empty-icon {
	font-size: 3rem;
	color: var(--c-rose);
	opacity: .5;
}

/* Salon list */
.salons-list {
	display: flex;
	flex-direction: column;
	gap: var(--space-4);
	margin-bottom: var(--space-12);
}

.salon-row {
	display: flex;
	align-items: center;
	gap: var(--space-5);
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	padding: var(--space-4) var(--space-5);
}

.salon-thumb {
	width: 64px;
	height: 64px;
	border-radius: var(--radius-md);
	overflow: hidden;
	background: var(--c-surface-2);
	flex-shrink: 0;
}

.salon-thumb img { width: 100%; height: 100%; object-fit: cover; }

.thumb-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--c-rose);
	font-size: 1.5rem;
	opacity: .5;
}

.salon-info { flex: 1; min-width: 0; }

.salon-row-header {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	flex-wrap: wrap;
	margin-bottom: 4px;
}

.salon-row-name {
	font-family: var(--font-display);
	font-size: 1.0625rem;
	font-weight: 600;
	color: var(--c-charcoal);
}

.salon-row-badges {
	display: flex;
	gap: var(--space-2);
	flex-wrap: wrap;
}

.salon-actions {
	display: flex;
	gap: var(--space-2);
	flex-shrink: 0;
}

/* Quick actions */
.actions-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	gap: var(--space-4);
}

.action-card {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
	padding: var(--space-5);
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	text-decoration: none;
	transition: all var(--transition);
}

.action-card:hover {
	border-color: var(--c-rose);
	background: var(--c-rose-light);
	transform: translateY(-2px);
	box-shadow: var(--shadow-sm);
}

.action-icon {
	font-size: 1.5rem;
	color: var(--c-rose);
}

.action-card strong {
	font-weight: 600;
	color: var(--c-charcoal);
	font-size: 0.9375rem;
}
</style>

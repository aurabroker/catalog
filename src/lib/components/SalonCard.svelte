<script lang="ts">
	import type { CatalogSalon } from '$lib/types';

	let { salon }: { salon: CatalogSalon } = $props();

	const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
	const formatPrice = (p: number | null | undefined) => p ? `od ${p} zł` : null;
</script>

<a href="/salon/{salon.slug}" class="card salon-card">
	<div class="card-photo">
		{#if salon.cover_image_url}
			<img src={salon.cover_image_url} alt={salon.name} loading="lazy" />
		{:else}
			<div class="photo-placeholder">
				<span>✦</span>
			</div>
		{/if}

		{#if salon.plan !== 'basic'}
			<span class="plan-badge badge badge-gold">
				{salon.plan === 'premium_plus' ? 'Premium+' : 'Premium'}
			</span>
		{/if}

		{#if salon.booking_enabled}
			<span class="booking-badge badge badge-rose">Rezerwacja online</span>
		{/if}
	</div>

	<div class="card-body">
		<div class="card-header">
			{#if salon.logo_url}
				<img src={salon.logo_url} alt="" class="salon-logo" />
			{/if}
			<div class="card-meta">
				<h3 class="card-name">{salon.name}</h3>
				{#if salon.city}
					<p class="card-location">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
						</svg>
						{salon.city}
					</p>
				{/if}
			</div>
		</div>

		{#if salon.avg_rating && salon.review_count}
			<div class="card-rating">
				<span class="stars" aria-label="{salon.avg_rating} gwiazdek">
					{stars(salon.avg_rating)}
				</span>
				<span class="rating-value">{salon.avg_rating.toFixed(1)}</span>
				<span class="rating-count text-muted">({salon.review_count})</span>
			</div>
		{/if}

		{#if salon.short_description}
			<p class="card-desc clamp-2 text-sm text-muted">{salon.short_description}</p>
		{/if}

		{#if salon.services?.length}
			<div class="card-services">
				{#each salon.services.slice(0, 3) as service}
					<span class="badge badge-surface">
						{service.name}
						{#if service.price_from}
							· {formatPrice(service.price_from)}
						{/if}
					</span>
				{/each}
			</div>
		{/if}
	</div>
</a>

<style>
.salon-card {
	display: flex;
	flex-direction: column;
	text-decoration: none;
	height: 100%;
}

.card-photo {
	position: relative;
	aspect-ratio: 16 / 9;
	overflow: hidden;
	background: var(--c-surface-2);
}

.card-photo img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform .4s var(--ease);
}

.salon-card:hover .card-photo img {
	transform: scale(1.04);
}

.photo-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, var(--c-rose-light), var(--c-gold-light));
	font-size: 2rem;
	color: var(--c-rose);
	opacity: .6;
}

.plan-badge {
	position: absolute;
	top: var(--space-3);
	left: var(--space-3);
}

.booking-badge {
	position: absolute;
	bottom: var(--space-3);
	right: var(--space-3);
}

.card-body {
	padding: var(--space-4) var(--space-5) var(--space-5);
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
	flex: 1;
}

.card-header {
	display: flex;
	align-items: flex-start;
	gap: var(--space-3);
}

.salon-logo {
	width: 40px;
	height: 40px;
	border-radius: var(--radius-sm);
	object-fit: cover;
	border: 1px solid var(--c-border);
	flex-shrink: 0;
	margin-top: 2px;
}

.card-name {
	font-family: var(--font-display);
	font-size: 1.0625rem;
	font-weight: 600;
	color: var(--c-charcoal);
	line-height: 1.3;
}

.card-location {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 0.8125rem;
	color: var(--c-muted);
	margin-top: 2px;
}

.card-rating {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	font-size: 0.8125rem;
}

.stars { font-size: 0.75rem; }

.rating-value {
	font-weight: 600;
	color: var(--c-charcoal);
}

.card-desc { line-height: 1.5; }

.card-services {
	display: flex;
	flex-wrap: wrap;
	gap: var(--space-2);
	margin-top: auto;
}
</style>

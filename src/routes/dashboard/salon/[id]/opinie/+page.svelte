<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let avgRating = $derived(
		data.reviews.length
			? data.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / data.reviews.length
			: 0
	);

	let starBreakdown = $derived(
		[5, 4, 3, 2, 1].map((star) => ({
			star,
			count: data.reviews.filter((r: any) => r.rating === star).length
		}))
	);

	function stars(rating: number): string {
		return '★'.repeat(rating) + '☆'.repeat(5 - rating);
	}

	function formatDate(iso: string | null): string {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
	}
</script>

<svelte:head><title>Opinie — {data.salon.name}</title></svelte:head>

<div class="page">
	<div class="page-header">
		<h1 class="display-md">Opinie</h1>
	</div>

	{#if form?.error}
		<div class="alert-error">{form.error}</div>
	{/if}

	{#if data.reviews.length > 0}
		<div class="stats-card">
			<div class="avg-block">
				<div class="avg-number">{avgRating.toFixed(1)}</div>
				<div class="avg-stars stars">{stars(Math.round(avgRating))}</div>
				<div class="avg-count text-sm text-muted">{data.reviews.length} {data.reviews.length === 1 ? 'opinia' : data.reviews.length < 5 ? 'opinie' : 'opinii'}</div>
			</div>
			<div class="breakdown">
				{#each starBreakdown as { star, count }}
					<div class="bar-row">
						<span class="bar-label text-sm">{star}★</span>
						<div class="bar-track">
							<div
								class="bar-fill"
								style="width: {data.reviews.length ? (count / data.reviews.length) * 100 : 0}%"
							></div>
						</div>
						<span class="bar-count text-sm text-muted">{count}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if data.reviews.length === 0}
		<div class="empty-state">
			<div class="empty-icon">★</div>
			<p class="text-muted">Brak opinii dla tego salonu.</p>
		</div>
	{:else}
		<div class="reviews-list">
			{#each data.reviews as review}
				<div class="review-card" class:featured={review.is_featured}>
					<div class="review-header">
						<div class="review-meta">
							<span class="review-author">{review.author_name}</span>
							<span class="stars review-stars">{stars(review.rating)}</span>
							<span class="text-xs text-muted">{formatDate(review.published_at)}</span>
							{#if review.source && review.source !== 'manual'}
								<span class="badge badge-surface">{review.source}</span>
							{/if}
							{#if review.is_featured}
								<span class="badge badge-gold">Wyróżniona</span>
							{/if}
						</div>
						<div class="review-actions">
							<form method="POST" action="?/featureReview" use:enhance>
								<input type="hidden" name="id" value={review.id} />
								<input type="hidden" name="is_featured" value={review.is_featured ? 'false' : 'true'} />
								<button class="btn btn-outline btn-sm" type="submit" title={review.is_featured ? 'Usuń wyróżnienie' : 'Wyróżnij'}>
									{review.is_featured ? '★ Usuń' : '☆ Wyróżnij'}
								</button>
							</form>
							<form method="POST" action="?/deleteReview" use:enhance>
								<input type="hidden" name="id" value={review.id} />
								<button
									class="btn btn-ghost btn-sm delete-btn"
									type="submit"
									onclick={(e) => { if (!confirm('Usunąć tę opinię?')) e.preventDefault(); }}
								>
									Usuń
								</button>
							</form>
						</div>
					</div>
					{#if review.content}
						<p class="review-content">{review.content}</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
.page {
	padding: var(--space-8);
	max-width: 900px;
}

.page-header {
	margin-bottom: var(--space-6);
}

.alert-error {
	background: #FEF2F2;
	color: var(--c-error);
	border: 1px solid #FECACA;
	border-radius: var(--radius-md);
	padding: var(--space-3) var(--space-4);
	margin-bottom: var(--space-4);
	font-size: 0.875rem;
}

.stats-card {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	padding: var(--space-6);
	display: flex;
	gap: var(--space-8);
	align-items: center;
	margin-bottom: var(--space-6);
	flex-wrap: wrap;
}

.avg-block {
	text-align: center;
	min-width: 100px;
}

.avg-number {
	font-family: var(--font-display);
	font-size: 3rem;
	font-weight: 700;
	color: var(--c-charcoal);
	line-height: 1;
}

.avg-stars {
	font-size: 1.125rem;
	margin: var(--space-1) 0;
}

.breakdown {
	flex: 1;
	min-width: 200px;
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
}

.bar-row {
	display: flex;
	align-items: center;
	gap: var(--space-2);
}

.bar-label {
	width: 2rem;
	text-align: right;
	color: var(--c-muted);
	flex-shrink: 0;
}

.bar-track {
	flex: 1;
	height: 8px;
	background: var(--c-surface-2);
	border-radius: var(--radius-full);
	overflow: hidden;
}

.bar-fill {
	height: 100%;
	background: var(--c-rose);
	border-radius: var(--radius-full);
	transition: width var(--transition);
}

.bar-count {
	width: 1.5rem;
	text-align: left;
	flex-shrink: 0;
}

.empty-state {
	text-align: center;
	padding: var(--space-16) 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--space-3);
}

.empty-icon {
	font-size: 2.5rem;
	color: var(--c-rose);
	opacity: .4;
}

.reviews-list {
	display: flex;
	flex-direction: column;
	gap: var(--space-4);
}

.review-card {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	padding: var(--space-5);
	transition: border-color var(--transition);
}

.review-card.featured {
	border-color: var(--c-gold);
}

.review-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: var(--space-4);
	margin-bottom: var(--space-3);
	flex-wrap: wrap;
}

.review-meta {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	flex-wrap: wrap;
}

.review-author {
	font-weight: 600;
	color: var(--c-charcoal);
	font-size: 0.9375rem;
}

.review-stars {
	font-size: 0.875rem;
}

.review-actions {
	display: flex;
	gap: var(--space-2);
	flex-shrink: 0;
}

.delete-btn {
	color: var(--c-error);
}

.delete-btn:hover {
	background: #FEF2F2;
}

.review-content {
	font-size: 0.9375rem;
	color: var(--c-text);
	line-height: 1.6;
}
</style>

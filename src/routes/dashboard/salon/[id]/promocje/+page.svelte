<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const DISCOUNT_LABELS: Record<string, string> = {
		percent: 'Procentowy',
		fixed: 'Kwotowy',
		free: 'Gratis',
		other: 'Inne'
	};

	function discountDisplay(promo: any): string {
		if (!promo.discount_type) return '';
		if (promo.discount_type === 'percent' && promo.discount_value != null) {
			return `-${promo.discount_value}%`;
		}
		if (promo.discount_type === 'fixed' && promo.discount_value != null) {
			return `-${promo.discount_value} zł`;
		}
		if (promo.discount_type === 'free') return 'Gratis';
		return DISCOUNT_LABELS[promo.discount_type] ?? promo.discount_type;
	}

	function formatDate(s: string | null): string {
		if (!s) return '—';
		return new Date(s).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
	}

	let showCreate = $state(false);
	let editingPromo = $state<any>(null);

	let createForm = $state({
		title: '',
		description: '',
		discount_type: 'percent',
		discount_value: '',
		valid_from: '',
		valid_until: ''
	});

	function startEdit(promo: any) {
		editingPromo = { ...promo };
	}

	function cancelEdit() {
		editingPromo = null;
	}
</script>

<svelte:head><title>Promocje — {data.salon.name}</title></svelte:head>

<div class="page">
	<div class="page-header">
		<h1 class="display-md">Promocje</h1>
		<button class="btn btn-primary btn-sm" onclick={() => (showCreate = !showCreate)}>
			{showCreate ? '✕ Anuluj' : '+ Dodaj promocję'}
		</button>
	</div>

	{#if form?.createError}
		<div class="alert-error">{form.createError}</div>
	{/if}
	{#if form?.updateError}
		<div class="alert-error">{form.updateError}</div>
	{/if}
	{#if form?.deleteError}
		<div class="alert-error">{form.deleteError}</div>
	{/if}

	{#if showCreate}
		<div class="create-form-card">
			<h2 class="display-sm" style="margin-bottom:var(--space-5)">Nowa promocja</h2>
			<form
				method="POST"
				action="?/createPromotion"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							showCreate = false;
							createForm = { title: '', description: '', discount_type: 'percent', discount_value: '', valid_from: '', valid_until: '' };
						}
						await update();
					};
				}}
			>
				<div class="form-grid">
					<div class="field span-2">
						<label for="ct">Tytuł *</label>
						<input id="ct" class="input" name="title" bind:value={createForm.title} required />
					</div>
					<div class="field span-2">
						<label for="cd">Opis</label>
						<textarea id="cd" class="input" name="description" rows="2" bind:value={createForm.description}></textarea>
					</div>
					<div class="field">
						<label for="cdt">Typ zniżki</label>
						<select id="cdt" class="input" name="discount_type" bind:value={createForm.discount_type}>
							<option value="percent">Procentowy</option>
							<option value="fixed">Kwotowy</option>
							<option value="free">Gratis</option>
							<option value="other">Inne</option>
						</select>
					</div>
					{#if createForm.discount_type === 'percent' || createForm.discount_type === 'fixed'}
						<div class="field">
							<label for="cdv">Wartość {createForm.discount_type === 'percent' ? '(%)' : '(zł)'}</label>
							<input id="cdv" class="input" name="discount_value" type="number" min="0" step="0.01" bind:value={createForm.discount_value} />
						</div>
					{/if}
					<div class="field">
						<label for="cvf">Ważna od</label>
						<input id="cvf" class="input" name="valid_from" type="date" bind:value={createForm.valid_from} />
					</div>
					<div class="field">
						<label for="cvu">Ważna do</label>
						<input id="cvu" class="input" name="valid_until" type="date" bind:value={createForm.valid_until} />
					</div>
				</div>
				<div class="form-actions">
					<button class="btn btn-primary" type="submit">Dodaj promocję</button>
					<button class="btn btn-ghost" type="button" onclick={() => (showCreate = false)}>Anuluj</button>
				</div>
			</form>
		</div>
	{/if}

	{#if data.promotions.length === 0 && !showCreate}
		<div class="empty-state">
			<div class="empty-icon">⊕</div>
			<p class="text-muted">Brak aktywnych promocji. Dodaj pierwszą!</p>
		</div>
	{:else}
		<div class="promos-grid">
			{#each data.promotions as promo}
				{#if editingPromo?.id === promo.id}
					<div class="promo-edit-card">
						<form
							method="POST"
							action="?/updatePromotion"
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') editingPromo = null;
									await update();
								};
							}}
						>
							<input type="hidden" name="id" value={promo.id} />
							<input type="hidden" name="is_active" value={editingPromo.is_active ? 'true' : 'false'} />
							<div class="form-grid">
								<div class="field span-2">
									<label>Tytuł *</label>
									<input class="input" name="title" bind:value={editingPromo.title} required />
								</div>
								<div class="field span-2">
									<label>Opis</label>
									<textarea class="input" name="description" rows="2" bind:value={editingPromo.description}></textarea>
								</div>
								<div class="field">
									<label>Typ zniżki</label>
									<select class="input" name="discount_type" bind:value={editingPromo.discount_type}>
										<option value="percent">Procentowy</option>
										<option value="fixed">Kwotowy</option>
										<option value="free">Gratis</option>
										<option value="other">Inne</option>
									</select>
								</div>
								{#if editingPromo.discount_type === 'percent' || editingPromo.discount_type === 'fixed'}
									<div class="field">
										<label>Wartość</label>
										<input class="input" name="discount_value" type="number" min="0" step="0.01" bind:value={editingPromo.discount_value} />
									</div>
								{/if}
								<div class="field">
									<label>Ważna od</label>
									<input class="input" name="valid_from" type="date" bind:value={editingPromo.valid_from} />
								</div>
								<div class="field">
									<label>Ważna do</label>
									<input class="input" name="valid_until" type="date" bind:value={editingPromo.valid_until} />
								</div>
							</div>
							<label class="toggle-row">
								<input type="checkbox" bind:checked={editingPromo.is_active} />
								<span>Aktywna</span>
							</label>
							<div class="form-actions">
								<button class="btn btn-primary btn-sm" type="submit">Zapisz</button>
								<button class="btn btn-ghost btn-sm" type="button" onclick={cancelEdit}>Anuluj</button>
							</div>
						</form>
					</div>
				{:else}
					<div class="promo-card" class:inactive={!promo.is_active}>
						<div class="promo-top">
							<div class="promo-title-row">
								<h3 class="promo-title">{promo.title}</h3>
								{#if discountDisplay(promo)}
									<span class="discount-badge">{discountDisplay(promo)}</span>
								{/if}
							</div>
							<div class="promo-status">
								{#if promo.is_active}
									<span class="badge badge-rose">Aktywna</span>
								{:else}
									<span class="badge badge-surface">Nieaktywna</span>
								{/if}
							</div>
						</div>

						{#if promo.description}
							<p class="promo-desc">{promo.description}</p>
						{/if}

						<div class="promo-dates text-sm text-muted">
							{#if promo.valid_from || promo.valid_until}
								{formatDate(promo.valid_from)} – {formatDate(promo.valid_until)}
							{/if}
						</div>

						<div class="promo-actions">
							<button class="btn btn-outline btn-sm" onclick={() => startEdit(promo)}>Edytuj</button>

							<form method="POST" action="?/updatePromotion" use:enhance>
								<input type="hidden" name="id" value={promo.id} />
								<input type="hidden" name="title" value={promo.title} />
								<input type="hidden" name="description" value={promo.description ?? ''} />
								<input type="hidden" name="discount_type" value={promo.discount_type ?? ''} />
								<input type="hidden" name="discount_value" value={promo.discount_value ?? ''} />
								<input type="hidden" name="valid_from" value={promo.valid_from ?? ''} />
								<input type="hidden" name="valid_until" value={promo.valid_until ?? ''} />
								<input type="hidden" name="is_active" value={promo.is_active ? 'false' : 'true'} />
								<button class="btn btn-ghost btn-sm" type="submit">
									{promo.is_active ? 'Dezaktywuj' : 'Aktywuj'}
								</button>
							</form>

							<form method="POST" action="?/deletePromotion" use:enhance>
								<input type="hidden" name="id" value={promo.id} />
								<button
									class="btn btn-ghost btn-sm delete-btn"
									type="submit"
									onclick={(e) => { if (!confirm('Usunąć tę promocję?')) e.preventDefault(); }}
								>
									Usuń
								</button>
							</form>
						</div>
					</div>
				{/if}
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
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: var(--space-6);
	gap: var(--space-4);
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

.create-form-card,
.promo-edit-card {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	padding: var(--space-6);
	margin-bottom: var(--space-6);
}

.form-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-4);
	margin-bottom: var(--space-4);
}

.span-2 { grid-column: span 2; }

@media (max-width: 500px) {
	.form-grid { grid-template-columns: 1fr; }
	.span-2 { grid-column: span 1; }
}

.form-actions {
	display: flex;
	gap: var(--space-2);
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

.promos-grid {
	display: flex;
	flex-direction: column;
	gap: var(--space-4);
}

.promo-card {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	padding: var(--space-5);
	transition: border-color var(--transition);
}

.promo-card:hover { border-color: var(--c-rose); }

.promo-card.inactive { opacity: .65; }

.promo-top {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: var(--space-3);
	margin-bottom: var(--space-3);
	flex-wrap: wrap;
}

.promo-title-row {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	flex-wrap: wrap;
}

.promo-title {
	font-weight: 600;
	font-size: 1rem;
	color: var(--c-charcoal);
}

.discount-badge {
	background: var(--c-rose-light);
	color: var(--c-rose-dark);
	font-size: 0.8125rem;
	font-weight: 700;
	padding: 2px var(--space-3);
	border-radius: var(--radius-full);
}

.promo-desc {
	font-size: 0.875rem;
	color: var(--c-text);
	margin-bottom: var(--space-2);
}

.promo-dates {
	margin-bottom: var(--space-4);
}

.promo-actions {
	display: flex;
	gap: var(--space-2);
	flex-wrap: wrap;
}

.delete-btn { color: var(--c-error); }
.delete-btn:hover { background: #FEF2F2; }

.toggle-row {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--c-text);
	cursor: pointer;
	margin-bottom: var(--space-4);
}
</style>

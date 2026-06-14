<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showCreateForm = $state(false);
	let editingId = $state<string | null>(null);

	function priceRange(from: number | null, to: number | null): string {
		if (from == null && to == null) return '—';
		if (from != null && to != null && from !== to) return `${from} – ${to} zł`;
		return `${from ?? to} zł`;
	}

	type Service = typeof data.services[number];
	type Category = typeof data.categories[number];

	const grouped = $derived.by(() => {
		const map = new Map<string, { category: Category | null; items: Service[] }>();
		const nocat = '__none__';

		for (const s of data.services) {
			const cat = s.service_categories as Category | null;
			const key = cat?.id ?? nocat;
			if (!map.has(key)) map.set(key, { category: cat, items: [] });
			map.get(key)!.items.push(s);
		}

		return Array.from(map.values()).sort((a, b) => {
			if (!a.category) return 1;
			if (!b.category) return -1;
			return (a.category.name ?? '').localeCompare(b.category.name ?? '', 'pl');
		});
	});
</script>

<svelte:head><title>Usługi — BeautyKatalog</title></svelte:head>

<div class="dash-page">
	<div class="dash-header">
		<h1 class="display-md">Usługi</h1>
		<button
			class="btn btn-primary"
			onclick={() => { showCreateForm = !showCreateForm; editingId = null; }}
		>
			{showCreateForm ? 'Anuluj' : '+ Dodaj usługę'}
		</button>
	</div>

	{#if form?.error}
		<div class="alert-error">{form.error}</div>
	{/if}

	{#if showCreateForm}
		<div class="form-panel">
			<h2 class="form-title">Nowa usługa</h2>
			<form
				method="POST"
				action="?/createService"
				use:enhance={() => {
					return ({ result, update }) => {
						if (result.type === 'success') showCreateForm = false;
						update();
					};
				}}
			>
				<div class="form-grid">
					<div class="field span-2">
						<label for="c-name">Nazwa usługi *</label>
						<input id="c-name" class="input" name="name" required placeholder="np. Strzyżenie damskie" />
					</div>

					<div class="field">
						<label for="c-cat">Kategoria</label>
						<select id="c-cat" class="input" name="category_id">
							<option value="">— brak kategorii —</option>
							{#each data.categories as cat}
								<option value={cat.id}>{cat.name}</option>
							{/each}
						</select>
					</div>

					<div class="field">
						<label for="c-dur">Czas trwania (min)</label>
						<input id="c-dur" class="input" name="duration_min" type="number" min="1" placeholder="45" />
					</div>

					<div class="field">
						<label for="c-pfrom">Cena od (zł)</label>
						<input id="c-pfrom" class="input" name="price_from" type="number" min="0" step="0.01" placeholder="120" />
					</div>

					<div class="field">
						<label for="c-pto">Cena do (zł)</label>
						<input id="c-pto" class="input" name="price_to" type="number" min="0" step="0.01" placeholder="200" />
					</div>

					<div class="field span-2">
						<label for="c-desc">Krótki opis</label>
						<textarea id="c-desc" class="input" name="short_description" rows="2" placeholder="Krótki opis usługi..."></textarea>
					</div>

					<div class="field span-2">
						<label class="checkbox-label">
							<input type="checkbox" name="is_featured" />
							Wyróżniona usługa
						</label>
					</div>
				</div>

				<div class="form-actions">
					<button type="submit" class="btn btn-primary">Dodaj usługę</button>
					<button type="button" class="btn btn-ghost" onclick={() => showCreateForm = false}>Anuluj</button>
				</div>
			</form>
		</div>
	{/if}

	{#if data.services.length === 0}
		<div class="empty-state">
			<div class="empty-icon">✦</div>
			<h2 class="display-sm">Brak usług</h2>
			<p class="text-muted">Dodaj pierwszą usługę, aby uzupełnić ofertę salonu.</p>
		</div>
	{:else}
		<div class="services-list">
			{#each grouped as group}
				<div class="category-group">
					<h2 class="category-heading">
						{group.category?.name ?? 'Bez kategorii'}
					</h2>

					{#each group.items as service}
						<div class="service-row" class:inactive={!service.is_active}>
							{#if editingId === service.id}
								<div class="edit-panel">
									<form
										method="POST"
										action="?/updateService"
										use:enhance={() => {
											return ({ result, update }) => {
												if (result.type === 'success') editingId = null;
												update();
											};
										}}
									>
										<input type="hidden" name="serviceId" value={service.id} />
										<div class="form-grid">
											<div class="field span-2">
												<label for="e-name-{service.id}">Nazwa *</label>
												<input id="e-name-{service.id}" class="input" name="name" required value={service.name} />
											</div>

											<div class="field">
												<label for="e-cat-{service.id}">Kategoria</label>
												<select id="e-cat-{service.id}" class="input" name="category_id">
													<option value="">— brak —</option>
													{#each data.categories as cat}
														<option value={cat.id} selected={service.category_id === cat.id}>{cat.name}</option>
													{/each}
												</select>
											</div>

											<div class="field">
												<label for="e-dur-{service.id}">Czas (min)</label>
												<input id="e-dur-{service.id}" class="input" name="duration_min" type="number" min="1" value={service.duration_min ?? ''} />
											</div>

											<div class="field">
												<label for="e-pfrom-{service.id}">Cena od</label>
												<input id="e-pfrom-{service.id}" class="input" name="price_from" type="number" min="0" step="0.01" value={service.price_from ?? ''} />
											</div>

											<div class="field">
												<label for="e-pto-{service.id}">Cena do</label>
												<input id="e-pto-{service.id}" class="input" name="price_to" type="number" min="0" step="0.01" value={service.price_to ?? ''} />
											</div>

											<div class="field span-2">
												<label for="e-desc-{service.id}">Opis</label>
												<textarea id="e-desc-{service.id}" class="input" name="short_description" rows="2">{service.short_description ?? ''}</textarea>
											</div>

											<div class="field span-2 inline-checks">
												<label class="checkbox-label">
													<input type="checkbox" name="is_featured" checked={service.is_featured} />
													Wyróżniona
												</label>
												<label class="checkbox-label">
													<input type="checkbox" name="is_active" checked={service.is_active} />
													Aktywna
												</label>
											</div>
										</div>

										<div class="form-actions">
											<button type="submit" class="btn btn-primary btn-sm">Zapisz</button>
											<button type="button" class="btn btn-ghost btn-sm" onclick={() => editingId = null}>Anuluj</button>
										</div>
									</form>
								</div>
							{:else}
								<div class="service-info">
									<div class="service-main">
										<span class="service-name">{service.name}</span>
										{#if service.is_featured}
											<span class="badge badge-rose">Wyróżniona</span>
										{/if}
										{#if !service.is_active}
											<span class="badge badge-surface">Nieaktywna</span>
										{/if}
									</div>
									<div class="service-meta">
										{#if service.duration_min}
											<span class="meta-item">{service.duration_min} min</span>
										{/if}
										<span class="meta-item price">{priceRange(service.price_from, service.price_to)}</span>
									</div>
								</div>

								<div class="service-actions">
									<button
										class="btn btn-outline btn-sm"
										onclick={() => { editingId = service.id; showCreateForm = false; }}
									>
										Edytuj
									</button>

									<form method="POST" action="?/deleteService" use:enhance>
										<input type="hidden" name="serviceId" value={service.id} />
										<button
											type="submit"
											class="btn btn-ghost btn-sm danger"
											onclick={(e) => { if (!confirm('Usunąć usługę?')) e.preventDefault(); }}
										>
											Usuń
										</button>
									</form>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
.dash-page {
	padding: var(--space-8);
	max-width: 900px;
}

.dash-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: var(--space-6);
	gap: var(--space-4);
}

.alert-error {
	background: #fef2f2;
	border: 1px solid #fca5a5;
	color: var(--c-error);
	padding: var(--space-3) var(--space-4);
	border-radius: var(--radius-md);
	margin-bottom: var(--space-4);
	font-size: 0.875rem;
}

.form-panel {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	padding: var(--space-6);
	margin-bottom: var(--space-6);
}

.form-title {
	font-family: var(--font-display);
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--c-charcoal);
	margin-bottom: var(--space-5);
}

.form-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-4);
	margin-bottom: var(--space-5);
}

.span-2 { grid-column: span 2; }

.field { display: flex; flex-direction: column; gap: var(--space-2); }

.field label {
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--c-charcoal);
}

.checkbox-label {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--c-charcoal);
	cursor: pointer;
}

.inline-checks {
	flex-direction: row;
	gap: var(--space-6);
}

.form-actions {
	display: flex;
	gap: var(--space-3);
}

.empty-state {
	text-align: center;
	padding: var(--space-16) 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--space-4);
}

.empty-icon {
	font-size: 2.5rem;
	color: var(--c-rose);
	opacity: 0.4;
}

.services-list {
	display: flex;
	flex-direction: column;
	gap: var(--space-8);
}

.category-group {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
}

.category-heading {
	font-size: 0.75rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--c-muted);
	padding-bottom: var(--space-2);
	border-bottom: 1px solid var(--c-border);
	margin-bottom: var(--space-1);
}

.service-row {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-md);
	padding: var(--space-4) var(--space-5);
	display: flex;
	align-items: center;
	gap: var(--space-4);
	transition: border-color var(--transition);
}

.service-row:hover { border-color: var(--c-border-dark); }
.service-row.inactive { opacity: 0.6; }

.service-info {
	flex: 1;
	min-width: 0;
}

.service-main {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	flex-wrap: wrap;
	margin-bottom: var(--space-1);
}

.service-name {
	font-weight: 600;
	color: var(--c-charcoal);
	font-size: 0.9375rem;
}

.service-meta {
	display: flex;
	gap: var(--space-4);
}

.meta-item {
	font-size: 0.875rem;
	color: var(--c-muted);
}

.meta-item.price {
	color: var(--c-charcoal);
	font-weight: 500;
}

.service-actions {
	display: flex;
	gap: var(--space-2);
	flex-shrink: 0;
}

.service-actions form { display: contents; }

.btn.danger { color: var(--c-error); }
.btn.danger:hover { background: #fef2f2; }

.edit-panel {
	width: 100%;
}

@media (max-width: 640px) {
	.form-grid { grid-template-columns: 1fr; }
	.span-2 { grid-column: span 1; }
	.inline-checks { flex-direction: column; gap: var(--space-3); }
}
</style>

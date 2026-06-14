<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
</script>

<svelte:head><title>Nowy salon — BeautyKatalog</title></svelte:head>

<div class="dash-page">
	<div class="dash-header">
		<div>
			<a href="/dashboard/salon" class="back-link">← Moje salony</a>
			<h1 class="display-md">Nowy salon</h1>
		</div>
	</div>

	{#if form?.error}
		<div class="alert alert-error">
			{form.error}
		</div>
	{/if}

	<div class="form-card">
		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
		>
			<div class="form-section">
				<h2 class="section-title">Podstawowe informacje</h2>

				<div class="field">
					<label for="name" class="field-label">Nazwa salonu <span class="required">*</span></label>
					<input
						type="text"
						id="name"
						name="name"
						class="field-input"
						value={form?.values?.name ?? ''}
						placeholder="np. Studio Urody Magda"
						required
						minlength="2"
					/>
				</div>

				<div class="field">
					<label for="short_description" class="field-label">Krótki opis</label>
					<textarea
						id="short_description"
						name="short_description"
						class="field-input"
						rows="3"
						placeholder="Krótki opis salonu widoczny w katalogu (max. 200 znaków)"
						maxlength="200"
					>{form?.values?.short_description ?? ''}</textarea>
				</div>
			</div>

			<div class="form-section">
				<h2 class="section-title">Lokalizacja</h2>

				<div class="field">
					<label for="city" class="field-label">Miasto <span class="required">*</span></label>
					<input
						type="text"
						id="city"
						name="city"
						class="field-input"
						value={form?.values?.city ?? ''}
						placeholder="np. Warszawa"
						required
					/>
				</div>

				<div class="field-row">
					<div class="field">
						<label for="address_line" class="field-label">Ulica i numer</label>
						<input
							type="text"
							id="address_line"
							name="address_line"
							class="field-input"
							value={form?.values?.address_line ?? ''}
							placeholder="np. ul. Marszałkowska 1"
						/>
					</div>
					<div class="field field-narrow">
						<label for="postal_code" class="field-label">Kod pocztowy</label>
						<input
							type="text"
							id="postal_code"
							name="postal_code"
							class="field-input"
							value={form?.values?.postal_code ?? ''}
							placeholder="00-000"
						/>
					</div>
				</div>
			</div>

			<div class="form-section">
				<h2 class="section-title">Kontakt</h2>

				<div class="field-row">
					<div class="field">
						<label for="phone" class="field-label">Telefon</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							class="field-input"
							value={form?.values?.phone ?? ''}
							placeholder="+48 000 000 000"
						/>
					</div>
					<div class="field">
						<label for="email" class="field-label">E-mail</label>
						<input
							type="email"
							id="email"
							name="email"
							class="field-input"
							value={form?.values?.email ?? ''}
							placeholder="kontakt@salon.pl"
						/>
					</div>
				</div>
			</div>

			<div class="form-actions">
				<a href="/dashboard/salon" class="btn btn-ghost">Anuluj</a>
				<button type="submit" class="btn btn-primary" disabled={loading}>
					{loading ? 'Tworzę salon…' : 'Utwórz salon'}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
.dash-page {
	padding: var(--space-8) var(--space-8) var(--space-16);
	max-width: 720px;
}

.dash-header {
	margin-bottom: var(--space-8);
}

.back-link {
	font-size: 0.875rem;
	color: var(--c-muted);
	text-decoration: none;
	display: inline-block;
	margin-bottom: var(--space-2);
	transition: color var(--transition);
}

.back-link:hover { color: var(--c-charcoal); }

.alert {
	padding: var(--space-4) var(--space-5);
	border-radius: var(--radius-md);
	font-size: 0.9rem;
	margin-bottom: var(--space-6);
}

.alert-error {
	background: #fef2f2;
	color: #dc2626;
	border: 1px solid #fecaca;
}

.form-card {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	padding: var(--space-8);
}

.form-section {
	margin-bottom: var(--space-8);
}

.form-section:last-child { margin-bottom: 0; }

.section-title {
	font-family: var(--font-display);
	font-size: 1rem;
	font-weight: 600;
	color: var(--c-charcoal);
	margin-bottom: var(--space-5);
	padding-bottom: var(--space-3);
	border-bottom: 1px solid var(--c-border);
}

.field {
	margin-bottom: var(--space-5);
}

.field:last-child { margin-bottom: 0; }

.field-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-4);
	margin-bottom: var(--space-5);
}

.field-narrow { max-width: 180px; }

.field-label {
	display: block;
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--c-charcoal);
	margin-bottom: var(--space-2);
}

.required { color: var(--c-rose); }

.field-input {
	width: 100%;
	padding: var(--space-3) var(--space-4);
	background: var(--c-bg);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-md);
	font-size: 0.9375rem;
	color: var(--c-charcoal);
	transition: border-color var(--transition), box-shadow var(--transition);
	box-sizing: border-box;
	font-family: inherit;
}

.field-input:focus {
	outline: none;
	border-color: var(--c-rose);
	box-shadow: 0 0 0 3px var(--c-rose-light);
}

textarea.field-input { resize: vertical; }

.form-actions {
	display: flex;
	justify-content: flex-end;
	gap: var(--space-3);
	margin-top: var(--space-8);
	padding-top: var(--space-6);
	border-top: 1px solid var(--c-border);
}
</style>

<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let loadingBasic = $state(false);
	let loadingBooking = $state(false);
	let loadingPublish = $state(false);

	const salon = $derived(data.salon);
</script>

<svelte:head><title>Edytuj salon — {salon.name} — BeautyKatalog</title></svelte:head>

<div class="dash-page">
	<div class="dash-header">
		<div>
			<h1 class="display-md">{salon.name}</h1>
			<p class="text-muted text-sm">{salon.city ?? ''}</p>
		</div>
		<div class="header-actions">
			{#if salon.status === 'draft'}
				<form
					method="POST"
					action="?/publish"
					use:enhance={() => {
						loadingPublish = true;
						return async ({ update }) => {
							loadingPublish = false;
							await update({ reset: false });
						};
					}}
				>
					<button type="submit" class="btn btn-primary" disabled={loadingPublish}>
						{loadingPublish ? 'Publikuję…' : 'Opublikuj salon'}
					</button>
				</form>
			{:else if salon.status === 'published'}
				<span class="badge badge-rose">Opublikowany</span>
			{:else if salon.status === 'suspended'}
				<span class="badge badge-surface">Zawieszony</span>
			{/if}
			<a href="/salon/{salon.slug}" target="_blank" class="btn btn-outline btn-sm">Podgląd ↗</a>
		</div>
	</div>

	{#if form?.action === 'publish' && form?.success}
		<div class="alert alert-success">Salon został opublikowany.</div>
	{/if}

	{#if form?.action === 'publish' && form?.error}
		<div class="alert alert-error">{form.error}</div>
	{/if}

	<div class="sections">
		<section class="form-card">
			<h2 class="card-title">Informacje podstawowe</h2>

			{#if form?.action === 'updateBasic' && form?.success}
				<div class="alert alert-success">Zmiany zostały zapisane.</div>
			{/if}
			{#if form?.action === 'updateBasic' && form?.error}
				<div class="alert alert-error">{form.error}</div>
			{/if}

			<form
				method="POST"
				action="?/updateBasic"
				use:enhance={() => {
					loadingBasic = true;
					return async ({ update }) => {
						loadingBasic = false;
						await update({ reset: false });
					};
				}}
			>
				<div class="field">
					<label for="name" class="field-label">Nazwa salonu <span class="required">*</span></label>
					<input
						type="text"
						id="name"
						name="name"
						class="field-input"
						value={form?.action === 'updateBasic' ? (form?.values?.name ?? salon.name) : salon.name}
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
						rows="2"
						maxlength="200"
						placeholder="Krótki opis widoczny w katalogu"
					>{form?.action === 'updateBasic' ? (form?.values?.short_description ?? salon.short_description ?? '') : (salon.short_description ?? '')}</textarea>
				</div>

				<div class="field">
					<label for="description" class="field-label">Pełny opis</label>
					<textarea
						id="description"
						name="description"
						class="field-input"
						rows="5"
						placeholder="Szczegółowy opis salonu"
					>{form?.action === 'updateBasic' ? (form?.values?.description ?? salon.description ?? '') : (salon.description ?? '')}</textarea>
				</div>

				<div class="field-row">
					<div class="field">
						<label for="city" class="field-label">Miasto <span class="required">*</span></label>
						<input
							type="text"
							id="city"
							name="city"
							class="field-input"
							value={form?.action === 'updateBasic' ? (form?.values?.city ?? salon.city ?? '') : (salon.city ?? '')}
							required
						/>
					</div>
					<div class="field">
						<label for="postal_code" class="field-label">Kod pocztowy</label>
						<input
							type="text"
							id="postal_code"
							name="postal_code"
							class="field-input"
							value={form?.action === 'updateBasic' ? (form?.values?.postal_code ?? salon.postal_code ?? '') : (salon.postal_code ?? '')}
							placeholder="00-000"
						/>
					</div>
				</div>

				<div class="field">
					<label for="address_line" class="field-label">Ulica i numer</label>
					<input
						type="text"
						id="address_line"
						name="address_line"
						class="field-input"
						value={form?.action === 'updateBasic' ? (form?.values?.address_line ?? salon.address_line ?? '') : (salon.address_line ?? '')}
						placeholder="np. ul. Marszałkowska 1"
					/>
				</div>

				<div class="field-row">
					<div class="field">
						<label for="phone" class="field-label">Telefon</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							class="field-input"
							value={form?.action === 'updateBasic' ? (form?.values?.phone ?? salon.phone ?? '') : (salon.phone ?? '')}
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
							value={form?.action === 'updateBasic' ? (form?.values?.email ?? salon.email ?? '') : (salon.email ?? '')}
							placeholder="kontakt@salon.pl"
						/>
					</div>
				</div>

				<div class="field">
					<label for="website_url" class="field-label">Strona internetowa</label>
					<input
						type="url"
						id="website_url"
						name="website_url"
						class="field-input"
						value={form?.action === 'updateBasic' ? (form?.values?.website_url ?? salon.website_url ?? '') : (salon.website_url ?? '')}
						placeholder="https://www.salon.pl"
					/>
				</div>

				<div class="field-row">
					<div class="field">
						<label for="facebook_url" class="field-label">Facebook</label>
						<input
							type="url"
							id="facebook_url"
							name="facebook_url"
							class="field-input"
							value={form?.action === 'updateBasic' ? (form?.values?.facebook_url ?? salon.facebook_url ?? '') : (salon.facebook_url ?? '')}
							placeholder="https://facebook.com/..."
						/>
					</div>
					<div class="field">
						<label for="instagram_url" class="field-label">Instagram</label>
						<input
							type="url"
							id="instagram_url"
							name="instagram_url"
							class="field-input"
							value={form?.action === 'updateBasic' ? (form?.values?.instagram_url ?? salon.instagram_url ?? '') : (salon.instagram_url ?? '')}
							placeholder="https://instagram.com/..."
						/>
					</div>
				</div>

				<div class="field-row">
					<div class="field">
						<label for="tiktok_url" class="field-label">TikTok</label>
						<input
							type="url"
							id="tiktok_url"
							name="tiktok_url"
							class="field-input"
							value={form?.action === 'updateBasic' ? (form?.values?.tiktok_url ?? salon.tiktok_url ?? '') : (salon.tiktok_url ?? '')}
							placeholder="https://tiktok.com/@..."
						/>
					</div>
					<div class="field">
						<label for="nip" class="field-label">NIP</label>
						<input
							type="text"
							id="nip"
							name="nip"
							class="field-input"
							value={form?.action === 'updateBasic' ? (form?.values?.nip ?? salon.nip ?? '') : (salon.nip ?? '')}
							placeholder="000-000-00-00"
						/>
					</div>
				</div>

				<div class="form-actions">
					<button type="submit" class="btn btn-primary" disabled={loadingBasic}>
						{loadingBasic ? 'Zapisuję…' : 'Zapisz zmiany'}
					</button>
				</div>
			</form>
		</section>

		<section class="form-card">
			<h2 class="card-title">Ustawienia rezerwacji</h2>

			{#if form?.action === 'updateBooking' && form?.success}
				<div class="alert alert-success">Ustawienia rezerwacji zostały zapisane.</div>
			{/if}
			{#if form?.action === 'updateBooking' && form?.error}
				<div class="alert alert-error">{form.error}</div>
			{/if}

			<form
				method="POST"
				action="?/updateBooking"
				use:enhance={() => {
					loadingBooking = true;
					return async ({ update }) => {
						loadingBooking = false;
						await update({ reset: false });
					};
				}}
			>
				<div class="field toggle-field">
					<label class="toggle-label">
						<div class="toggle-text">
							<span class="field-label" style="margin-bottom:0">Rezerwacje online</span>
							<span class="text-sm text-muted">Klienci mogą rezerwować wizyty przez katalog</span>
						</div>
						<input
							type="checkbox"
							name="booking_enabled"
							class="toggle-input"
							checked={salon.booking_enabled}
						/>
						<span class="toggle-switch"></span>
					</label>
				</div>

				<div class="field toggle-field">
					<label class="toggle-label">
						<div class="toggle-text">
							<span class="field-label" style="margin-bottom:0">Automatyczne potwierdzanie</span>
							<span class="text-sm text-muted">Wizyty są potwierdzane natychmiast bez Twojej akceptacji</span>
						</div>
						<input
							type="checkbox"
							name="booking_auto_confirm"
							class="toggle-input"
							checked={salon.booking_auto_confirm}
						/>
						<span class="toggle-switch"></span>
					</label>
				</div>

				<div class="field-row">
					<div class="field">
						<label for="booking_slot_min" class="field-label">Długość slotu (minuty)</label>
						<input
							type="number"
							id="booking_slot_min"
							name="booking_slot_min"
							class="field-input"
							value={salon.booking_slot_min ?? 30}
							min="5"
							max="240"
							step="5"
						/>
					</div>
					<div class="field">
						<label for="booking_advance_hours_min" class="field-label">Min. wyprzedzenie (godziny)</label>
						<input
							type="number"
							id="booking_advance_hours_min"
							name="booking_advance_hours_min"
							class="field-input"
							value={salon.booking_advance_hours_min ?? 0}
							min="0"
							max="168"
						/>
					</div>
					<div class="field">
						<label for="booking_advance_days_max" class="field-label">Max. dni do przodu</label>
						<input
							type="number"
							id="booking_advance_days_max"
							name="booking_advance_days_max"
							class="field-input"
							value={salon.booking_advance_days_max ?? 60}
							min="1"
							max="365"
						/>
					</div>
				</div>

				<div class="form-actions">
					<button type="submit" class="btn btn-primary" disabled={loadingBooking}>
						{loadingBooking ? 'Zapisuję…' : 'Zapisz ustawienia'}
					</button>
				</div>
			</form>
		</section>
	</div>
</div>

<style>
.dash-page {
	padding: var(--space-8) var(--space-8) var(--space-16);
	max-width: 800px;
}

.dash-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: var(--space-8);
	gap: var(--space-4);
}

.header-actions {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	flex-shrink: 0;
	padding-top: var(--space-2);
}

.alert {
	padding: var(--space-4) var(--space-5);
	border-radius: var(--radius-md);
	font-size: 0.9rem;
	margin-bottom: var(--space-6);
}

.alert-success {
	background: #f0fdf4;
	color: #16a34a;
	border: 1px solid #bbf7d0;
}

.alert-error {
	background: #fef2f2;
	color: #dc2626;
	border: 1px solid #fecaca;
}

.sections {
	display: flex;
	flex-direction: column;
	gap: var(--space-6);
}

.form-card {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	padding: var(--space-8);
}

.card-title {
	font-family: var(--font-display);
	font-size: 1.0625rem;
	font-weight: 600;
	color: var(--c-charcoal);
	margin-bottom: var(--space-6);
	padding-bottom: var(--space-4);
	border-bottom: 1px solid var(--c-border);
}

.field {
	margin-bottom: var(--space-5);
}

.field-row {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	gap: var(--space-4);
	margin-bottom: var(--space-5);
}

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

.toggle-field {
	border: 1px solid var(--c-border);
	border-radius: var(--radius-md);
	padding: var(--space-4) var(--space-5);
	background: var(--c-bg);
}

.toggle-label {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-4);
	cursor: pointer;
	user-select: none;
}

.toggle-text {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.toggle-input {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
}

.toggle-switch {
	position: relative;
	width: 44px;
	height: 24px;
	background: var(--c-border);
	border-radius: 12px;
	flex-shrink: 0;
	transition: background var(--transition);
}

.toggle-switch::after {
	content: '';
	position: absolute;
	top: 3px;
	left: 3px;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	background: white;
	box-shadow: 0 1px 3px rgba(0,0,0,.2);
	transition: transform var(--transition);
}

.toggle-input:checked + .toggle-switch {
	background: var(--c-rose);
}

.toggle-input:checked + .toggle-switch::after {
	transform: translateX(20px);
}

.form-actions {
	display: flex;
	justify-content: flex-end;
	margin-top: var(--space-6);
	padding-top: var(--space-5);
	border-top: 1px solid var(--c-border);
}
</style>

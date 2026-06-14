<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { DAY_NAMES_FULL } from '$lib/types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type HourRow = {
		day_of_week: number;
		is_open: boolean;
		open_time: string;
		close_time: string;
	};

	let hours = $state<HourRow[]>(
		Array.from({ length: 7 }, (_, i) => {
			const day = i + 1;
			const existing = data.workingHours.find((h: any) => h.day_of_week === day);
			return {
				day_of_week: day,
				is_open: existing?.is_open ?? false,
				open_time: existing?.open_time ?? '09:00',
				close_time: existing?.close_time ?? '18:00'
			};
		})
	);

	let deleteConfirm = $state('');
	let savingHours = $state(false);
</script>

<svelte:head><title>Ustawienia — {data.salon.name}</title></svelte:head>

<div class="page">
	<div class="page-header">
		<h1 class="display-md">Ustawienia</h1>
	</div>

	{#if form?.hoursSaved}
		<div class="alert-success">Godziny otwarcia zostały zapisane.</div>
	{/if}
	{#if form?.hoursError}
		<div class="alert-error">{form.hoursError}</div>
	{/if}

	<section class="section-card">
		<h2 class="section-title">Godziny otwarcia</h2>
		<p class="text-sm text-muted" style="margin-bottom:var(--space-5)">
			Ustaw godziny otwarcia salonu. Pracownicy mogą mieć osobne grafiki.
		</p>

		<form
			method="POST"
			action="?/saveHours"
			use:enhance={() => {
				savingHours = true;
				return async ({ update }) => {
					savingHours = false;
					await update();
				};
			}}
		>
			<div class="hours-table">
				<div class="hours-header">
					<span>Dzień</span>
					<span>Otwarte</span>
					<span>Od</span>
					<span>Do</span>
				</div>
				{#each hours as row, i}
					<div class="hours-row">
						<span class="day-name">{DAY_NAMES_FULL[row.day_of_week]}</span>
						<label class="toggle">
							<input
								type="checkbox"
								name="is_open_{row.day_of_week}"
								bind:checked={row.is_open}
							/>
							<span class="toggle-slider"></span>
						</label>
						<input
							type="time"
							class="input input-sm"
							name="open_time_{row.day_of_week}"
							bind:value={row.open_time}
							disabled={!row.is_open}
						/>
						<input
							type="time"
							class="input input-sm"
							name="close_time_{row.day_of_week}"
							bind:value={row.close_time}
							disabled={!row.is_open}
						/>
					</div>
				{/each}
			</div>

			<button class="btn btn-primary" type="submit" disabled={savingHours}>
				{savingHours ? 'Zapisywanie…' : 'Zapisz godziny'}
			</button>
		</form>
	</section>

	<section class="section-card danger-zone">
		<h2 class="section-title danger-title">Strefa niebezpieczna</h2>
		<p class="text-sm text-muted" style="margin-bottom:var(--space-5)">
			Zawieszenie salonu sprawi, że strona salonu stanie się niedostępna publicznie.
			Aby potwierdzić, wpisz <strong>DELETE</strong> w polu poniżej.
		</p>

		{#if form?.deleteError}
			<div class="alert-error" style="margin-bottom:var(--space-4)">{form.deleteError}</div>
		{/if}

		<form
			method="POST"
			action="?/deleteSalon"
			use:enhance
		>
			<div class="field" style="max-width:320px; margin-bottom:var(--space-4)">
				<label for="confirm-input">Potwierdzenie</label>
				<input
					id="confirm-input"
					class="input"
					name="confirm"
					type="text"
					placeholder="Wpisz DELETE"
					bind:value={deleteConfirm}
					autocomplete="off"
				/>
			</div>
			<button
				class="btn btn-danger"
				type="submit"
				disabled={deleteConfirm !== 'DELETE'}
				onclick={(e) => {
					if (!confirm('Czy na pewno chcesz zawiesić salon? Tej akcji nie można cofnąć.')) {
						e.preventDefault();
					}
				}}
			>
				Zawieś salon
			</button>
		</form>
	</section>
</div>

<style>
.page {
	padding: var(--space-8);
	max-width: 720px;
}

.page-header {
	margin-bottom: var(--space-6);
}

.alert-success {
	background: #F0FDF4;
	color: var(--c-success);
	border: 1px solid #BBF7D0;
	border-radius: var(--radius-md);
	padding: var(--space-3) var(--space-4);
	margin-bottom: var(--space-4);
	font-size: 0.875rem;
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

.section-card {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	padding: var(--space-6);
	margin-bottom: var(--space-6);
}

.section-title {
	font-family: var(--font-display);
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--c-charcoal);
	margin-bottom: var(--space-2);
}

.danger-zone {
	border-color: #FECACA;
}

.danger-title {
	color: var(--c-error);
}

.hours-table {
	margin-bottom: var(--space-5);
}

.hours-header {
	display: grid;
	grid-template-columns: 140px 80px 120px 120px;
	gap: var(--space-3);
	padding-bottom: var(--space-2);
	border-bottom: 1px solid var(--c-border);
	margin-bottom: var(--space-3);
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--c-muted);
	text-transform: uppercase;
	letter-spacing: .05em;
}

.hours-row {
	display: grid;
	grid-template-columns: 140px 80px 120px 120px;
	gap: var(--space-3);
	align-items: center;
	padding: var(--space-2) 0;
	border-bottom: 1px solid var(--c-border);
}

.hours-row:last-child { border-bottom: none; }

.day-name {
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--c-charcoal);
}

.input-sm {
	padding: var(--space-2) var(--space-3);
	font-size: 0.875rem;
}

.input:disabled {
	opacity: .45;
	cursor: not-allowed;
}

.toggle {
	position: relative;
	display: inline-block;
	width: 40px;
	height: 22px;
	cursor: pointer;
}

.toggle input {
	opacity: 0;
	width: 0;
	height: 0;
	position: absolute;
}

.toggle-slider {
	position: absolute;
	inset: 0;
	background: var(--c-border-dark);
	border-radius: var(--radius-full);
	transition: background var(--transition);
}

.toggle-slider::before {
	content: '';
	position: absolute;
	width: 16px;
	height: 16px;
	left: 3px;
	top: 3px;
	background: #fff;
	border-radius: 50%;
	transition: transform var(--transition);
}

.toggle input:checked + .toggle-slider { background: var(--c-rose); }
.toggle input:checked + .toggle-slider::before { transform: translateX(18px); }

.btn-danger {
	background: var(--c-error);
	color: #fff;
	border: none;
	border-radius: var(--radius-full);
	padding: var(--space-3) var(--space-6);
	font-size: 0.9375rem;
	font-weight: 500;
	cursor: pointer;
	transition: background var(--transition), transform var(--transition);
	display: inline-flex;
	align-items: center;
}

.btn-danger:hover:not(:disabled) { background: #9B1C1C; transform: translateY(-1px); }
.btn-danger:disabled { opacity: .45; cursor: not-allowed; transform: none; }

@media (max-width: 560px) {
	.hours-header,
	.hours-row {
		grid-template-columns: 1fr 56px 100px 100px;
		gap: var(--space-2);
	}
}
</style>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const STATUS_LABELS: Record<string, string> = {
		pending: 'Oczekująca',
		confirmed: 'Potwierdzona',
		cancelled: 'Anulowana',
		completed: 'Zakończona',
		no_show: 'Nieobecność'
	};

	const STATUS_CLASSES: Record<string, string> = {
		pending: 'status-pending',
		confirmed: 'status-confirmed',
		cancelled: 'status-cancelled',
		completed: 'status-completed',
		no_show: 'status-noshow'
	};

	const DAY_NAMES_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

	let weekStart = $derived(new Date(data.weekStart + 'T00:00:00Z'));

	let weekDays = $derived(
		Array.from({ length: 7 }, (_, i) => {
			const d = new Date(weekStart);
			d.setUTCDate(weekStart.getUTCDate() + i);
			return d;
		})
	);

	function formatWeekLabel(date: Date): string {
		return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
	}

	function prevWeek() {
		const d = new Date(weekStart);
		d.setUTCDate(d.getUTCDate() - 7);
		goto(`?week=${d.toISOString().slice(0, 10)}`);
	}

	function nextWeek() {
		const d = new Date(weekStart);
		d.setUTCDate(d.getUTCDate() + 7);
		goto(`?week=${d.toISOString().slice(0, 10)}`);
	}

	function goToday() {
		goto(`?week=${getMonday(new Date())}`);
	}

	function getMonday(date: Date): string {
		const d = new Date(date);
		const day = d.getDay();
		const diff = day === 0 ? -6 : 1 - day;
		d.setDate(d.getDate() + diff);
		return d.toISOString().slice(0, 10);
	}

	let selectedStaffId = $state('');

	let filteredAppointments = $derived(
		selectedStaffId
			? data.appointments.filter((a: any) => a.staff?.id === selectedStaffId)
			: data.appointments
	);

	function appointmentsForDay(dayDate: Date) {
		const iso = dayDate.toISOString().slice(0, 10);
		return filteredAppointments.filter((a: any) => a.starts_at.slice(0, 10) === iso);
	}

	function formatTime(iso: string): string {
		return new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
	}

	let selectedAppointment = $state<any>(null);
	let showNewForm = $state(false);

	function openDetail(apt: any) {
		selectedAppointment = apt;
	}

	function closeDetail() {
		selectedAppointment = null;
	}

	let newForm = $state({
		client_name: '',
		client_email: '',
		client_phone: '',
		staff_id: '',
		service_id: '',
		starts_at: '',
		duration_min: '60',
		notes: ''
	});
</script>

<svelte:head><title>Kalendarz — {data.salon.name}</title></svelte:head>

<div class="page">
	<div class="page-header">
		<h1 class="display-md">Kalendarz</h1>
		<button class="btn btn-primary btn-sm" onclick={() => (showNewForm = true)}>+ Nowa wizyta</button>
	</div>

	{#if form?.error}
		<div class="alert-error">{form.error}</div>
	{/if}

	<div class="week-nav">
		<button class="btn btn-outline btn-sm" onclick={prevWeek}>&#8592; Poprzedni</button>
		<div class="week-label">
			{formatWeekLabel(weekDays[0])} – {formatWeekLabel(weekDays[6])}
		</div>
		<button class="btn btn-outline btn-sm" onclick={goToday}>Dziś</button>
		<button class="btn btn-outline btn-sm" onclick={nextWeek}>Następny &#8594;</button>
	</div>

	{#if data.staff.length > 0}
		<div class="staff-filter">
			<span class="filter-label">Filtruj:</span>
			<button
				class="filter-btn"
				class:active={selectedStaffId === ''}
				onclick={() => (selectedStaffId = '')}
			>
				Wszyscy
			</button>
			{#each data.staff as s}
				<button
					class="filter-btn"
					class:active={selectedStaffId === s.id}
					onclick={() => (selectedStaffId = s.id)}
					style="--dot-color: {s.calendar_color}"
				>
					<span class="color-dot"></span>{s.name}
				</button>
			{/each}
		</div>
	{/if}

	<div class="week-grid">
		{#each weekDays as day, i}
			<div class="day-col">
				<div class="day-header">
					<span class="day-name">{DAY_NAMES_SHORT[i]}</span>
					<span class="day-date">{day.getUTCDate().toString().padStart(2, '0')}.{(day.getUTCMonth() + 1).toString().padStart(2, '0')}</span>
				</div>
				<div class="day-body">
					{#each appointmentsForDay(day) as apt}
						<button
							class="apt-block"
							style="border-left-color: {apt.staff?.calendar_color ?? '#C8A0A2'}"
							onclick={() => openDetail(apt)}
						>
							<div class="apt-time">{formatTime(apt.starts_at)} – {formatTime(apt.ends_at)}</div>
							<div class="apt-client">{apt.client_name}</div>
							{#if apt.service}
								<div class="apt-service">{apt.service.name}</div>
							{/if}
							<span class="apt-status {STATUS_CLASSES[apt.status] ?? ''}">{STATUS_LABELS[apt.status] ?? apt.status}</span>
						</button>
					{:else}
						<div class="day-empty">–</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

{#if selectedAppointment}
	<div class="overlay" role="dialog" aria-modal="true">
		<div class="detail-panel">
			<div class="panel-header">
				<h2 class="display-sm">Szczegóły wizyty</h2>
				<button class="btn btn-ghost btn-sm" onclick={closeDetail}>✕</button>
			</div>

			<dl class="detail-list">
				<dt>Klient</dt><dd>{selectedAppointment.client_name}</dd>
				{#if selectedAppointment.client_phone}<dt>Telefon</dt><dd>{selectedAppointment.client_phone}</dd>{/if}
				{#if selectedAppointment.client_email}<dt>E-mail</dt><dd>{selectedAppointment.client_email}</dd>{/if}
				{#if selectedAppointment.service}<dt>Usługa</dt><dd>{selectedAppointment.service.name}</dd>{/if}
				{#if selectedAppointment.staff}<dt>Pracownik</dt><dd>{selectedAppointment.staff.name}</dd>{/if}
				<dt>Termin</dt>
				<dd>{formatTime(selectedAppointment.starts_at)} – {formatTime(selectedAppointment.ends_at)}</dd>
				<dt>Status</dt><dd>{STATUS_LABELS[selectedAppointment.status] ?? selectedAppointment.status}</dd>
				{#if selectedAppointment.notes}<dt>Notatki</dt><dd>{selectedAppointment.notes}</dd>{/if}
			</dl>

			<div class="panel-actions">
				{#if selectedAppointment.status === 'pending'}
					<form method="POST" action="?/updateStatus" use:enhance={() => { closeDetail(); return async ({ update }) => update(); }}>
						<input type="hidden" name="appointmentId" value={selectedAppointment.id} />
						<input type="hidden" name="status" value="confirmed" />
						<button class="btn btn-primary btn-sm" type="submit">Potwierdź</button>
					</form>
				{/if}
				{#if selectedAppointment.status === 'confirmed'}
					<form method="POST" action="?/updateStatus" use:enhance={() => { closeDetail(); return async ({ update }) => update(); }}>
						<input type="hidden" name="appointmentId" value={selectedAppointment.id} />
						<input type="hidden" name="status" value="completed" />
						<button class="btn btn-primary btn-sm" type="submit">Zakończ</button>
					</form>
				{/if}
				{#if selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed'}
					<form method="POST" action="?/updateStatus" use:enhance={() => { closeDetail(); return async ({ update }) => update(); }}>
						<input type="hidden" name="appointmentId" value={selectedAppointment.id} />
						<input type="hidden" name="status" value="cancelled" />
						<button class="btn btn-outline btn-sm" type="submit">Anuluj wizytę</button>
					</form>
				{/if}
				<button class="btn btn-ghost btn-sm" onclick={closeDetail}>Zamknij</button>
			</div>
		</div>
	</div>
{/if}

{#if showNewForm}
	<div class="overlay" role="dialog" aria-modal="true">
		<div class="detail-panel">
			<div class="panel-header">
				<h2 class="display-sm">Nowa wizyta</h2>
				<button class="btn btn-ghost btn-sm" onclick={() => (showNewForm = false)}>✕</button>
			</div>

			<form
				method="POST"
				action="?/createAppointment"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') showNewForm = false;
						await update();
					};
				}}
			>
				<div class="form-grid">
					<div class="field">
						<label for="cn">Imię i nazwisko klienta *</label>
						<input id="cn" class="input" name="client_name" bind:value={newForm.client_name} required />
					</div>
					<div class="field">
						<label for="cp">Telefon</label>
						<input id="cp" class="input" name="client_phone" type="tel" bind:value={newForm.client_phone} />
					</div>
					<div class="field">
						<label for="ce">E-mail</label>
						<input id="ce" class="input" name="client_email" type="email" bind:value={newForm.client_email} />
					</div>
					<div class="field">
						<label for="sat">Data i godzina *</label>
						<input id="sat" class="input" name="starts_at" type="datetime-local" bind:value={newForm.starts_at} required />
					</div>
					<div class="field">
						<label for="dur">Czas trwania (min)</label>
						<input id="dur" class="input" name="duration_min" type="number" min="5" step="5" bind:value={newForm.duration_min} />
					</div>
					{#if data.staff.length > 0}
						<div class="field">
							<label for="stf">Pracownik</label>
							<select id="stf" class="input" name="staff_id" bind:value={newForm.staff_id}>
								<option value="">— brak —</option>
								{#each data.staff as s}
									<option value={s.id}>{s.name}</option>
								{/each}
							</select>
						</div>
					{/if}
					{#if data.services.length > 0}
						<div class="field">
							<label for="svc">Usługa</label>
							<select id="svc" class="input" name="service_id" bind:value={newForm.service_id}>
								<option value="">— brak —</option>
								{#each data.services as s}
									<option value={s.id}>{s.name}</option>
								{/each}
							</select>
						</div>
					{/if}
					<div class="field span-2">
						<label for="nt">Notatki</label>
						<textarea id="nt" class="input" name="notes" rows="2" bind:value={newForm.notes}></textarea>
					</div>
				</div>

				<div class="panel-actions">
					<button class="btn btn-primary" type="submit">Dodaj wizytę</button>
					<button class="btn btn-ghost" type="button" onclick={() => (showNewForm = false)}>Anuluj</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
.page {
	padding: var(--space-8);
	max-width: 1200px;
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

.week-nav {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	margin-bottom: var(--space-4);
	flex-wrap: wrap;
}

.week-label {
	font-weight: 600;
	color: var(--c-charcoal);
	flex: 1;
	text-align: center;
}

.staff-filter {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	flex-wrap: wrap;
	margin-bottom: var(--space-5);
}

.filter-label {
	font-size: 0.875rem;
	color: var(--c-muted);
	font-weight: 500;
}

.filter-btn {
	display: inline-flex;
	align-items: center;
	gap: var(--space-2);
	padding: var(--space-1) var(--space-3);
	border-radius: var(--radius-full);
	border: 1.5px solid var(--c-border);
	background: var(--c-surface);
	font-size: 0.8125rem;
	font-weight: 500;
	color: var(--c-muted);
	cursor: pointer;
	transition: all var(--transition);
}

.filter-btn:hover { border-color: var(--c-rose); color: var(--c-rose-dark); }
.filter-btn.active { border-color: var(--c-rose); background: var(--c-rose-light); color: var(--c-rose-dark); }

.color-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: var(--dot-color, var(--c-rose));
	flex-shrink: 0;
}

.week-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: var(--space-3);
}

@media (max-width: 900px) {
	.week-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 600px) {
	.week-grid { grid-template-columns: 1fr; }
}

.day-col {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-md);
	overflow: hidden;
}

.day-header {
	background: var(--c-surface-2);
	padding: var(--space-2) var(--space-3);
	display: flex;
	align-items: center;
	gap: var(--space-2);
	border-bottom: 1px solid var(--c-border);
}

.day-name {
	font-weight: 700;
	font-size: 0.75rem;
	color: var(--c-charcoal);
	text-transform: uppercase;
	letter-spacing: .05em;
}

.day-date {
	font-size: 0.75rem;
	color: var(--c-muted);
}

.day-body {
	padding: var(--space-2);
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
	min-height: 80px;
}

.day-empty {
	color: var(--c-placeholder);
	font-size: 0.875rem;
	text-align: center;
	padding: var(--space-4) 0;
}

.apt-block {
	width: 100%;
	text-align: left;
	background: var(--c-surface-2);
	border: none;
	border-left: 3px solid var(--c-rose);
	border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
	padding: var(--space-2) var(--space-3);
	cursor: pointer;
	transition: background var(--transition);
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.apt-block:hover { background: var(--c-rose-light); }

.apt-time {
	font-size: 0.6875rem;
	color: var(--c-muted);
	font-weight: 500;
}

.apt-client {
	font-size: 0.8125rem;
	font-weight: 600;
	color: var(--c-charcoal);
}

.apt-service {
	font-size: 0.6875rem;
	color: var(--c-muted);
}

.apt-status {
	font-size: 0.625rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: .05em;
	border-radius: var(--radius-full);
	padding: 1px 6px;
	display: inline-flex;
	align-self: flex-start;
	margin-top: 2px;
}

.status-pending   { background: #FEF9C3; color: #854D0E; }
.status-confirmed { background: #DCFCE7; color: #166534; }
.status-cancelled { background: #FEE2E2; color: #991B1B; }
.status-completed { background: #E0E7FF; color: #3730A3; }
.status-noshow    { background: var(--c-surface-2); color: var(--c-muted); }

.overlay {
	position: fixed;
	inset: 0;
	background: rgba(42,40,37,.45);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
	padding: var(--space-4);
}

.detail-panel {
	background: var(--c-surface);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-xl);
	width: 100%;
	max-width: 480px;
	max-height: 90vh;
	overflow-y: auto;
	padding: var(--space-6);
}

.panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: var(--space-5);
}

.detail-list {
	display: grid;
	grid-template-columns: auto 1fr;
	gap: var(--space-2) var(--space-4);
	margin-bottom: var(--space-6);
}

.detail-list dt {
	font-size: 0.8125rem;
	font-weight: 600;
	color: var(--c-muted);
}

.detail-list dd {
	font-size: 0.875rem;
	color: var(--c-text);
}

.panel-actions {
	display: flex;
	gap: var(--space-2);
	flex-wrap: wrap;
	margin-top: var(--space-4);
}

.form-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-4);
	margin-bottom: var(--space-4);
}

.span-2 { grid-column: span 2; }

@media (max-width: 400px) {
	.form-grid { grid-template-columns: 1fr; }
	.span-2 { grid-column: span 1; }
}
</style>

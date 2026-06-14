<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showCreateForm = $state(false);
	let editingId = $state<string | null>(null);

	type StaffMember = typeof data.staff[number];

	function initial(name: string): string {
		return (name.trim()[0] ?? '?').toUpperCase();
	}

	function assignedServiceIds(staffId: string): string[] {
		return data.staffServices
			.filter((ss) => ss.staff_id === staffId)
			.map((ss) => ss.service_id);
	}
</script>

<svelte:head><title>Pracownicy — BeautyKatalog</title></svelte:head>

<div class="dash-page">
	<div class="dash-header">
		<h1 class="display-md">Pracownicy</h1>
		<button
			class="btn btn-primary"
			onclick={() => { showCreateForm = !showCreateForm; editingId = null; }}
		>
			{showCreateForm ? 'Anuluj' : '+ Dodaj pracownika'}
		</button>
	</div>

	{#if form?.error}
		<div class="alert-error">{form.error}</div>
	{/if}

	{#if showCreateForm}
		<div class="form-panel">
			<h2 class="form-title">Nowy pracownik</h2>
			<form
				method="POST"
				action="?/createStaff"
				use:enhance={() => {
					return ({ result, update }) => {
						if (result.type === 'success') showCreateForm = false;
						update();
					};
				}}
			>
				<div class="form-grid">
					<div class="field span-2">
						<label for="c-name">Imię i nazwisko *</label>
						<input id="c-name" class="input" name="name" required placeholder="np. Anna Kowalska" />
					</div>

					<div class="field">
						<label for="c-role">Stanowisko</label>
						<input id="c-role" class="input" name="role_label" placeholder="np. Kosmetyczka" />
					</div>

					<div class="field color-field">
						<label for="c-color">Kolor w kalendarzu</label>
						<div class="color-row">
							<input id="c-color" class="color-input" name="calendar_color" type="color" value="#6366f1" />
							<span class="color-hint text-sm text-muted">Kolor wizyty w kalendarzu</span>
						</div>
					</div>

					<div class="field span-2">
						<label for="c-bio">Bio</label>
						<textarea id="c-bio" class="input" name="bio" rows="3" placeholder="Krótki opis, specjalizacje..."></textarea>
					</div>
				</div>

				<div class="form-actions">
					<button type="submit" class="btn btn-primary">Dodaj pracownika</button>
					<button type="button" class="btn btn-ghost" onclick={() => showCreateForm = false}>Anuluj</button>
				</div>
			</form>
		</div>
	{/if}

	{#if data.staff.length === 0}
		<div class="empty-state">
			<div class="empty-icon">◈</div>
			<h2 class="display-sm">Brak pracowników</h2>
			<p class="text-muted">Dodaj członków zespołu, aby przypisać im usługi i wizyty.</p>
		</div>
	{:else}
		<div class="staff-grid">
			{#each data.staff as member (member.id)}
				<div class="staff-card" class:inactive={!member.is_active}>
					{#if editingId === member.id}
						<div class="edit-panel">
							<h3 class="form-title">Edytuj pracownika</h3>

							<form
								method="POST"
								action="?/updateStaff"
								use:enhance={() => {
									return ({ result, update }) => {
										if (result.type === 'success') editingId = null;
										update();
									};
								}}
							>
								<input type="hidden" name="staffId" value={member.id} />
								<div class="form-grid">
									<div class="field span-2">
										<label for="e-name-{member.id}">Imię i nazwisko *</label>
										<input id="e-name-{member.id}" class="input" name="name" required value={member.name} />
									</div>

									<div class="field">
										<label for="e-role-{member.id}">Stanowisko</label>
										<input id="e-role-{member.id}" class="input" name="role_label" value={member.role_label ?? ''} />
									</div>

									<div class="field color-field">
										<label for="e-color-{member.id}">Kolor kalendarza</label>
										<div class="color-row">
											<input
												id="e-color-{member.id}"
												class="color-input"
												name="calendar_color"
												type="color"
												value={member.calendar_color}
											/>
										</div>
									</div>

									<div class="field span-2">
										<label for="e-bio-{member.id}">Bio</label>
										<textarea id="e-bio-{member.id}" class="input" name="bio" rows="3">{member.bio ?? ''}</textarea>
									</div>

									<div class="field span-2">
										<label class="checkbox-label">
											<input type="checkbox" name="is_active" checked={member.is_active} />
											Aktywny pracownik
										</label>
									</div>
								</div>

								<div class="form-actions">
									<button type="submit" class="btn btn-primary btn-sm">Zapisz</button>
									<button type="button" class="btn btn-ghost btn-sm" onclick={() => editingId = null}>Anuluj</button>
								</div>
							</form>

							{#if data.services.length > 0}
								<div class="services-assign">
									<h4 class="assign-title">Przypisane usługi</h4>
									<form
										method="POST"
										action="?/updateStaffServices"
										use:enhance={() => {
											return ({ update }) => update();
										}}
									>
										<input type="hidden" name="staffId" value={member.id} />
										<div class="services-checkboxes">
											{#each data.services as svc}
												{@const cat = svc.service_categories as { name: string } | null}
												<label class="checkbox-label">
													<input
														type="checkbox"
														name="serviceIds"
														value={svc.id}
														checked={assignedServiceIds(member.id).includes(svc.id)}
													/>
													<span>
														{svc.name}
														{#if cat}<span class="text-xs text-muted"> — {cat.name}</span>{/if}
													</span>
												</label>
											{/each}
										</div>
										<div class="form-actions" style="margin-top: var(--space-3)">
											<button type="submit" class="btn btn-outline btn-sm">Zapisz usługi</button>
										</div>
									</form>
								</div>
							{/if}
						</div>
					{:else}
						<div class="card-top">
							<div class="avatar" style="background: {member.calendar_color}20; color: {member.calendar_color}">
								{initial(member.name)}
							</div>
							<div class="card-badges">
								{#if member.is_active}
									<span class="badge badge-rose">Aktywny</span>
								{:else}
									<span class="badge badge-surface">Nieaktywny</span>
								{/if}
							</div>
						</div>

						<div class="card-body">
							<div class="name-row">
								<span class="staff-color-dot" style="background: {member.calendar_color}" title="Kolor kalendarza"></span>
								<strong class="staff-name">{member.name}</strong>
							</div>
							{#if member.role_label}
								<p class="staff-role text-sm text-muted">{member.role_label}</p>
							{/if}
							{#if member.bio}
								<p class="staff-bio text-sm clamp-2">{member.bio}</p>
							{/if}
						</div>

						<div class="card-actions">
							<button
								class="btn btn-outline btn-sm"
								onclick={() => { editingId = member.id; showCreateForm = false; }}
							>
								Edytuj
							</button>

							<form method="POST" action="?/deleteStaff" use:enhance>
								<input type="hidden" name="staffId" value={member.id} />
								<button
									type="submit"
									class="btn btn-ghost btn-sm danger"
									onclick={(e) => { if (!confirm('Usunąć pracownika?')) e.preventDefault(); }}
								>
									Usuń
								</button>
							</form>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
.dash-page {
	padding: var(--space-8);
	max-width: 960px;
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

.color-field {}

.color-row {
	display: flex;
	align-items: center;
	gap: var(--space-3);
}

.color-input {
	width: 48px;
	height: 40px;
	border: 1.5px solid var(--c-border);
	border-radius: var(--radius-md);
	padding: 2px;
	cursor: pointer;
	background: var(--c-surface);
}

.color-hint { line-height: 1.4; }

.checkbox-label {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--c-charcoal);
	cursor: pointer;
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

.staff-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: var(--space-5);
}

.staff-card {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	padding: var(--space-5);
	display: flex;
	flex-direction: column;
	gap: var(--space-4);
	transition: border-color var(--transition), box-shadow var(--transition);
}

.staff-card:hover { border-color: var(--c-border-dark); box-shadow: var(--shadow-sm); }
.staff-card.inactive { opacity: 0.65; }

.card-top {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
}

.avatar {
	width: 52px;
	height: 52px;
	border-radius: var(--radius-full);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	font-size: 1.25rem;
	flex-shrink: 0;
}

.card-badges {
	display: flex;
	gap: var(--space-2);
	flex-wrap: wrap;
	justify-content: flex-end;
}

.card-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: var(--space-1);
}

.name-row {
	display: flex;
	align-items: center;
	gap: var(--space-2);
}

.staff-color-dot {
	width: 10px;
	height: 10px;
	border-radius: var(--radius-full);
	flex-shrink: 0;
}

.staff-name {
	font-size: 1rem;
	font-weight: 600;
	color: var(--c-charcoal);
}

.staff-role { margin-top: 2px; }

.staff-bio {
	color: var(--c-muted);
	margin-top: var(--space-2);
}

.card-actions {
	display: flex;
	gap: var(--space-2);
	padding-top: var(--space-3);
	border-top: 1px solid var(--c-border);
}

.card-actions form { display: contents; }

.btn.danger { color: var(--c-error); }
.btn.danger:hover { background: #fef2f2; }

.edit-panel {
	width: 100%;
}

.services-assign {
	margin-top: var(--space-5);
	padding-top: var(--space-5);
	border-top: 1px solid var(--c-border);
}

.assign-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--c-charcoal);
	margin-bottom: var(--space-3);
}

.services-checkboxes {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
	max-height: 240px;
	overflow-y: auto;
}

@media (max-width: 640px) {
	.form-grid { grid-template-columns: 1fr; }
	.span-2 { grid-column: span 1; }
	.staff-grid { grid-template-columns: 1fr; }
}
</style>

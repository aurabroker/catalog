<script lang="ts">
	import type { PageData } from './$types';
	import type { CatalogService } from '$lib/types';
	import { DAY_NAMES_FULL } from '$lib/types';

	let { data }: { data: PageData } = $props();
	const { salon, services, reviews, staff, hours, promotions, avgRating } = data;

	let activeTab = $state<'oferta' | 'pracownicy' | 'opinie' | 'galeria'>('oferta');

	const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

	// Group services by category
	const byCategory = $derived(() => {
		const map = new Map<string, CatalogService[]>();
		for (const s of services) {
			const key = s.category_name ?? 'Inne';
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(s);
		}
		return map;
	});

	function formatTime(t: string | null) {
		if (!t) return '—';
		return t.slice(0, 5);
	}

	let contactName  = $state('');
	let contactPhone = $state('');
	let contactMsg   = $state('');
	let contactStatus = $state<'idle' | 'sending' | 'ok' | 'error'>('idle');

	async function submitContact(e: Event) {
		e.preventDefault();
		contactStatus = 'sending';
		try {
			const res = await fetch('/api/lead', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					salon_id: salon.id,
					name:  contactName,
					phone: contactPhone,
					message: contactMsg,
					source_type: 'form'
				})
			});
			contactStatus = res.ok ? 'ok' : 'error';
		} catch {
			contactStatus = 'error';
		}
	}
</script>

<svelte:head>
	<title>{salon.name} — {salon.city} — BeautyKatalog</title>
	<meta name="description" content="{salon.short_description ?? `Salon beauty ${salon.name} w ${salon.city}. Sprawdź ofertę i zarezerwuj wizytę.`}" />
	{#if salon.cover_image_url}
		<meta property="og:image" content={salon.cover_image_url} />
	{/if}
</svelte:head>

<!-- HERO -->
<div class="salon-hero">
	{#if salon.cover_image_url}
		<img src={salon.cover_image_url} alt={salon.name} class="hero-cover" />
		<div class="hero-overlay"></div>
	{:else}
		<div class="hero-cover hero-cover-placeholder"></div>
	{/if}

	<div class="container hero-bottom">
		<div class="salon-id-card">
			{#if salon.logo_url}
				<img src={salon.logo_url} alt="" class="salon-logo" />
			{/if}
			<div>
				<div class="salon-badges">
					{#if salon.plan !== 'basic'}
						<span class="badge badge-gold">{salon.plan === 'premium_plus' ? 'Premium+' : 'Premium'}</span>
					{/if}
					{#if salon.booking_enabled}
						<span class="badge badge-rose">Rezerwacja online</span>
					{/if}
				</div>
				<h1 class="display-lg salon-name">{salon.name}</h1>
				{#if salon.city}
					<p class="salon-city">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
						{salon.address_line ? `${salon.address_line}, ` : ''}{salon.city}
					</p>
				{/if}
				{#if avgRating}
					<div class="salon-rating">
						<span class="stars">{stars(avgRating)}</span>
						<strong>{avgRating}</strong>
						<span class="text-muted">({reviews.length} opinii)</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- BODY -->
<div class="container salon-body">
	<div class="salon-layout">

		<!-- Main column -->
		<div class="salon-main">

			<!-- Tabs -->
			<div class="tabs" role="tablist">
				{#each (['oferta', 'pracownicy', 'opinie', 'galeria'] as const) as tab}
					<button
						role="tab"
						aria-selected={activeTab === tab}
						class="tab-btn"
						class:active={activeTab === tab}
						onclick={() => (activeTab = tab)}
					>
						{#if tab === 'oferta'}Oferta & zabiegi
						{:else if tab === 'pracownicy'}Pracownicy
						{:else if tab === 'opinie'}Opinie ({reviews.length})
						{:else}Galeria
						{/if}
					</button>
				{/each}
			</div>

			<!-- TAB: Oferta -->
			{#if activeTab === 'oferta'}
				<div class="tab-content">
					{#if salon.description}
						<div class="about-block">
							<h2 class="display-sm">O nas</h2>
							<p>{salon.description}</p>
						</div>
					{/if}

					{#if promotions.length}
						<div class="promos-block">
							<h2 class="display-sm">Aktualne promocje</h2>
							<div class="promos-grid">
								{#each promotions as promo}
									<div class="promo-card">
										{#if promo.image_url}
											<img src={promo.image_url} alt={promo.title} />
										{/if}
										<div class="promo-body">
											<strong>{promo.title}</strong>
											{#if promo.description}<p>{promo.description}</p>{/if}
											{#if promo.discount_type === 'percent' && promo.discount_value}
												<span class="badge badge-rose">-{promo.discount_value}%</span>
											{:else if promo.discount_type === 'fixed' && promo.discount_value}
												<span class="badge badge-rose">-{promo.discount_value} zł</span>
											{/if}
											{#if promo.valid_until}
												<p class="text-xs text-muted">Do: {promo.valid_until}</p>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					{#if services.length}
						<div class="services-block">
							<h2 class="display-sm">Zabiegi i usługi</h2>
							{#each byCategory() as [cat, catServices]}
								<div class="service-category">
									<h3 class="cat-heading">{cat}</h3>
									<div class="services-list">
										{#each catServices as service}
											<div class="service-row">
												<div class="service-info">
													<strong class="service-name">{service.name}</strong>
													{#if service.short_description}
														<p class="service-desc text-sm text-muted">{service.short_description}</p>
													{/if}
													{#if service.duration_min}
														<span class="service-duration text-xs text-muted">⏱ {service.duration_min} min</span>
													{/if}
												</div>
												<div class="service-price">
													{#if service.price_from}
														<strong>
															{#if service.price_to && service.price_to !== service.price_from}
																{service.price_from}–{service.price_to} zł
															{:else}
																od {service.price_from} zł
															{/if}
														</strong>
													{:else}
														<span class="text-muted">cena na zapytanie</span>
													{/if}
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-muted">Salon nie dodał jeszcze oferty.</p>
					{/if}
				</div>
			{/if}

			<!-- TAB: Pracownicy -->
			{#if activeTab === 'pracownicy'}
				<div class="tab-content">
					{#if staff.length}
						<div class="staff-grid">
							{#each staff as member}
								<div class="staff-card">
									{#if member.photo_url}
										<img src={member.photo_url} alt={member.name} class="staff-photo" />
									{:else}
										<div class="staff-avatar" style="background:{member.calendar_color}22; color:{member.calendar_color}">
											{member.name[0]}
										</div>
									{/if}
									<div class="staff-info">
										<strong>{member.name}</strong>
										{#if member.role_label}<p class="text-sm text-muted">{member.role_label}</p>{/if}
										{#if member.bio}<p class="text-sm" style="margin-top:.5rem">{member.bio}</p>{/if}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-muted">Salon nie dodał jeszcze pracowników.</p>
					{/if}
				</div>
			{/if}

			<!-- TAB: Opinie -->
			{#if activeTab === 'opinie'}
				<div class="tab-content">
					{#if reviews.length}
						<div class="reviews-list">
							{#each reviews as review}
								<div class="review-card">
									<div class="review-header">
										<div class="review-author">
											<div class="reviewer-avatar">{review.author_name[0]}</div>
											<div>
												<strong>{review.author_name}</strong>
												{#if review.published_at}
													<p class="text-xs text-muted">{new Date(review.published_at).toLocaleDateString('pl-PL')}</p>
												{/if}
											</div>
										</div>
										<div class="review-rating">
											<span class="stars">{stars(review.rating)}</span>
											<strong class="text-sm">{review.rating}/5</strong>
										</div>
									</div>
									{#if review.content}
										<p class="review-content">{review.content}</p>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-muted">Brak opinii. Bądź pierwszy!</p>
					{/if}
				</div>
			{/if}

			<!-- TAB: Galeria -->
			{#if activeTab === 'galeria'}
				<div class="tab-content">
					<p class="text-muted">Salon nie dodał jeszcze zdjęć do galerii.</p>
				</div>
			{/if}
		</div>

		<!-- Sidebar -->
		<aside class="salon-sidebar">

			<!-- Booking / Contact -->
			<div class="sidebar-card">
				{#if salon.booking_enabled}
					<h2 class="display-sm">Zarezerwuj wizytę</h2>
					<p class="text-sm text-muted" style="margin-bottom:1rem">
						Wybierz usługę i pracownika, aby zobaczyć dostępne terminy.
					</p>
					<a href="#booking" class="btn btn-rose" style="width:100%">
						Sprawdź terminy
					</a>
				{:else}
					<h2 class="display-sm">Napisz do salonu</h2>
					<form class="contact-form" onsubmit={submitContact}>
						<div class="field">
							<label for="c-name">Imię i nazwisko</label>
							<input id="c-name" class="input" type="text" bind:value={contactName} required placeholder="Anna Kowalska" />
						</div>
						<div class="field">
							<label for="c-phone">Telefon</label>
							<input id="c-phone" class="input" type="tel" bind:value={contactPhone} placeholder="+48 600 000 000" />
						</div>
						<div class="field">
							<label for="c-msg">Wiadomość</label>
							<textarea id="c-msg" class="input" rows="3" bind:value={contactMsg} placeholder="Chciałabym umówić się na…"></textarea>
						</div>

						{#if contactStatus === 'ok'}
							<p class="form-feedback ok">Wiadomość wysłana! Salon wkrótce się odezwie.</p>
						{:else if contactStatus === 'error'}
							<p class="form-feedback err">Wystąpił błąd. Spróbuj ponownie.</p>
						{:else}
							<button type="submit" class="btn btn-primary" style="width:100%" disabled={contactStatus === 'sending'}>
								{contactStatus === 'sending' ? 'Wysyłanie…' : 'Wyślij wiadomość'}
							</button>
						{/if}
					</form>
				{/if}
			</div>

			<!-- Contact info -->
			<div class="sidebar-card">
				<h2 class="display-sm" style="margin-bottom:1rem">Kontakt</h2>
				<dl class="contact-list">
					{#if salon.phone}
						<dt>Telefon</dt>
						<dd><a href="tel:{salon.phone}">{salon.phone}</a></dd>
					{/if}
					{#if salon.email}
						<dt>E-mail</dt>
						<dd><a href="mailto:{salon.email}">{salon.email}</a></dd>
					{/if}
					{#if salon.website_url}
						<dt>WWW</dt>
						<dd><a href={salon.website_url} target="_blank" rel="noopener">Odwiedź stronę ↗</a></dd>
					{/if}
					{#if salon.facebook_url}
						<dt>Facebook</dt>
						<dd><a href={salon.facebook_url} target="_blank" rel="noopener">Facebook ↗</a></dd>
					{/if}
					{#if salon.instagram_url}
						<dt>Instagram</dt>
						<dd><a href={salon.instagram_url} target="_blank" rel="noopener">Instagram ↗</a></dd>
					{/if}
				</dl>
			</div>

			<!-- Working hours -->
			{#if hours.length}
				<div class="sidebar-card">
					<h2 class="display-sm" style="margin-bottom:1rem">Godziny otwarcia</h2>
					<table class="hours-table">
						{#each hours as h}
							<tr class:today={new Date().getDay() === (h.day_of_week % 7)}>
								<td class="day-name">{DAY_NAMES_FULL[h.day_of_week]}</td>
								<td class="day-hours">
									{#if h.is_open}
										{formatTime(h.open_time)} – {formatTime(h.close_time)}
									{:else}
										<span class="text-muted">Zamknięte</span>
									{/if}
								</td>
							</tr>
						{/each}
					</table>
				</div>
			{/if}
		</aside>
	</div>
</div>

<style>
/* Hero */
.salon-hero {
	position: relative;
	height: 340px;
	overflow: hidden;
	background: var(--c-surface-2);
}

@media (min-width: 768px) { .salon-hero { height: 420px; } }

.hero-cover {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.hero-cover-placeholder {
	background: linear-gradient(135deg, var(--c-rose-light) 0%, var(--c-gold-light) 100%);
}

.hero-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(to bottom, transparent 40%, rgba(42,40,37,.6) 100%);
}

.hero-bottom {
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 100%;
	padding-bottom: var(--space-6);
}

.salon-id-card {
	display: flex;
	align-items: flex-end;
	gap: var(--space-4);
	color: #fff;
}

.salon-logo {
	width: 72px;
	height: 72px;
	border-radius: var(--radius-md);
	object-fit: cover;
	border: 2px solid rgba(255,255,255,.3);
	flex-shrink: 0;
}

.salon-name { color: #fff; }

.salon-city {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 0.875rem;
	color: rgba(255,255,255,.8);
	margin-top: 4px;
}

.salon-rating {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	margin-top: var(--space-2);
	font-size: 0.875rem;
	color: rgba(255,255,255,.9);
}

.salon-badges {
	display: flex;
	gap: var(--space-2);
	margin-bottom: var(--space-2);
}

/* Body layout */
.salon-body {
	padding-top: var(--space-8);
	padding-bottom: var(--space-16);
}

.salon-layout {
	display: grid;
	grid-template-columns: 1fr;
	gap: var(--space-8);
}

@media (min-width: 1024px) {
	.salon-layout {
		grid-template-columns: 1fr 360px;
		align-items: start;
	}
}

/* Tabs */
.tabs {
	display: flex;
	border-bottom: 2px solid var(--c-border);
	margin-bottom: var(--space-8);
	gap: 0;
	overflow-x: auto;
}

.tab-btn {
	padding: var(--space-3) var(--space-5);
	font-size: 0.9rem;
	font-weight: 500;
	color: var(--c-muted);
	background: none;
	border: none;
	border-bottom: 2px solid transparent;
	margin-bottom: -2px;
	white-space: nowrap;
	transition: color var(--transition), border-color var(--transition);
}

.tab-btn.active {
	color: var(--c-charcoal);
	border-bottom-color: var(--c-charcoal);
}

.tab-btn:hover:not(.active) { color: var(--c-text); }

.tab-content {
	display: flex;
	flex-direction: column;
	gap: var(--space-10);
}

/* About */
.about-block { display: flex; flex-direction: column; gap: var(--space-3); }
.about-block p { line-height: 1.7; color: var(--c-text); }

/* Promotions */
.promos-block { display: flex; flex-direction: column; gap: var(--space-4); }
.promos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-4); }
.promo-card { border: 1px solid var(--c-border); border-radius: var(--radius-md); overflow: hidden; }
.promo-card img { width: 100%; aspect-ratio: 16/7; object-fit: cover; }
.promo-body { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); }
.promo-body strong { font-weight: 600; color: var(--c-charcoal); }

/* Services */
.services-block { display: flex; flex-direction: column; gap: var(--space-6); }
.service-category { display: flex; flex-direction: column; gap: var(--space-2); }
.cat-heading { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--c-muted); margin-bottom: var(--space-2); }
.services-list { border: 1px solid var(--c-border); border-radius: var(--radius-md); overflow: hidden; }
.service-row {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: var(--space-4);
	padding: var(--space-4) var(--space-5);
	border-bottom: 1px solid var(--c-border);
}
.service-row:last-child { border-bottom: none; }
.service-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.service-name { font-weight: 500; color: var(--c-charcoal); }
.service-duration { margin-top: 4px; }
.service-price { flex-shrink: 0; text-align: right; font-size: 0.9rem; white-space: nowrap; }
.service-price strong { color: var(--c-charcoal); font-weight: 600; }

/* Staff */
.staff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-5); }
.staff-card { display: flex; flex-direction: column; gap: var(--space-3); }
.staff-photo { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-lg); }
.staff-avatar {
	width: 100%;
	aspect-ratio: 1;
	border-radius: var(--radius-lg);
	display: flex;
	align-items: center;
	justify-content: center;
	font-family: var(--font-display);
	font-size: 2.5rem;
	font-weight: 700;
}
.staff-info { display: flex; flex-direction: column; gap: 2px; }
.staff-info strong { font-weight: 600; color: var(--c-charcoal); }

/* Reviews */
.reviews-list { display: flex; flex-direction: column; gap: var(--space-5); }
.review-card { padding: var(--space-5); border: 1px solid var(--c-border); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: var(--space-3); }
.review-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); }
.review-author { display: flex; align-items: center; gap: var(--space-3); }
.reviewer-avatar {
	width: 40px; height: 40px; border-radius: 50%;
	background: var(--c-rose-light); color: var(--c-rose-dark);
	display: flex; align-items: center; justify-content: center;
	font-weight: 700; font-size: 1rem; flex-shrink: 0;
}
.review-rating { display: flex; align-items: center; gap: var(--space-2); flex-shrink: 0; }
.review-content { line-height: 1.6; color: var(--c-text); font-size: 0.9375rem; }

/* Sidebar */
.salon-sidebar {
	display: flex;
	flex-direction: column;
	gap: var(--space-5);
}

@media (min-width: 1024px) {
	.salon-sidebar {
		position: sticky;
		top: calc(64px + var(--space-8));
	}
}

.sidebar-card {
	background: var(--c-surface);
	border: 1px solid var(--c-border);
	border-radius: var(--radius-lg);
	padding: var(--space-5) var(--space-6);
}

/* Contact form */
.contact-form { display: flex; flex-direction: column; gap: var(--space-4); }
.contact-form textarea.input { resize: vertical; min-height: 80px; border-radius: var(--radius-md); padding-top: var(--space-3); }

.form-feedback { font-size: 0.875rem; padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); text-align: center; }
.form-feedback.ok  { background: #EBF7F1; color: var(--c-success); }
.form-feedback.err { background: #FAEAEA; color: var(--c-error); }

/* Contact list */
.contact-list { display: grid; grid-template-columns: auto 1fr; gap: var(--space-2) var(--space-4); font-size: 0.875rem; }
.contact-list dt { color: var(--c-muted); font-weight: 500; }
.contact-list dd a { color: var(--c-rose-dark); transition: color var(--transition); }
.contact-list dd a:hover { color: var(--c-charcoal); }

/* Hours table */
.hours-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.hours-table tr { border-bottom: 1px solid var(--c-border); }
.hours-table tr:last-child { border-bottom: none; }
.hours-table td { padding: var(--space-2) 0; }
.hours-table .day-name { color: var(--c-charcoal); font-weight: 500; }
.hours-table .day-hours { text-align: right; color: var(--c-text); }
.hours-table tr.today .day-name { color: var(--c-rose-dark); font-weight: 700; }
</style>

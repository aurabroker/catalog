<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let loading = $state(false);
	let error   = $state<string | null>(null);

	async function signInWithGoogle() {
		loading = true;
		error = null;
		const redirectTo = $page.url.searchParams.get('next') ?? '/dashboard/salon';
		const { error: err } = await data.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${$page.url.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
			}
		});
		if (err) {
			error = err.message;
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Logowanie — BeautyKatalog</title>
</svelte:head>

<div class="login-page">
	<div class="login-card">
		<div class="login-brand">
			<span class="logo-icon" aria-hidden="true">✦</span>
			<span class="logo-text">Beauty<strong>Katalog</strong></span>
		</div>

		<div class="login-content">
			<h1 class="display-md">Zaloguj się</h1>
			<p class="text-muted">
				Zaloguj się, aby zarządzać swoim salonem, dodawać zabiegi, pracowników i odpowiadać na rezerwacje.
			</p>

			{#if error}
				<div class="alert-error">{error}</div>
			{/if}

			<button class="btn-google" onclick={signInWithGoogle} disabled={loading}>
				<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
					<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
					<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
					<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
					<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
				</svg>
				{loading ? 'Przekierowanie…' : 'Kontynuuj z Google'}
			</button>

			<p class="login-note">
				Rejestrując się, akceptujesz
				<a href="/regulamin">Regulamin</a> i
				<a href="/polityka-prywatnosci">Politykę prywatności</a>.
			</p>
		</div>

		<div class="login-footer">
			<a href="/katalog">← Wróć do katalogu</a>
		</div>
	</div>

	<div class="login-visual" aria-hidden="true">
		<div class="visual-blob v1"></div>
		<div class="visual-blob v2"></div>
		<div class="visual-text">
			<p class="display-md" style="color:#fff">Rozwijaj swój<br /><em>biznes beauty</em></p>
			<ul class="feature-list">
				<li>✓ Profil widoczny dla tysięcy klientów</li>
				<li>✓ Kalendarz i rezerwacje online</li>
				<li>✓ Zarządzanie pracownikami</li>
				<li>✓ Statystyki i opinie</li>
			</ul>
		</div>
	</div>
</div>

<style>
.login-page {
	min-height: calc(100vh - 64px);
	display: grid;
	grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
	.login-page { grid-template-columns: 1fr 1fr; }
}

.login-card {
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: var(--space-10) var(--space-8);
	max-width: 480px;
	margin: 0 auto;
	width: 100%;
}

.login-brand {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	margin-bottom: var(--space-12);
}

.logo-icon { color: var(--c-rose); font-size: 1.2rem; }
.logo-text { font-family: var(--font-display); font-size: 1.125rem; color: var(--c-charcoal); }
.logo-text strong { font-weight: 700; }

.login-content {
	display: flex;
	flex-direction: column;
	gap: var(--space-5);
}

.alert-error {
	background: #FAEAEA;
	color: var(--c-error);
	padding: var(--space-3) var(--space-4);
	border-radius: var(--radius-md);
	font-size: 0.875rem;
}

.btn-google {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: var(--space-3);
	padding: var(--space-4) var(--space-6);
	border: 1.5px solid var(--c-border-dark);
	border-radius: var(--radius-full);
	background: var(--c-surface);
	font-size: 1rem;
	font-weight: 500;
	color: var(--c-charcoal);
	width: 100%;
	transition: background var(--transition), box-shadow var(--transition);
}

.btn-google:hover:not(:disabled) {
	background: var(--c-surface-2);
	box-shadow: var(--shadow-sm);
}

.btn-google:disabled { opacity: .6; cursor: wait; }

.login-note {
	font-size: 0.8125rem;
	color: var(--c-muted);
	text-align: center;
}

.login-note a {
	color: var(--c-rose-dark);
	text-decoration: underline;
}

.login-footer {
	margin-top: var(--space-8);
	padding-top: var(--space-6);
	border-top: 1px solid var(--c-border);
}

.login-footer a {
	font-size: 0.875rem;
	color: var(--c-muted);
	transition: color var(--transition);
}

.login-footer a:hover { color: var(--c-charcoal); }

/* Visual panel */
.login-visual {
	display: none;
	position: relative;
	background: linear-gradient(135deg, var(--c-charcoal) 0%, #3D3630 100%);
	overflow: hidden;
	align-items: center;
	justify-content: center;
}

@media (min-width: 1024px) { .login-visual { display: flex; } }

.visual-blob {
	position: absolute;
	border-radius: 50%;
	filter: blur(80px);
	opacity: .2;
}

.v1 { width: 400px; height: 400px; background: var(--c-rose); top: -100px; right: -100px; }
.v2 { width: 300px; height: 300px; background: var(--c-gold); bottom: -50px; left: -50px; }

.visual-text {
	position: relative;
	color: #fff;
	padding: var(--space-12);
}

.visual-text em { font-style: italic; color: var(--c-rose); }

.feature-list {
	margin-top: var(--space-8);
	list-style: none;
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
}

.feature-list li {
	font-size: 1rem;
	color: rgba(255,255,255,.8);
}
</style>

<footer class="footer">
	<div class="container footer-inner">
		<div class="footer-brand">
			<a href="/" class="logo-text">Beauty<strong>Katalog</strong></a>
			<p class="footer-tagline">Znajdź salon beauty w swojej okolicy.</p>
		</div>

		<nav class="footer-nav">
			<div class="footer-col">
				<p class="footer-col-title">Katalog</p>
				<a href="/katalog">Wszystkie salony</a>
				<a href="/katalog?plan=premium">Salony Premium</a>
				<a href="/katalog?category=fryzjerstwo">Fryzjerstwo</a>
				<a href="/katalog?category=kosmetologia">Kosmetologia</a>
			</div>
			<div class="footer-col">
				<p class="footer-col-title">Dla salonów</p>
				<a href="/auth/login">Dodaj salon</a>
				<a href="/dashboard/salon">Panel zarządzania</a>
			</div>
			<div class="footer-col">
				<p class="footer-col-title">Informacje</p>
				<a href="/regulamin">Regulamin</a>
				<a href="/polityka-prywatnosci">Polityka prywatności</a>
				<a href="/kontakt">Kontakt</a>
			</div>
		</nav>
	</div>

	<div class="footer-bottom">
		<div class="container">
			<p class="text-xs text-muted">
				&copy; {new Date().getFullYear()} BeautyKatalog &mdash; Katalog salonów beauty w Polsce
			</p>
		</div>
	</div>
</footer>

<style>
.footer {
	background: var(--c-charcoal);
	color: #C8C4BE;
	margin-top: auto;
}

.footer-inner {
	padding: var(--space-16) 0 var(--space-12);
	display: grid;
	grid-template-columns: 1fr;
	gap: var(--space-10);
}

@media (min-width: 768px) {
	.footer-inner {
		grid-template-columns: 1fr 2fr;
		gap: var(--space-16);
	}
}

.logo-text {
	font-family: var(--font-display);
	font-size: 1.125rem;
	color: #fff;
	letter-spacing: -0.01em;
}

.logo-text strong { font-weight: 700; }

.footer-tagline {
	margin-top: var(--space-3);
	font-size: 0.875rem;
	line-height: 1.6;
	color: #9A9692;
}

.footer-nav {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: var(--space-8);
}

@media (max-width: 640px) {
	.footer-nav { grid-template-columns: 1fr 1fr; }
}

.footer-col {
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
}

.footer-col-title {
	font-size: 0.75rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: .08em;
	color: #fff;
	margin-bottom: var(--space-1);
}

.footer-col a {
	font-size: 0.875rem;
	color: #9A9692;
	transition: color var(--transition);
}

.footer-col a:hover { color: #fff; }

.footer-bottom {
	border-top: 1px solid rgba(255,255,255,.08);
	padding: var(--space-5) 0;
}
</style>

'use client';

import { useState } from 'react';

export function LeadForm({ salonId }: { salonId: string }) {
  const [status, setStatus] = useState('');

  async function onSubmit(formData: FormData) {
    setStatus('Wysyłanie...');
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salonId,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message')
      })
    });
    setStatus(response.ok ? 'Wysłano' : 'Błąd wysyłki');
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900">Zapytaj salon</h3>
      <input className="w-full rounded-xl border border-neutral-200 px-4 py-3" name="name" placeholder="Imię" required />
      <input className="w-full rounded-xl border border-neutral-200 px-4 py-3" name="email" placeholder="E-mail" type="email" />
      <input className="w-full rounded-xl border border-neutral-200 px-4 py-3" name="phone" placeholder="Telefon" />
      <textarea className="min-h-32 w-full rounded-xl border border-neutral-200 px-4 py-3" name="message" placeholder="Treść wiadomości" required />
      <button className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-medium text-white" type="submit">Wyślij</button>
      {status ? <p className="text-sm text-neutral-500">{status}</p> : null}
    </form>
  );
}

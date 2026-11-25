'use client';

import { useState } from 'react';
import { api, ApiError } from '@/lib/api';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus('loading');
    setMessage('');

    try {
      await api('/newsletter/subscribe', {
        method: 'POST',
        body: { email: trimmed },
      });
      setStatus('success');
      setMessage('Thank you for subscribing to MAISON updates.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiError) {
        setMessage(err.message || 'Unable to subscribe right now.');
      } else {
        setMessage('Unable to subscribe right now. Please try again.');
      }
    }
  };

  return (
    <section className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-xl text-center space-y-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Newsletter
          </p>
          <h2 className="font-heading text-2xl font-medium tracking-tight sm:text-3xl">
            Early access & seasonal edits
          </h2>
          <p className="text-sm text-muted-foreground">
            Receive updates on new arrivals, private sales, and curated lookbooks.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              aria-label="Email address"
              className="h-11 flex-1 border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="h-11 bg-foreground px-7 text-xs font-medium uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {status === 'loading' ? 'Joining...' : 'Subscribe'}
            </button>
          </form>

          {message && (
            <p
              className={
                status === 'error'
                  ? 'text-xs text-red-600 dark:text-red-400'
                  : 'text-xs text-foreground'
              }
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
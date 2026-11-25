'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  TriangleAlert,
} from 'lucide-react';
import { useAdminAuth } from '@/components/admin/admin-auth-provider';

const BARS = [38, 52, 44, 66, 58, 74, 62, 86, 70, 92, 80, 100];

const STATUSES = [
  { label: 'Pending', dot: 'bg-amber-400' },
  { label: 'Processing', dot: 'bg-sky-400' },
  { label: 'Shipped', dot: 'bg-violet-400' },
  { label: 'Delivered', dot: 'bg-emerald-400' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function LoginScreen() {
  const { login } = useAdminAuth();
  const reduce = useReducedMotion();
  const shake = useAnimation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const emailInvalid = emailTouched && email.length > 0 && !emailValid;
  const canSubmit = emailValid && password.length > 0 && !busy;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
      setBusy(false);
      if (!reduce) {
        void shake.start({ x: [0, -9, 9, -6, 6, -3, 0], transition: { duration: 0.45 } });
      }
    }
  }

  function onPasswordKey(e: KeyboardEvent<HTMLInputElement>) {
    setCapsOn(e.getModifierState('CapsLock'));
  }

  const inputBase =
    'h-[52px] w-full rounded-xl border bg-background pl-11 pr-4 text-[15px] outline-none transition placeholder:text-muted-foreground/60 focus:ring-4';
  const inputOk =
    ' border-border hover:border-foreground/30 focus:border-foreground focus:ring-foreground/10';
  const inputBad = ' border-red-500/60 focus:border-red-500 focus:ring-red-500/15';
  const iconClass =
    'pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground';

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-12 text-background lg:flex xl:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_100%_0%,rgba(255,255,255,0.10),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />

        <p className="relative font-heading text-lg font-semibold tracking-[0.3em]">MAISON</p>

        <div className="relative">
          <h2 className="max-w-lg font-heading text-4xl font-semibold leading-[1.08] tracking-tight xl:text-[52px]">
            Run the store from one calm place.
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-background/60">
            Orders, stock, products, coupons and customers, all in one dashboard.
          </p>

          {/* Decorative dashboard preview */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
            className="mt-12 max-w-lg rounded-2xl border border-background/10 bg-background/[0.06] p-5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-background/80">Orders</p>
              <span className="rounded-full border border-background/15 px-2.5 py-1 text-[11px] text-background/60">
                Last 30 days
              </span>
            </div>

            <div className="mt-6 flex h-28 items-end gap-2">
              {BARS.map((h, i) => (
                <motion.div
                  key={i}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: 0.45 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: h + '%', transformOrigin: 'bottom' }}
                  className={
                    'flex-1 rounded-md ' + (i >= BARS.length - 3 ? 'bg-background/80' : 'bg-background/20')
                  }
                />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-background/10 pt-4">
              {STATUSES.map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs text-background/75"
                >
                  <span className={'h-1.5 w-1.5 rounded-full ' + s.dot} />
                  {s.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <p className="relative text-xs text-background/40">Admin area. Authorised staff only.</p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-muted/50 px-5 py-12 sm:px-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          <motion.div
            animate={shake}
            className="rounded-3xl border border-border bg-background p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_48px_-12px_rgba(0,0,0,0.12)] sm:p-10"
          >
            <p className="font-heading text-sm font-semibold tracking-[0.3em] lg:hidden">MAISON</p>

            <h1 className="mt-6 font-heading text-[30px] font-semibold leading-tight tracking-tight lg:mt-0">
              Welcome back
            </h1>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Sign in to your admin account to continue.
            </p>

            <form onSubmit={onSubmit} className="mt-9 space-y-5" noValidate>
              <div>
                <label htmlFor="admin-email" className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className={iconClass} />
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    autoFocus
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    aria-invalid={emailInvalid}
                    aria-describedby={emailInvalid ? 'admin-email-hint' : undefined}
                    required
                    className={inputBase + (emailInvalid ? inputBad : inputOk) + ' pr-11'}
                  />
                  {emailValid ? (
                    <Check className="pointer-events-none absolute right-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-emerald-600" />
                  ) : null}
                </div>
                {emailInvalid ? (
                  <p id="admin-email-hint" className="mt-2 text-xs text-red-600">
                    Enter a valid email address, for example name@company.com.
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className={iconClass} />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={onPasswordKey}
                    onKeyDown={onPasswordKey}
                    onBlur={() => setCapsOn(false)}
                    required
                    className={inputBase + inputOk + ' pr-12'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
                {capsOn ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                    <TriangleAlert className="h-3.5 w-3.5" />
                    Caps Lock is on.
                  </p>
                ) : null}
              </div>

              {error ? (
                <motion.p
                  role="alert"
                  initial={reduce ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 rounded-xl border border-red-600/20 bg-red-600/5 px-4 py-3 text-sm text-red-600"
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.p>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="group relative flex h-[54px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground text-[15px] font-semibold text-background shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] transition duration-200 hover:-translate-y-px hover:shadow-[0_12px_26px_-8px_rgba(0,0,0,0.55)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-[18px] w-[18px] animate-spin" />
                    Signing in
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1 group-disabled:translate-x-0" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Trouble signing in? Ask the store owner to check your account.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
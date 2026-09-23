import { useEffect } from 'react';
import { X } from 'lucide-react';

import { Spinner, WhatsAppIcon } from '../components/ui.jsx';
import { cx, brl, STATUS_META } from '../lib/format.js';

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-1.5 text-3xl text-leaf-900">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[0.9rem] text-leaf-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, actions, className, children, padded = true }) {
  return (
    <section className={cx('rounded-card border border-cream-300 bg-white shadow-soft', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 px-5 py-4">
          <div>
            {title && <h2 className="text-[1.05rem] text-leaf-900">{title}</h2>}
            {description && <p className="mt-0.5 text-[0.8rem] text-leaf-500">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, tone = 'default', icon: Icon }) {
  const tones = {
    default: 'bg-white',
    accent: 'bg-leaf-900 text-cream-100',
    sage: 'bg-sage-100',
    lime: 'bg-lime-100',
    danger: 'bg-red-50',
  };
  const isDark = tone === 'accent';

  return (
    <div className={cx('rounded-card border border-cream-300 p-5 shadow-soft', tones[tone])}>
      <div className="flex items-start justify-between gap-3">
        <p
          className={cx(
            'text-[0.72rem] font-bold uppercase tracking-wider',
            isDark ? 'text-lime-300' : 'text-lime-600',
          )}
        >
          {label}
        </p>
        {Icon && (
          <Icon className={cx('h-4 w-4 shrink-0', isDark ? 'text-cream-200/50' : 'text-leaf-300')} />
        )}
      </div>
      <p
        className={cx(
          'mt-3 font-display text-[1.9rem] font-semibold leading-none',
          isDark ? 'text-cream-100' : 'text-leaf-900',
        )}
      >
        {value}
      </p>
      {hint && (
        <p className={cx('mt-2 text-[0.76rem]', isDark ? 'text-cream-200/60' : 'text-leaf-400')}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function StatusPill({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.novo;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold',
        meta.tone,
      )}
    >
      <span className={cx('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' };

  return (
    <>
      <div className="animate-fade fixed inset-0 z-[70] bg-leaf-950/45 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[71] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
        <div
          className={cx(
            'animate-rise relative w-full rounded-card border border-cream-300 bg-cream-100 shadow-2xl',
            sizes[size],
          )}
        >
          <header className="flex items-start justify-between gap-4 border-b border-cream-300 px-6 py-4">
            <div>
              <h2 className="text-[1.2rem] text-leaf-900">{title}</h2>
              {description && <p className="mt-1 text-[0.82rem] text-leaf-500">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cream-300 bg-white text-leaf-600 transition hover:border-leaf-900"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="max-h-[68vh] overflow-y-auto px-6 py-5">{children}</div>

          {footer && (
            <footer className="flex flex-wrap justify-end gap-2.5 border-t border-cream-300 px-6 py-4">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </>
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  ...props
}) {
  const variants = {
    primary: 'bg-leaf-900 text-cream-100 hover:bg-leaf-800',
    lime: 'bg-lime-500 text-leaf-950 hover:bg-lime-400',
    outline: 'border border-cream-300 bg-white text-leaf-800 hover:border-leaf-900',
    ghost: 'text-leaf-600 hover:bg-cream-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    whatsapp: 'bg-[#25D366] text-[#062e14] hover:brightness-105',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-[0.78rem]',
    md: 'px-4 py-2.5 text-[0.85rem]',
    lg: 'px-5 py-3 text-[0.9rem]',
  };

  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function WhatsAppButton({ phone, message, children = 'WhatsApp' }) {
  const number = String(phone ?? '').replace(/\D/g, '');
  const full = number.startsWith('55') ? number : `55${number}`;
  return (
    <a
      href={`https://wa.me/${full}?text=${encodeURIComponent(message ?? '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-3 py-1.5 text-[0.78rem] font-semibold text-[#062e14] transition hover:brightness-105"
    >
      <WhatsAppIcon className="h-3.5 w-3.5" />
      {children}
    </a>
  );
}

/* ------------------------------ Gráfico de barras ----------------------------- */
export function BarChart({ data, valueKey = 'revenue', formatter = brl, height = 180 }) {
  if (!data?.length) {
    return (
      <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-cream-300 text-[0.85rem] text-leaf-400">
        Sem dados no período selecionado.
      </div>
    );
  }

  const max = Math.max(...data.map((item) => Number(item[valueKey]) || 0), 1);

  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((item) => {
          const value = Number(item[valueKey]) || 0;
          const pct = Math.max(2, (value / max) * 100);
          return (
            <div key={item.day} className="group relative flex flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t-md bg-lime-400 transition-all duration-500 hover:bg-lime-500"
                style={{ height: `${pct}%` }}
              />
              <div className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-leaf-900 px-2.5 py-1.5 text-[0.7rem] font-semibold text-cream-100 group-hover:block">
                {formatter(value)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[0.68rem] text-leaf-400">
        <span>{data[0]?.day?.slice(8, 10)}/{data[0]?.day?.slice(5, 7)}</span>
        <span>
          {data[data.length - 1]?.day?.slice(8, 10)}/{data[data.length - 1]?.day?.slice(5, 7)}
        </span>
      </div>
    </div>
  );
}

export function ProgressRow({ label, value, total, hint }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[0.84rem]">
        <span className="truncate font-medium text-leaf-700">{label}</span>
        <span className="shrink-0 font-semibold text-leaf-900">{hint ?? brl(value)}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-200">
        <div className="h-full rounded-full bg-lime-400 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Table({ head, children, className }) {
  return (
    <div className={cx('overflow-x-auto', className)}>
      <table className="w-full min-w-[42rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-cream-200">
            {head.map((cell, index) => (
              <th
                key={index}
                className="whitespace-nowrap px-4 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-lime-600"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-200">{children}</tbody>
      </table>
    </div>
  );
}

import { cx } from '../lib/format.js';

export function Container({ className, children }) {
  return <div className={cx('container-page', className)}>{children}</div>;
}

export function Eyebrow({ children, className }) {
  return <p className={cx('eyebrow', className)}>{children}</p>;
}

export function SectionHeading({ eyebrow, title, description, align = 'left', className }) {
  return (
    <div
      className={cx(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h2 className="text-3xl leading-[1.1] text-cacao-900 sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      {description && <p className="mt-4 text-[0.98rem] leading-relaxed text-cacao-600">{description}</p>}
    </div>
  );
}

const BUTTON_VARIANTS = {
  primary:
    'bg-cacao-900 text-cream-100 hover:bg-cacao-800 active:bg-cacao-950 shadow-soft hover:shadow-lift',
  caramel:
    'bg-caramel-500 text-cacao-950 hover:bg-caramel-400 active:bg-caramel-600 shadow-soft hover:shadow-lift',
  outline: 'border border-cacao-300 text-cacao-800 hover:border-cacao-900 hover:bg-white',
  ghost: 'text-cacao-700 hover:bg-cacao-100',
  whatsapp: 'bg-[#25D366] text-[#062e14] hover:brightness-105 shadow-soft hover:shadow-lift',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  subtle: 'bg-cream-200 text-cacao-800 hover:bg-cream-300',
};

const BUTTON_SIZES = {
  sm: 'px-3.5 py-2 text-[0.8rem]',
  md: 'px-5 py-2.5 text-[0.9rem]',
  lg: 'px-6 py-3.5 text-[0.95rem]',
};

export function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary,
        BUTTON_SIZES[size] ?? BUTTON_SIZES.md,
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Badge({ children, tone = 'cream', className }) {
  const tones = {
    cream: 'bg-cream-200 text-cacao-700',
    caramel: 'bg-caramel-200 text-cacao-800',
    sage: 'bg-sage-100 text-sage-700',
    dark: 'bg-cacao-900 text-cream-100',
    outline: 'border border-cacao-200 text-cacao-600',
  };
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide',
        tones[tone] ?? tones.cream,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cx('rounded-card border border-cream-300 bg-white shadow-soft', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Spinner({ className }) {
  return (
    <span
      className={cx(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-cream-300 bg-white/60 px-6 py-14 text-center">
      {icon && <div className="mb-4 text-cacao-300">{icon}</div>}
      <h3 className="text-lg text-cacao-800">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-cacao-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cx('animate-pulse rounded-xl bg-cream-200', className)} />;
}

export function WhatsAppIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.12-.41-2.14-1.32-.79-.7-1.32-1.57-1.47-1.87-.15-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.62-.93-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.02 4.32.7.3 1.25.48 1.68.62.71.22 1.35.19 1.86.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.86 9.86 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.13h-.01a8.2 8.2 0 01-4.18-1.15l-.3-.18-3.11.82.83-3.04-.19-.31a8.19 8.19 0 01-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.26.86 5.81 2.41a8.16 8.16 0 012.41 5.83c0 4.54-3.7 8.22-8.24 8.22z" />
    </svg>
  );
}

export function InstagramIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MapPinIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function LeafIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M4 20c0-8 5-14 16-15 0 11-5 15-12 15-2 0-4 0-4 0z" strokeLinejoin="round" />
      <path d="M4 20c3-4 7-7 11-8" strokeLinecap="round" />
    </svg>
  );
}

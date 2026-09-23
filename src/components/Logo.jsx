import { cx } from '../lib/format.js';

export function Logo({ className, tone = 'dark', compact = false }) {
  const isLight = tone === 'light';
  return (
    <span className={cx('flex items-center gap-2.5', className)}>
      <span
        className={cx(
          'grid h-10 w-10 shrink-0 place-items-center rounded-2xl shadow-soft',
          isLight ? 'bg-cream-100' : 'bg-cacao-900',
        )}
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <rect x="4" y="8" width="24" height="17" rx="4.5" fill={isLight ? '#2A1810' : '#F4EADC'} />
          <rect x="7" y="11.5" width="18" height="4" rx="2" fill={isLight ? '#52321F' : '#E3D0BF'} opacity="0.55" />
          <path
            d="M10 20.5c1.6-2.2 3.4-2.2 5 0s3.4 2.2 5 0"
            stroke={isLight ? '#DDA96E' : '#C88A4B'}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cx(
              'font-display text-[1.05rem] font-semibold tracking-tight',
              isLight ? 'text-cream-100' : 'text-cacao-900',
            )}
          >
            Healthy Menu
          </span>
          <span
            className={cx(
              'text-[0.62rem] font-bold uppercase tracking-[0.28em]',
              isLight ? 'text-caramel-300' : 'text-caramel-600',
            )}
          >
            Floripa
          </span>
        </span>
      )}
    </span>
  );
}

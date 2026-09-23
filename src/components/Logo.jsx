import { cx } from '../lib/format.js';

/**
 * Símbolo da marca: a maçã verde da Healthy Menu Floripa.
 * É um SVG inline para ficar nítido em qualquer tamanho e se adaptar ao fundo.
 */
export function LogoMark({ className = 'h-10 w-10', tone = 'color', animated = false }) {
  const mono = tone === 'mono-light' ? '#ffffff' : '#163F23';

  return (
    <svg
      viewBox="0 0 64 64"
      className={cx(className, animated && 'transition-transform duration-500 group-hover:scale-105')}
      aria-hidden="true"
    >
      {tone === 'color' ? (
        <>
          <defs>
            <linearGradient id="hmf-mark" x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0%" stopColor="#B9E07C" />
              <stop offset="55%" stopColor="#A0D364" />
              <stop offset="100%" stopColor="#7FB646" />
            </linearGradient>
          </defs>
          <path
            d="M32 20c-4.2-6.6-11.4-9.6-18-7.2-7.8 2.7-12 11.4-10.8 21 1.2 10.8 9 22.8 17.4 25.2 3.6 1.2 6-.6 8.4-.6s4.8 1.8 8.4.6c8.4-2.4 16.2-14.4 17.4-25.2 1.2-9.6-3-18.3-10.8-21-6.6-2.4-13.8.6-18 7.2z"
            fill="url(#hmf-mark)"
          />
          <path d="M31.4 20c-.6-4.8.6-8.4 3-10.8.9 3.6.3 7.2-1.2 10.2z" fill="#2F6B32" />
          <path
            d="M36.2 9.2c4.2-4.8 10.8-6 15-3.6-1.8 5.4-7.8 9-13.2 7.8-1.2-.3-2.1-2.4-1.8-4.2z"
            fill="#A0D364"
            transform="rotate(-14 44 9)"
          />
          <path
            d="M20.6 39.2c4.2 0 5.4-6.6 7.8-6.6s2.4 6.6 3.6 6.6 1.8-7.2 4.2-7.2 3 7.8 7.2 10.2"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M16.4 50c6.6 6.6 18 9 27.6 5.4" fill="none" stroke="#ffffff" strokeWidth="2.1" strokeLinecap="round" opacity="0.92" />
        </>
      ) : (
        <>
          <path
            d="M32 20c-4.2-6.6-11.4-9.6-18-7.2-7.8 2.7-12 11.4-10.8 21 1.2 10.8 9 22.8 17.4 25.2 3.6 1.2 6-.6 8.4-.6s4.8 1.8 8.4.6c8.4-2.4 16.2-14.4 17.4-25.2 1.2-9.6-3-18.3-10.8-21-6.6-2.4-13.8.6-18 7.2z"
            fill={mono}
          />
          <path d="M31.4 20c-.6-4.8.6-8.4 3-10.8.9 3.6.3 7.2-1.2 10.2z" fill={mono} />
          <path
            d="M36.2 9.2c4.2-4.8 10.8-6 15-3.6-1.8 5.4-7.8 9-13.2 7.8-1.2-.3-2.1-2.4-1.8-4.2z"
            fill={mono}
            transform="rotate(-14 44 9)"
          />
          <path
            d="M20.6 39.2c4.2 0 5.4-6.6 7.8-6.6s2.4 6.6 3.6 6.6 1.8-7.2 4.2-7.2 3 7.8 7.2 10.2"
            fill="none"
            stroke={tone === 'mono-light' ? '#163F23' : '#ffffff'}
            strokeWidth="3.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

/**
 * Assinatura completa: símbolo + nome. Usada no cabeçalho, rodapé e painel.
 */
export function Logo({ className, tone = 'dark', compact = false, showTagline = false }) {
  const isLight = tone === 'light';

  return (
    <span className={cx('group flex items-center gap-2.5', className)}>
      <LogoMark
        className="h-11 w-11 shrink-0 drop-shadow-sm"
        tone={isLight ? 'mono-light' : 'color'}
        animated
      />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cx(
              'font-display text-[1.06rem] font-semibold tracking-tight',
              isLight ? 'text-cream-50' : 'text-leaf-900',
            )}
          >
            Healthy Menu
          </span>
          <span
            className={cx(
              'text-[0.62rem] font-extrabold uppercase tracking-[0.3em]',
              isLight ? 'text-lime-300' : 'text-leaf-600',
            )}
          >
            Floripa
          </span>
          {showTagline && (
            <span
              className={cx(
                'font-hand mt-1 text-[0.82rem]',
                isLight ? 'text-lime-200' : 'text-leaf-500',
              )}
            >
              seu cardápio saudável
            </span>
          )}
        </span>
      )}
    </span>
  );
}

export default Logo;

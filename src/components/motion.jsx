import { cx } from '../lib/format.js';
import { useReveal } from '../lib/hooks.js';

/**
 * Revela o conteúdo com uma animação suave quando ele entra na tela.
 *
 *   <Reveal variant="up">…</Reveal>
 *   <Reveal delay={2} variant="left">…</Reveal>
 *
 * Variantes: up (padrão) · left · right · zoom · blur
 */
export function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  className,
  children,
  ...props
}) {
  const ref = useReveal();
  const delays = { 1: 'delay-1', 2: 'delay-2', 3: 'delay-3', 4: 'delay-4', 5: 'delay-5', 6: 'delay-6' };

  return (
    <Tag
      ref={ref}
      data-variant={variant}
      className={cx('reveal', delay > 0 && delays[Math.min(delay, 6)], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Grupo com entrada escalonada: os filhos aparecem em sequência.
 * Usa um único observador no container — os filhos são animados por CSS
 * (`.stagger.is-visible > *`), então nenhum elemento fica invisível se o
 * observador não disparar.
 */
export function Stagger({ as: Tag = 'div', variant = 'up', className, children, ...props }) {
  const ref = useReveal();

  return (
    <Tag ref={ref} data-variant={variant} className={cx('stagger', className)} {...props}>
      {children}
    </Tag>
  );
}

/** Folhas e brilhos flutuando no fundo — a parte "alegre" das seções. */
export function FloatingDecor({ className, tone = 'light' }) {
  const leafColor = tone === 'dark' ? 'text-lime-300/30' : 'text-leaf-400/35';

  return (
    <div className={cx('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <svg viewBox="0 0 24 24" className={cx('animate-float absolute left-[6%] top-[18%] h-9 w-9', leafColor)} style={{ animationDelay: '0.2s' }} fill="currentColor">
        <path d="M4 20c0-8 5-14 16-15 0 11-5 15-12 15-2 0-4 0-4 0z" />
      </svg>
      <svg viewBox="0 0 24 24" className={cx('animate-float absolute right-[9%] top-[30%] h-7 w-7', leafColor)} style={{ animationDelay: '1.4s' }} fill="currentColor">
        <path d="M4 20c0-8 5-14 16-15 0 11-5 15-12 15-2 0-4 0-4 0z" />
      </svg>
      <svg viewBox="0 0 24 24" className={cx('animate-float absolute bottom-[16%] left-[16%] h-6 w-6', leafColor)} style={{ animationDelay: '2.3s' }} fill="currentColor">
        <circle cx="12" cy="12" r="5" />
      </svg>
      <svg viewBox="0 0 24 24" className={cx('animate-float absolute bottom-[26%] right-[22%] h-8 w-8', leafColor)} style={{ animationDelay: '3.1s' }} fill="currentColor">
        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
      </svg>
    </div>
  );
}

/** Manchas de gradiente que se movem devagar ao fundo das seções. */
export function GradientBlobs({ className }) {
  return (
    <div className={cx('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div className="animate-float-slow absolute -left-24 top-0 h-72 w-72 rounded-full bg-lime-300/35 blur-3xl" />
      <div
        className="animate-float-slow absolute -right-16 top-24 h-80 w-80 rounded-full bg-leaf-300/30 blur-3xl"
        style={{ animationDelay: '3s' }}
      />
      <div
        className="animate-float-slow absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-leaf-200/40 blur-3xl"
        style={{ animationDelay: '6s' }}
      />
    </div>
  );
}

/** Onda decorativa para a transição entre seções. */
export function WaveDivider({ position = 'bottom', className, fill = '#ffffff', flip = false }) {
  return (
    <div className={cx(position === 'top' ? 'wave-top' : 'wave-bottom', className)} aria-hidden="true">
      <svg
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        className={cx('h-[54px] w-full sm:h-[86px]', flip && 'rotate-180')}
      >
        <path d="M0 40C180 92 340 108 520 88c180-20 300-64 480-58 150 5 300 46 440 26v54H0z" fill={fill} />
      </svg>
    </div>
  );
}

/** Faixa infinita com as frases da marca (pausa no hover). */
export function Marquee({ items, className, tone = 'light' }) {
  const list = [...items, ...items];
  const isDark = tone === 'dark';

  return (
    <div
      className={cx(
        'relative flex overflow-hidden border-y',
        isDark ? 'border-white/10 bg-leaf-900 text-lime-200' : 'border-leaf-100 bg-white text-leaf-800',
        className,
      )}
    >
      <div className="marquee-track py-4">
        {list.map((item, index) => (
          <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-6 px-6">
            <span className="whitespace-nowrap font-display text-[0.95rem] font-semibold tracking-tight sm:text-lg">
              {item}
            </span>
            <span className={cx('text-lg', isDark ? 'text-lime-400' : 'text-lime-500')}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Confete para celebrar o pedido concluído. */
export function Confetti({ pieces = 28, className }) {
  const colors = ['#A9D86E', '#92C951', '#57A145', '#C7E793', '#2F6B32', '#FFFFFF'];

  return (
    <div className={cx('pointer-events-none absolute inset-x-0 top-0 h-44 overflow-hidden', className)} aria-hidden="true">
      {Array.from({ length: pieces }).map((_, index) => {
        const left = (index * 37) % 100;
        const offset = ((index % 6) - 3) * 26;
        const rotate = 220 + (index % 5) * 90;
        const delay = (index % 7) * 0.12;
        const size = 6 + (index % 3) * 3;

        return (
          <span
            key={index}
            className="absolute top-0 block rounded-[3px]"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.6,
              background: colors[index % colors.length],
              animation: `hf-confetti 1.6s cubic-bezier(0.3, 0.7, 0.5, 1) ${delay}s both`,
              '--cx': `${offset}px`,
              '--cr': `${rotate}deg`,
            }}
          />
        );
      })}
    </div>
  );
}

/** Selo com brilho passando devagar — usado nos destaques. */
export function ShimmerBadge({ children, className }) {
  return (
    <span
      className={cx(
        'animate-shimmer inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-wider text-leaf-900',
        className,
      )}
      style={{ backgroundImage: 'linear-gradient(100deg, #DFF0B8 20%, #F4FBE6 40%, #DFF0B8 60%)' }}
    >
      {children}
    </span>
  );
}

import { useEffect, useState } from 'react';

import { cx } from '../lib/format.js';

/**
 * Imagem de produto resiliente.
 *
 * 1. Se a foto falhar, tenta de novo com um parâmetro novo na URL — isso dribla
 *    404 que ficou guardado em cache no navegador ou no proxy.
 * 2. Depois das tentativas, mostra um painel da marca (não o ícone de imagem
 *    quebrada do navegador), que parece intencional mesmo sem foto.
 */
export default function ProductImage({
  src,
  alt = '',
  className,
  placeholderClassName,
  label,
  tone = 'light',
}) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  /* Trocar de produto/galeria reinicia o ciclo de tentativas. */
  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <ImagePlaceholder alt={alt} label={label} className={cx(className, placeholderClassName)} tone={tone} />;
  }

  const separator = src.includes('?') ? '&' : '?';
  const url = attempt === 0 ? src : `${src}${separator}tentativa=${attempt}`;

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (attempt < 2) setAttempt((current) => current + 1);
        else setFailed(true);
      }}
      className={className}
    />
  );
}

/** Painel decorado exibido quando a foto não está disponível. */
export function ImagePlaceholder({ alt = '', label, className, tone = 'light' }) {
  const isDark = tone === 'dark';

  return (
    <div
      role="img"
      aria-label={alt || 'Imagem indisponível'}
      className={cx(
        'grid h-full w-full place-items-center bg-gradient-to-br',
        isDark ? 'from-leaf-900 via-leaf-800 to-leaf-900' : 'from-leaf-100 via-cream-200 to-lime-200',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden="true">
          <path
            d="M32 20c-4.2-6.6-11.4-9.6-18-7.2-7.8 2.7-12 11.4-10.8 21 1.2 10.8 9 22.8 17.4 25.2 3.6 1.2 6-.6 8.4-.6s4.8 1.8 8.4.6c8.4-2.4 16.2-14.4 17.4-25.2 1.2-9.6-3-18.3-10.8-21-6.6-2.4-13.8.6-18 7.2z"
            fill={isDark ? '#A9D86E' : '#A3CD8C'}
            opacity={isDark ? 0.55 : 0.65}
          />
          <path d="M31.4 20c-.6-4.8.6-8.4 3-10.8.9 3.6.3 7.2-1.2 10.2z" fill={isDark ? '#DFF0B8' : '#7EB445'} opacity="0.8" />
        </svg>

        {(label || alt) && (
          <span
            className={cx(
              'max-w-[12rem] text-[0.66rem] font-extrabold uppercase tracking-[0.18em]',
              isDark ? 'text-lime-200/80' : 'text-leaf-700/75',
            )}
          >
            {label || alt}
          </span>
        )}

        <span
          className={cx(
            'text-[0.6rem] font-semibold uppercase tracking-[0.14em]',
            isDark ? 'text-cream-200/50' : 'text-leaf-600/60',
          )}
        >
          foto em breve
        </span>
      </div>
    </div>
  );
}

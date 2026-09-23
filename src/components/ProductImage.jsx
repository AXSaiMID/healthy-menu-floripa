import { useEffect, useState } from 'react';

/**
 * Imagem de produto com fallback: se a foto não carregar (ou não existir),
 * mostra um placeholder com a identidade da marca em vez do ícone quebrado.
 */
export default function ProductImage({ src, alt = '', className, placeholderClassName }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`grid h-full w-full place-items-center bg-gradient-to-br from-leaf-200 via-cream-200 to-lime-200 ${
          placeholderClassName ?? ''
        }`}
        role="img"
        aria-label={alt}
      >
        <svg viewBox="0 0 48 48" className="h-1/3 max-h-16 w-auto opacity-60" aria-hidden="true">
          <rect x="6" y="16" width="36" height="24" rx="6" fill="#3B2417" opacity="0.85" />
          <rect x="10" y="21" width="28" height="5" rx="2.5" fill="#E3D0BF" opacity="0.7" />
          <path
            d="M14 34c2.6-3.4 5.4-3.4 8 0s5.4 3.4 8 0"
            stroke="#C88A4B"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

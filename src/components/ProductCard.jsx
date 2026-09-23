import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button } from './ui.jsx';
import ProductImage from './ProductImage.jsx';
import { useCart } from '../lib/cart.jsx';
import { useToast } from '../lib/toast.jsx';
import { brl, cx, categoryLabel } from '../lib/format.js';

export default function ProductCard({ product, compact = false }) {
  const cart = useCart();
  const toast = useToast();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const hasPromo = product.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price;
  const price = hasPromo ? product.promoPrice : product.price;
  const soldOut = product.stock !== null && product.stock !== undefined && product.stock <= 0;

  const handleAdd = () => {
    if (soldOut) return;
    cart.add(product, 1);
    setJustAdded(true);
    toast.success(`${product.name} adicionado ao carrinho.`);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <article
      className={cx(
        'group flex h-full flex-col overflow-hidden rounded-card border border-leaf-100 bg-white shadow-soft',
        'transition-all duration-500 hover:-translate-y-2 hover:border-leaf-300 hover:shadow-lift',
        soldOut && 'opacity-70',
      )}
    >
      <Link to={`/produto/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-cream-200">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-[1.1s] group-hover:scale-110"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {hasPromo && <Badge tone="dark">Promoção</Badge>}
          {product.tags?.slice(0, compact ? 1 : 2).map((tag) => (
            <Badge key={tag} tone="lime">
              {tag}
            </Badge>
          ))}
        </div>

        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-leaf-950/50">
            <span className="rounded-full bg-cream-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-leaf-900">
              Esgotado
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-lime-600">
          {categoryLabel(product.category)}
        </p>
        <h3 className="mt-1.5 text-[1.05rem] leading-snug text-leaf-900">
          <Link to={`/produto/${product.slug}`} className="hover:text-lime-600">
            {product.name}
          </Link>
        </h3>

        {!compact && (
          <p className="mt-2 line-clamp-2 text-[0.83rem] leading-relaxed text-leaf-500">
            {product.shortDesc}
          </p>
        )}

        {product.unit && (
          <p className="mt-2.5 text-[0.72rem] font-medium text-leaf-400">{product.unit}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            {hasPromo && (
              <span className="block text-[0.72rem] text-leaf-400 line-through">
                {brl(product.price)}
              </span>
            )}
            <span className="font-display text-xl font-semibold text-leaf-900">{brl(price)}</span>
          </div>

          <Button
            size="sm"
            variant={justAdded ? "lime" : "primary"}
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            {justAdded ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Adicionado
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                Adicionar
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

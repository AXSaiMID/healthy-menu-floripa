import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import ProductCard from '../components/ProductCard.jsx';
import { Button, Container, EmptyState, SectionHeading } from '../components/ui.jsx';
import { useSite } from '../lib/site.jsx';
import { cx } from '../lib/format.js';

const SORTS = [
  { id: 'relevance', label: 'Mais pedidos' },
  { id: 'price-asc', label: 'Menor preço' },
  { id: 'price-desc', label: 'Maior preço' },
  { id: 'name', label: 'Nome (A–Z)' },
];

export default function Menu() {
  const { products, activeCategories, status } = useSite();
  const [params, setParams] = useSearchParams();

  const category = params.get('categoria') ?? 'todos';
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevance');

  useEffect(() => {
    document.title = 'Cardápio · Healthy Menu Floripa';
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (category !== 'todos') list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.shortDesc.toLowerCase().includes(term) ||
          p.tags.join(' ').toLowerCase().includes(term),
      );
    }

    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.finalPrice - b.finalPrice);
    if (sort === 'price-desc') sorted.sort((a, b) => b.finalPrice - a.finalPrice);
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (sort === 'relevance') sorted.sort((a, b) => b.featured - a.featured || a.sortOrder - b.sortOrder);
    return sorted;
  }, [products, category, search, sort]);

  const setCategory = (id) => {
    if (id === 'todos') setParams({});
    else setParams({ categoria: id });
  };

  const currentCategory = activeCategories.find((c) => c.id === category);

  return (
    <>
      <section className="border-b border-cream-300 bg-white py-14">
        <Container>
          <SectionHeading
            eyebrow="Cardápio"
            title="Escolha, monte seu carrinho e envie pelo WhatsApp"
            description="Brownies artesanais, combos para presentear, wraps, tapiocas e refeições fit. Entrega no Norte da Ilha e envio para todo o Brasil."
          />

          <div className="mt-9 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0">
              <FilterPill active={category === 'todos'} onClick={() => setCategory('todos')}>
                Todos · {products.length}
              </FilterPill>
              {activeCategories.map((item) => {
                const count = products.filter((p) => p.category === item.id).length;
                return (
                  <FilterPill
                    key={item.id}
                    active={category === item.id}
                    onClick={() => setCategory(item.id)}
                  >
                    {item.label} · {count}
                  </FilterPill>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cacao-300"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M16 16l4.5 4.5" strokeLinecap="round" />
                </svg>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar brownie, zero açúcar…"
                  className="field w-full pl-10 sm:w-72"
                  aria-label="Buscar no cardápio"
                />
              </div>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="field w-full sm:w-48"
                aria-label="Ordenar"
              >
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          {currentCategory && (
            <p className="mb-8 max-w-2xl text-[0.92rem] text-cacao-500">
              <span className="font-semibold text-cacao-800">{currentCategory.label}:</span>{' '}
              {currentCategory.blurb}
            </p>
          )}

          {status === 'loading' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-96 animate-pulse rounded-card bg-cream-200" />
              ))}
            </div>
          )}

          {status !== 'loading' && filtered.length === 0 && (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M16.5 16.5L21 21" strokeLinecap="round" />
                </svg>
              }
              title="Nenhum produto encontrado"
              description="Tente outra busca ou veja o cardápio completo. Se você procura algo específico, chama a gente no WhatsApp."
              action={
                <Button
                  onClick={() => {
                    setSearch('');
                    setCategory('todos');
                  }}
                >
                  Limpar filtros
                </Button>
              }
            />
          )}

          {filtered.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[0.82rem] font-semibold transition',
        active
          ? 'border-cacao-900 bg-cacao-900 text-cream-100'
          : 'border-cream-300 bg-white text-cacao-600 hover:border-cacao-300',
      )}
    >
      {children}
    </button>
  );
}

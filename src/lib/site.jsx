import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { publicApi } from './api.js';

const SiteContext = createContext(null);

export const FALLBACK_SETTINGS = {
  business_name: 'Healthy Menu Floripa',
  whatsapp: '5548920008689',
  whatsapp_display: '(48) 92000-8689',
  instagram: 'https://www.instagram.com/healthymenufloripa/',
  min_order: '25',
  delivery_fee: '8',
  free_delivery_from: '80',
};

export const CATEGORY_ORDER = ['brownies', 'combos', 'salgados', 'refeicoes', 'zero-acucar', 'bebidas'];

export const CATEGORIES = [
  { id: 'brownies', label: 'Brownies', blurb: 'O nosso carro-chefe, em fornadas diárias.' },
  { id: 'combos', label: 'Combos & Presentes', blurb: 'Caixas, kits e o leve-3-pague-2.' },
  { id: 'salgados', label: 'Salgados & Wraps', blurb: 'Tapiocas, wraps e lanches leves.' },
  { id: 'refeicoes', label: 'Refeições Fit', blurb: 'Almoço equilibrado, entregue quentinho.' },
  { id: 'zero-acucar', label: 'Zero Açúcar', blurb: 'Sabor de verdade sem adição de açúcar.' },
  { id: 'bebidas', label: 'Bebidas', blurb: 'Para acompanhar.' },
];

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    try {
      const data = await publicApi.bootstrap();
      setSettings({ ...FALLBACK_SETTINGS, ...data.settings });
      setProducts(data.products ?? []);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const byCategory = (id) => products.filter((p) => p.category === id);
    const featured = products.filter((p) => p.featured);
    const activeCategories = CATEGORIES.filter((c) => byCategory(c.id).length > 0);
    return {
      settings,
      products,
      featured,
      status,
      reload: load,
      byCategory,
      activeCategories,
      number: (key, fallback = 0) => Number(settings[key] ?? fallback) || 0,
    };
  }, [settings, products, status, load]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite precisa estar dentro de <SiteProvider>');
  return context;
}

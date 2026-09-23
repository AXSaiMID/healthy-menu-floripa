import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';

import { Button, Modal, PageHeader, Panel, Table } from './components.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { adminApi } from '../lib/api.js';
import { useToast } from '../lib/toast.jsx';
import { brl, categoryLabel, cx, numberBR } from '../lib/format.js';

const EMPTY = {
  name: '',
  slug: '',
  category: 'brownies',
  shortDesc: '',
  description: '',
  price: '',
  promoPrice: '',
  cost: '',
  unit: '',
  image: '',
  tags: [],
  shippingScope: 'nacional',
  stock: '',
  active: true,
  featured: false,
  sortOrder: 0,
};

const slugify = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function Products() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('todos');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.products();
      setProducts(data.products);
      setCategories(data.categories);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openEditor = (product) => {
    if (product) {
      setForm({
        name: product.name,
        slug: product.slug,
        category: product.category,
        shortDesc: product.shortDesc,
        description: product.description,
        price: product.price,
        promoPrice: product.promoPrice ?? '',
        cost: product.cost ?? '',
        unit: product.unit,
        image: product.image,
        tags: product.tags ?? [],
        shippingScope: product.shippingScope,
        stock: product.stock ?? '',
        active: product.active,
        featured: product.featured,
        sortOrder: product.sortOrder,
      });
      setTagsInput((product.tags ?? []).join(', '));
      setEditing(product);
    } else {
      setForm(EMPTY);
      setTagsInput('');
      setEditing({ id: null });
    }
  };

  const save = async () => {
    if (form.name.trim().length < 3) {
      toast.error('Informe o nome do produto.');
      return;
    }
    if (Number(form.price) <= 0) {
      toast.error('Informe um preço maior que zero.');
      return;
    }

    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      price: Number(form.price),
      promoPrice: form.promoPrice === '' ? null : Number(form.promoPrice),
      cost: Number(form.cost) || 0,
      stock: form.stock === '' ? null : Number(form.stock),
      tags: tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      sortOrder: Number(form.sortOrder) || 0,
    };

    setSaving(true);
    try {
      if (editing.id) {
        const updated = await adminApi.updateProduct(editing.id, payload);
        setProducts((current) => current.map((p) => (p.id === updated.id ? updated : p)));
        toast.success('Produto atualizado.');
      } else {
        const created = await adminApi.createProduct(payload);
        setProducts((current) => [...current, created]);
        toast.success('Produto criado com sucesso.');
      }
      setEditing(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleField = async (product, field) => {
    try {
      const updated = await adminApi.updateProduct(product.id, { [field]: !product[field] });
      setProducts((current) => current.map((p) => (p.id === updated.id ? updated : p)));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`Excluir "${product.name}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await adminApi.deleteProduct(product.id);
      setProducts((current) => current.filter((p) => p.id !== product.id));
      toast.success('Produto excluído.');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const visible = filter === 'todos' ? products : products.filter((p) => p.category === filter);
  const marginPct = (product) => {
    const price = product.finalPrice ?? product.price;
    if (!price) return 0;
    return Math.round(((price - (product.cost ?? 0)) / price) * 1000) / 10;
  };

  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Produtos"
        description="Atualize preços, fotos, descrições, estoque e destaques. As mudanças aparecem no site na hora."
        actions={
          <Button variant="lime" onClick={() => openEditor(null)}>
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        }
      />

      <Panel className="mb-6" padded={false}>
        <div className="no-scrollbar flex gap-2 overflow-x-auto p-4">
          <FilterPill active={filter === 'todos'} onClick={() => setFilter('todos')}>
            Todos · {products.length}
          </FilterPill>
          {categories.map((category) => (
            <FilterPill
              key={category.id}
              active={filter === category.id}
              onClick={() => setFilter(category.id)}
            >
              {category.label} · {products.filter((p) => p.category === category.id).length}
            </FilterPill>
          ))}
        </div>
      </Panel>

      <Panel padded={false}>
        {loading && products.length === 0 ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-cream-200" />
            ))}
          </div>
        ) : (
          <Table head={['Produto', 'Categoria', 'Preço', 'Custo', 'Margem', 'Estoque', 'Ativo', 'Destaque', '']}>
            {visible.map((product) => (
              <tr key={product.id} className="transition hover:bg-cream-200/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                      <ProductImage src={product.image} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-leaf-900">{product.name}</span>
                      <span className="block truncate text-[0.74rem] text-leaf-400">{product.unit}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[0.82rem] text-leaf-600">
                  {categoryLabel(product.category)}
                </td>
                <td className="px-4 py-3 text-[0.86rem] font-semibold text-leaf-900">
                  {brl(product.finalPrice ?? product.price)}
                  {product.promoPrice ? (
                    <span className="block text-[0.72rem] text-leaf-400 line-through">
                      {brl(product.price)}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-[0.82rem] text-leaf-500">{brl(product.cost ?? 0)}</td>
                <td className="px-4 py-3">
                  <span
                    className={cx(
                      'rounded-full px-2.5 py-1 text-[0.72rem] font-semibold',
                      marginPct(product) >= 60
                        ? 'bg-sage-100 text-sage-700'
                        : marginPct(product) >= 40
                          ? 'bg-lime-200 text-leaf-800'
                          : 'bg-red-100 text-red-700',
                    )}
                  >
                    {marginPct(product)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-[0.82rem] text-leaf-600">
                  {product.stock === null || product.stock === undefined
                    ? 'Ilimitado'
                    : numberBR(product.stock)}
                </td>
                <td className="px-4 py-3">
                  <Toggle active={product.active} onClick={() => toggleField(product, 'active')} label="ativo" />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleField(product, 'featured')}
                    aria-label="Destacar na home"
                    className={cx(
                      'grid h-8 w-8 place-items-center rounded-full border transition',
                      product.featured
                        ? 'border-lime-400 bg-lime-200 text-lime-600'
                        : 'border-cream-300 text-leaf-300 hover:border-leaf-300',
                    )}
                  >
                    <Star className={cx('h-4 w-4', product.featured && 'fill-current')} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditor(product)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-cream-300 text-leaf-600 transition hover:border-leaf-900"
                      aria-label={`Editar ${product.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(product)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-cream-300 text-leaf-400 transition hover:border-red-400 hover:text-red-600"
                      aria-label={`Excluir ${product.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Editar produto' : 'Novo produto'}
        description="Os campos marcados com * são obrigatórios."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button variant="lime" onClick={save} loading={saving}>
              {editing?.id ? 'Salvar alterações' : 'Criar produto'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="p-name">Nome do produto *</label>
            <input
              id="p-name"
              className="field"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="p-category">Categoria</label>
            <select
              id="p-category"
              className="field"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="p-unit">Porção / unidade</label>
            <input
              id="p-unit"
              className="field"
              placeholder="1 unidade · 7x7 cm"
              value={form.unit}
              onChange={(event) => setForm({ ...form, unit: event.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="p-price">Preço de venda (R$) *</label>
            <input
              id="p-price"
              type="number"
              step="0.01"
              min="0"
              className="field"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="p-promo">Preço promocional (R$)</label>
            <input
              id="p-promo"
              type="number"
              step="0.01"
              min="0"
              className="field"
              placeholder="Deixe vazio se não houver"
              value={form.promoPrice}
              onChange={(event) => setForm({ ...form, promoPrice: event.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="p-cost">Custo de produção (R$)</label>
            <input
              id="p-cost"
              type="number"
              step="0.01"
              min="0"
              className="field"
              value={form.cost}
              onChange={(event) => setForm({ ...form, cost: event.target.value })}
            />
            <p className="mt-1 text-[0.72rem] text-leaf-400">
              Usado para calcular o lucro real no financeiro.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="p-stock">Estoque (unidades)</label>
            <input
              id="p-stock"
              type="number"
              min="0"
              className="field"
              placeholder="Vazio = ilimitado"
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="p-image">Imagem principal (URL)</label>
            <input
              id="p-image"
              className="field"
              placeholder="/images/brownie-classico.jpg"
              value={form.image}
              onChange={(event) => setForm({ ...form, image: event.target.value })}
            />

            {form.image && (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-leaf-100 bg-cream-100 p-3">
                <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                  <ProductImage src={form.image} alt="" label="sem arquivo" className="h-full w-full object-cover" />
                </span>
                <p className="text-[0.74rem] leading-relaxed text-leaf-600">
                  Prévia da foto. Se aparecer o painel verde com “foto em breve”, o caminho não
                  encontrou o arquivo — coloque a imagem em <strong>public/images</strong> e use
                  <strong> /images/nome-do-arquivo.jpg</strong>.
                </p>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="p-short">Descrição curta (aparece no card)</label>
            <input
              id="p-short"
              className="field"
              maxLength={220}
              value={form.shortDesc}
              onChange={(event) => setForm({ ...form, shortDesc: event.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="p-description">Descrição completa</label>
            <textarea
              id="p-description"
              rows={5}
              className="field resize-none"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="p-tags">Selo / tags</label>
            <input
              id="p-tags"
              className="field"
              placeholder="Mais vendido, Zero açúcar, Vegano"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
            />
            <p className="mt-1 text-[0.72rem] text-leaf-400">Separe por vírgulas. Máximo de 8 selos.</p>
          </div>

          <div>
            <label className="label" htmlFor="p-scope">Alcance de venda</label>
            <select
              id="p-scope"
              className="field"
              value={form.shippingScope}
              onChange={(event) => setForm({ ...form, shippingScope: event.target.value })}
            >
              <option value="nacional">Envio para todo o Brasil</option>
              <option value="local">Somente Norte da Ilha</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="p-order">Ordem de exibição</label>
            <input
              id="p-order"
              type="number"
              className="field"
              value={form.sortOrder}
              onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
            />
          </div>

          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2.5 text-[0.88rem] text-leaf-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#8fc84f]"
                checked={form.active}
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
              />
              Visível no site
            </label>
            <label className="flex items-center gap-2.5 text-[0.88rem] text-leaf-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#8fc84f]"
                checked={form.featured}
                onChange={(event) => setForm({ ...form, featured: event.target.checked })}
              />
              Destacar na home
            </label>
          </div>
        </div>
      </Modal>
    </>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[0.8rem] font-semibold transition',
        active
          ? 'border-leaf-900 bg-leaf-900 text-cream-100'
          : 'border-cream-300 bg-white text-leaf-600 hover:border-leaf-300',
      )}
    >
      {children}
    </button>
  );
}

function Toggle({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Alternar ${label}`}
      className={cx(
        'relative h-6 w-11 rounded-full transition',
        active ? 'bg-sage-500' : 'bg-cream-300',
      )}
    >
      <span
        className={cx(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
          active ? 'left-[1.4rem]' : 'left-0.5',
        )}
      />
    </button>
  );
}

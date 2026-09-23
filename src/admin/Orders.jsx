import { useCallback, useEffect, useState } from 'react';
import { Download, Search, Trash2 } from 'lucide-react';

import { Button, Modal, PageHeader, Panel, StatusPill, Table, WhatsAppButton } from './components.jsx';
import { adminApi, downloadOrdersCSV } from '../lib/api.js';
import { useToast } from '../lib/toast.jsx';
import { brl, cx, formatDate, maskPhone, PAYMENT_LABEL, todayISO } from '../lib/format.js';

const STATUS_OPTIONS = [
  { id: '', label: 'Todos os status' },
  { id: 'novo', label: 'Novo' },
  { id: 'confirmado', label: 'Confirmado' },
  { id: 'producao', label: 'Em produção' },
  { id: 'enviado', label: 'Enviado' },
  { id: 'entregue', label: 'Entregue' },
  { id: 'cancelado', label: 'Cancelado' },
];

export default function Orders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '', from: '', to: '' });
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.orders(filters);
      setOrders(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    const timer = window.setTimeout(load, 220);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openOrder = (order) => {
    setSelected(order);
    setDraft({
      status: order.status,
      notes: order.notes ?? '',
      paymentMethod: order.paymentMethod,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
    });
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateOrder(selected.id, draft);
      setOrders((current) => current.map((o) => (o.id === updated.id ? updated : o)));
      setSelected(updated);
      toast.success(`Pedido ${updated.code} atualizado.`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (order) => {
    if (!window.confirm(`Excluir definitivamente o pedido ${order.code}?`)) return;
    try {
      await adminApi.deleteOrder(order.id);
      setOrders((current) => current.filter((o) => o.id !== order.id));
      setSelected(null);
      toast.success('Pedido excluído.');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const exportCSV = async () => {
    try {
      await downloadOrdersCSV();
      toast.info('Exportação gerada em CSV.');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const totals = orders.reduce(
    (acc, order) => {
      if (order.status === 'cancelado') return acc;
      acc.revenue += order.total;
      acc.profit += order.total - order.cost;
      return acc;
    },
    { revenue: 0, profit: 0 },
  );

  return (
    <>
      <PageHeader
        eyebrow="Operação"
        title="Pedidos"
        description="Todos os pedidos recebidos pelo site. Atualize o status, registre observações e fale com o cliente pelo WhatsApp."
        actions={
          <>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button variant="primary" onClick={load} loading={loading}>
              Atualizar
            </Button>
          </>
        }
      />

      <Panel className="mb-6" padded={false}>
        <div className="grid gap-4 p-5 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <label className="label" htmlFor="o-search">Buscar</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-leaf-300" />
              <input
                id="o-search"
                className="field pl-10"
                placeholder="Nome, telefone ou código"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="o-status">Status</label>
            <select
              id="o-status"
              className="field"
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="o-from">De</label>
            <input
              id="o-from"
              type="date"
              className="field"
              value={filters.from}
              onChange={(event) => setFilters({ ...filters, from: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="o-to">Até</label>
            <input
              id="o-to"
              type="date"
              className="field"
              value={filters.to}
              onChange={(event) => setFilters({ ...filters, to: event.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-cream-200 px-5 py-3.5 text-[0.82rem] text-leaf-500">
          <span>
            <strong className="text-leaf-900">{orders.length}</strong> pedidos listados
          </span>
          <span>
            Receita: <strong className="text-leaf-900">{brl(totals.revenue)}</strong>
          </span>
          <span>
            Lucro estimado: <strong className="text-sage-600">{brl(totals.profit)}</strong>
          </span>
          <button
            type="button"
            onClick={() => setFilters({ status: '', search: '', from: '', to: '' })}
            className="ml-auto text-[0.78rem] font-semibold text-lime-600 hover:text-lime-500"
          >
            Limpar filtros
          </button>
        </div>
      </Panel>

      <Panel padded={false}>
        {loading && orders.length === 0 ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-xl bg-cream-200" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-[1rem] text-leaf-800">Nenhum pedido encontrado</p>
            <p className="mt-2 text-[0.85rem] text-leaf-500">
              Ajuste os filtros ou aguarde novos pedidos chegarem pelo site.
            </p>
          </div>
        ) : (
          <Table head={['Pedido', 'Cliente', 'Entrega', 'Data', 'Itens', 'Total', 'Status', '']}>
            {orders.map((order) => (
              <tr key={order.id} className="transition hover:bg-cream-200/40">
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => openOrder(order)}
                    className="font-semibold text-leaf-900 hover:text-lime-600"
                  >
                    {order.code}
                  </button>
                </td>
                <td className="px-4 py-3 text-[0.86rem] text-leaf-700">
                  {order.customerName}
                  <span className="block text-[0.74rem] text-leaf-400">
                    {maskPhone(order.customerPhone)}
                  </span>
                </td>
                <td className="px-4 py-3 text-[0.82rem] text-leaf-600">
                  {order.deliveryType === 'pickup' ? 'Retirada' : 'Entrega'}
                  {order.deliveryType === 'delivery' && order.address.district && (
                    <span className="block text-[0.74rem] text-leaf-400">{order.address.district}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[0.82rem] text-leaf-500">
                  {formatDate(order.createdAt, { withTime: true })}
                </td>
                <td className="px-4 py-3 text-[0.82rem] text-leaf-600">
                  {order.items.reduce((sum, item) => sum + item.qty, 0)} un
                </td>
                <td className="px-4 py-3 font-semibold text-leaf-900">{brl(order.total)}</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={async (event) => {
                      try {
                        const updated = await adminApi.updateOrder(order.id, { status: event.target.value });
                        setOrders((current) => current.map((o) => (o.id === updated.id ? updated : o)));
                        toast.success(`${order.code} → ${event.target.value}`);
                      } catch (error) {
                        toast.error(error.message);
                      }
                    }}
                    className="rounded-full border border-cream-300 bg-white px-2.5 py-1 text-[0.74rem] font-semibold text-leaf-700"
                  >
                    {STATUS_OPTIONS.slice(1).map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => openOrder(order)}
                    className="text-[0.78rem] font-semibold text-lime-600 hover:text-lime-500"
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      {/* Detalhes do pedido */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Pedido ${selected.code}` : ''}
        description={selected ? `Recebido em ${formatDate(selected.createdAt, { withTime: true })}` : ''}
        size="lg"
        footer={
          selected && (
            <>
              <Button variant="danger" onClick={() => remove(selected)}>
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => setSelected(null)}>
                Fechar
              </Button>
              <Button variant="lime" onClick={save} loading={saving}>
                Salvar alterações
              </Button>
            </>
          )
        }
      >
        {selected && draft && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={selected.status} />
              <span className="chip">{selected.deliveryType === 'pickup' ? 'Retirada' : 'Entrega'}</span>
              <span className="chip">{PAYMENT_LABEL[selected.paymentMethod] ?? selected.paymentMethod}</span>
              <WhatsAppButton
                phone={selected.customerPhone}
                message={`Olá ${selected.customerName.split(' ')[0]}! Sobre o seu pedido ${selected.code} na Healthy Menu Floripa:`}
              >
                Falar com o cliente
              </WhatsAppButton>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-cream-300 bg-white p-4">
                <h3 className="text-[0.72rem] font-bold uppercase tracking-wider text-lime-600">
                  Cliente
                </h3>
                <p className="mt-2 text-[0.92rem] font-semibold text-leaf-900">{selected.customerName}</p>
                <p className="text-[0.84rem] text-leaf-600">{maskPhone(selected.customerPhone)}</p>
                {selected.customerEmail && (
                  <p className="text-[0.84rem] text-leaf-600">{selected.customerEmail}</p>
                )}
                {selected.customerCpf && (
                  <p className="text-[0.84rem] text-leaf-600">CPF: {selected.customerCpf}</p>
                )}
              </div>

              <div className="rounded-2xl border border-cream-300 bg-white p-4">
                <h3 className="text-[0.72rem] font-bold uppercase tracking-wider text-lime-600">
                  {selected.deliveryType === 'pickup' ? 'Retirada' : 'Endereço de entrega'}
                </h3>
                {selected.deliveryType === 'pickup' ? (
                  <p className="mt-2 text-[0.86rem] text-leaf-600">
                    Cliente retira no Rio Vermelho (São João).
                  </p>
                ) : (
                  <p className="mt-2 text-[0.86rem] leading-relaxed text-leaf-600">
                    {selected.address.address}, {selected.address.addressNumber}
                    {selected.address.complement ? ` — ${selected.address.complement}` : ''}
                    <br />
                    {selected.address.district} · {selected.address.city}/{selected.address.state}
                    <br />
                    CEP {selected.address.zip}
                  </p>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-cream-300 bg-white">
              <table className="w-full text-left text-[0.86rem]">
                <thead>
                  <tr className="border-b border-cream-200 text-[0.7rem] uppercase tracking-wider text-lime-600">
                    <th className="px-4 py-2.5">Item</th>
                    <th className="px-4 py-2.5 text-center">Qtd</th>
                    <th className="px-4 py-2.5 text-right">Unitário</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                    <th className="px-4 py-2.5 text-right">Custo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {selected.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-leaf-800">{item.name}</span>
                        {item.unit && (
                          <span className="block text-[0.74rem] text-leaf-400">{item.unit}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">{item.qty}</td>
                      <td className="px-4 py-2.5 text-right">{brl(item.unitPrice)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold">{brl(item.total)}</td>
                      <td className="px-4 py-2.5 text-right text-leaf-400">{brl(item.unitCost * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <label className="label" htmlFor="d-status">Status do pedido</label>
                  <select
                    id="d-status"
                    className="field"
                    value={draft.status}
                    onChange={(event) => setDraft({ ...draft, status: event.target.value })}
                  >
                    {STATUS_OPTIONS.slice(1).map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="d-payment">Forma de pagamento</label>
                  <select
                    id="d-payment"
                    className="field"
                    value={draft.paymentMethod}
                    onChange={(event) => setDraft({ ...draft, paymentMethod: event.target.value })}
                  >
                    {Object.entries(PAYMENT_LABEL).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label" htmlFor="d-fee">Frete (R$)</label>
                    <input
                      id="d-fee"
                      type="number"
                      step="0.01"
                      min="0"
                      className="field"
                      value={draft.deliveryFee}
                      onChange={(event) => setDraft({ ...draft, deliveryFee: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="d-discount">Desconto (R$)</label>
                    <input
                      id="d-discount"
                      type="number"
                      step="0.01"
                      min="0"
                      className="field"
                      value={draft.discount}
                      onChange={(event) => setDraft({ ...draft, discount: event.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="label" htmlFor="d-notes">Observações internas</label>
                  <textarea
                    id="d-notes"
                    rows={4}
                    className="field resize-none"
                    value={draft.notes}
                    onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                    placeholder="Ex.: pagamento confirmado no Pix às 19h40 / entregar após 20h"
                  />
                </div>

                <dl className="rounded-2xl bg-cream-200/70 p-4 text-[0.86rem]">
                  <div className="flex justify-between py-1">
                    <dt className="text-leaf-500">Subtotal</dt>
                    <dd>{brl(selected.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-leaf-500">Frete</dt>
                    <dd>{brl(Number(draft.deliveryFee) || 0)}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-leaf-500">Desconto</dt>
                    <dd>- {brl(Number(draft.discount) || 0)}</dd>
                  </div>
                  <div className="mt-1 flex justify-between border-t border-cream-300 pt-2 text-base font-bold">
                    <dt>Total</dt>
                    <dd>
                      {brl(
                        Math.max(
                          0,
                          selected.subtotal + (Number(draft.deliveryFee) || 0) - (Number(draft.discount) || 0),
                        ),
                      )}
                    </dd>
                  </div>
                  <div className="mt-2 flex justify-between text-[0.82rem]">
                    <dt className="text-leaf-500">Custo dos produtos</dt>
                    <dd className="text-leaf-600">{brl(selected.cost)}</dd>
                  </div>
                  <div className="flex justify-between text-[0.82rem] font-semibold">
                    <dt className="text-leaf-600">Lucro bruto</dt>
                    <dd
                      className={cx(
                        Math.max(
                          0,
                          selected.subtotal + (Number(draft.deliveryFee) || 0) - (Number(draft.discount) || 0),
                        ) -
                          selected.cost >=
                          0
                          ? 'text-sage-600'
                          : 'text-red-600',
                      )}
                    >
                      {brl(
                        Math.max(
                          0,
                          selected.subtotal + (Number(draft.deliveryFee) || 0) - (Number(draft.discount) || 0),
                        ) - selected.cost,
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

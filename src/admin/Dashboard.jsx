import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Package,
  PiggyBank,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

import { BarChart, PageHeader, Panel, ProgressRow, StatCard, StatusPill, Table } from './components.jsx';
import { adminApi } from '../lib/api.js';
import { brl, categoryLabel, cx, formatDate, numberBR, PAYMENT_LABEL, todayISO } from '../lib/format.js';

const RANGES = [
  { id: 7, label: '7 dias' },
  { id: 30, label: '30 dias' },
  { id: 90, label: '90 dias' },
];

export default function Dashboard() {
  const [days, setDays] = useState(30);
  const [custom, setCustom] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => {
    if (custom?.from && custom?.to) return custom;
    return { from: todayISO(-(days - 1)), to: todayISO(0) };
  }, [days, custom]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    adminApi
      .dashboard(range)
      .then((result) => alive && setData(result))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [range]);

  const kpi = data?.kpi;

  return (
    <>
      <PageHeader
        eyebrow="Painel"
        title="Visão geral do negócio"
        description="Acompanhe faturamento, lucro, produtos mais vendidos e os pedidos que chegaram pelo site."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {RANGES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setDays(option.id);
                  setCustom(null);
                }}
                className={cx(
                  'rounded-full border px-3.5 py-1.5 text-[0.8rem] font-semibold transition',
                  !custom && days === option.id
                    ? 'border-leaf-900 bg-leaf-900 text-cream-100'
                    : 'border-cream-300 bg-white text-leaf-600 hover:border-leaf-300',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-card border border-cream-300 bg-white px-5 py-4 shadow-soft">
        <div>
          <label className="label" htmlFor="from">De</label>
          <input
            id="from"
            type="date"
            className="field"
            value={range.from}
            onChange={(event) => setCustom({ from: event.target.value, to: range.to })}
          />
        </div>
        <div>
          <label className="label" htmlFor="to">Até</label>
          <input
            id="to"
            type="date"
            className="field"
            value={range.to}
            onChange={(event) => setCustom({ from: range.from, to: event.target.value })}
          />
        </div>
        <p className="text-[0.8rem] text-leaf-500">
          Período analisado: <strong className="text-leaf-800">{formatDate(range.from)}</strong> a{' '}
          <strong className="text-leaf-800">{formatDate(range.to)}</strong>
        </p>
      </div>

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-card bg-cream-200" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              tone="accent"
              label="Faturamento"
              value={brl(kpi?.revenue)}
              hint={`${numberBR(kpi?.orders)} pedidos · ticket ${brl(kpi?.avgTicket)}`}
              icon={TrendingUp}
            />
            <StatCard
              label="Lucro líquido"
              value={brl(kpi?.netProfit)}
              hint={`Margem de ${kpi?.margin ?? 0}% sobre a receita`}
              tone={kpi?.netProfit >= 0 ? 'sage' : 'danger'}
              icon={PiggyBank}
            />
            <StatCard
              label="Despesas lançadas"
              value={brl(kpi?.expenses)}
              hint={`Custo dos produtos: ${brl(kpi?.productCost)}`}
              icon={Wallet}
            />
            <StatCard
              label="Itens vendidos"
              value={numberBR(kpi?.itemsSold)}
              hint={`${kpi?.pending ?? 0} pedidos aguardando ação`}
              icon={Package}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Panel
              title="Faturamento por dia"
              description="Vendas confirmadas no período (pedidos cancelados não entram na conta)."
            >
              <BarChart data={data.byDay} />
            </Panel>

            <Panel title="Produtos mais vendidos" description="Ranking por quantidade no período.">
              {data.topProducts.length === 0 ? (
                <p className="py-6 text-center text-[0.85rem] text-leaf-400">
                  Nenhuma venda registrada ainda.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.topProducts.map((product) => (
                    <ProgressRow
                      key={product.name}
                      label={product.name}
                      value={product.revenue}
                      total={data.topProducts[0].revenue}
                      hint={`${numberBR(product.qty)} un · ${brl(product.revenue)}`}
                    />
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Panel title="Por categoria">
              {data.byCategory.length === 0 ? (
                <p className="py-4 text-[0.85rem] text-leaf-400">Sem dados.</p>
              ) : (
                <div className="space-y-4">
                  {data.byCategory.map((row) => (
                    <ProgressRow
                      key={row.category}
                      label={categoryLabel(row.category)}
                      value={row.revenue}
                      total={data.byCategory[0].revenue}
                      hint={`${numberBR(row.qty)} un · ${brl(row.revenue)}`}
                    />
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Formas de pagamento">
              {data.byPayment.length === 0 ? (
                <p className="py-4 text-[0.85rem] text-leaf-400">Sem dados.</p>
              ) : (
                <div className="space-y-4">
                  {data.byPayment.map((row) => (
                    <ProgressRow
                      key={row.method}
                      label={PAYMENT_LABEL[row.method] ?? row.method}
                      value={row.revenue}
                      total={data.byPayment[0].revenue}
                      hint={`${row.orders} pedidos`}
                    />
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Status dos pedidos">
              <div className="space-y-2.5">
                {Object.entries(data.statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <StatusPill status={status} />
                    <span className="text-[0.9rem] font-semibold text-leaf-900">{count}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/admin/pedidos"
                className="mt-5 inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-lime-600 hover:text-lime-500"
              >
                Gerenciar pedidos
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Panel>
          </div>

          <Panel
            className="mt-6"
            padded={false}
            title="Últimos pedidos"
            description="Os 8 pedidos mais recentes registrados pelo site."
            actions={
              <Link
                to="/admin/pedidos"
                className="text-[0.82rem] font-semibold text-lime-600 hover:text-lime-500"
              >
                Ver todos
              </Link>
            }
          >
            {data.recentOrders.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[0.9rem] text-leaf-500">Ainda não há pedidos.</p>
                <p className="mt-1 text-[0.8rem] text-leaf-400">
                  Quando alguém finalizar o carrinho no site, o pedido aparece aqui automaticamente.
                </p>
              </div>
            ) : (
              <Table head={['Pedido', 'Cliente', 'Data', 'Pagamento', 'Total', 'Status']}>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-cream-200/40">
                    <td className="px-4 py-3 font-semibold text-leaf-900">{order.code}</td>
                    <td className="px-4 py-3 text-[0.86rem] text-leaf-700">
                      {order.customerName}
                      <span className="block text-[0.74rem] text-leaf-400">
                        {order.deliveryType === 'pickup' ? 'Retirada' : 'Entrega'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[0.82rem] text-leaf-500">
                      {formatDate(order.createdAt, { withTime: true })}
                    </td>
                    <td className="px-4 py-3 text-[0.82rem] text-leaf-600">
                      {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                    </td>
                    <td className="px-4 py-3 font-semibold text-leaf-900">{brl(order.total)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={order.status} />
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </Panel>
        </>
      )}
    </>
  );
}

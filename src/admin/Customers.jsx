import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { PageHeader, Panel, StatCard, Table, WhatsAppButton } from './components.jsx';
import { adminApi } from '../lib/api.js';
import { useToast } from '../lib/toast.jsx';
import { brl, formatDate, maskPhone, numberBR, relativeDays } from '../lib/format.js';

export default function Customers() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let alive = true;
    adminApi
      .customers()
      .then((data) => alive && setCustomers(data))
      .catch((error) => alive && toast.error(error.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [toast]);

  const filtered = customers.filter((customer) => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    return (
      customer.name.toLowerCase().includes(term) ||
      customer.phone.includes(term.replace(/\D/g, '') || '###')
    );
  });

  const totals = customers.reduce(
    (acc, customer) => {
      acc.spent += customer.spent;
      acc.orders += customer.orders;
      acc.profit += customer.profit;
      return acc;
    },
    { spent: 0, orders: 0, profit: 0 },
  );

  const repeat = customers.filter((customer) => customer.orders > 1).length;

  return (
    <>
      <PageHeader
        eyebrow="Relacionamento"
        title="Clientes"
        description="Quem compra da Healthy Menu Floripa, quanto gasta e quando foi a última compra."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clientes" value={numberBR(customers.length)} hint="Contatos únicos com pedido" />
        <StatCard label="Receita total" value={brl(totals.spent)} hint={`${numberBR(totals.orders)} pedidos`} />
        <StatCard
          label="Ticket médio"
          value={brl(totals.orders ? totals.spent / totals.orders : 0)}
          hint="Média geral entre todos os clientes"
          tone="caramel"
        />
        <StatCard
          label="Clientes recorrentes"
          value={numberBR(repeat)}
          hint={
            customers.length
              ? `${Math.round((repeat / customers.length) * 100)}% voltaram a comprar`
              : 'Sem dados ainda'
          }
          tone="sage"
        />
      </div>

      <Panel
        className="mt-6"
        padded={false}
        title="Base de clientes"
        actions={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cacao-300" />
            <input
              className="field w-64 pl-10"
              placeholder="Buscar por nome ou telefone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        }
      >
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-xl bg-cream-200" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-[0.95rem] text-cacao-700">Nenhum cliente encontrado</p>
            <p className="mt-2 text-[0.84rem] text-cacao-500">
              Os clientes aparecem aqui automaticamente conforme os pedidos chegam pelo site.
            </p>
          </div>
        ) : (
          <Table head={['Cliente', 'Contato', 'Pedidos', 'Total gasto', 'Ticket médio', 'Última compra', '']}>
            {filtered.map((customer) => (
              <tr key={customer.phone} className="transition hover:bg-cream-200/40">
                <td className="px-4 py-3">
                  <span className="font-semibold text-cacao-900">{customer.name}</span>
                  {customer.email && (
                    <span className="block text-[0.74rem] text-cacao-400">{customer.email}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[0.84rem] text-cacao-600">
                  {maskPhone(customer.phone)}
                </td>
                <td className="px-4 py-3 text-[0.86rem] font-semibold text-cacao-800">
                  {customer.orders}
                </td>
                <td className="px-4 py-3 font-semibold text-cacao-900">{brl(customer.spent)}</td>
                <td className="px-4 py-3 text-[0.84rem] text-cacao-600">{brl(customer.avgTicket)}</td>
                <td className="px-4 py-3 text-[0.82rem] text-cacao-500">
                  {formatDate(customer.lastOrder)}
                  <span className="block text-[0.72rem] text-cacao-400">
                    {relativeDays(customer.lastOrder)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <WhatsAppButton
                    phone={customer.phone}
                    message={`Olá ${customer.name.split(' ')[0]}! Aqui é a Healthy Menu Floripa 🍫 Temos novidades de brownie essa semana, quer dar uma olhada?`}
                  >
                    Mensagem
                  </WhatsAppButton>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </>
  );
}

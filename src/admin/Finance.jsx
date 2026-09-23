import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Pencil, Plus, Trash2 } from 'lucide-react';

import { BarChart, Button, Modal, PageHeader, Panel, ProgressRow, StatCard, Table } from './components.jsx';
import { adminApi, downloadOrdersCSV } from '../lib/api.js';
import { useToast } from '../lib/toast.jsx';
import { brl, cx, formatDate, numberBR, todayISO } from '../lib/format.js';

const EXPENSE_CATEGORIES = [
  'Insumos',
  'Embalagens',
  'Entregas',
  'Operacional',
  'Marketing',
  'Equipamentos',
  'Impostos',
  'Outros',
];

const EMPTY_EXPENSE = {
  date: todayISO(),
  description: '',
  category: 'Insumos',
  amount: '',
  notes: '',
};

export default function Finance() {
  const toast = useToast();
  const [preset, setPreset] = useState(30);
  const [range, setRange] = useState({ from: todayISO(-29), to: todayISO() });
  const [dashboard, setDashboard] = useState(null);
  const [expensesData, setExpensesData] = useState({ expenses: [], total: 0, byCategory: {} });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_EXPENSE);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, expenses] = await Promise.all([
        adminApi.dashboard(range),
        adminApi.expenses(range),
      ]);
      setDashboard(dash);
      setExpensesData(expenses);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [range, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const kpi = dashboard?.kpi;

  const applyPreset = (days) => {
    setPreset(days);
    setRange({ from: todayISO(-(days - 1)), to: todayISO() });
  };

  const openExpense = (expense) => {
    if (expense) {
      setForm({
        date: expense.date,
        description: expense.description,
        category: expense.category,
        amount: expense.amount,
        notes: expense.notes ?? '',
      });
      setEditing(expense);
    } else {
      setForm({ ...EMPTY_EXPENSE, date: todayISO() });
      setEditing({ id: null });
    }
  };

  const saveExpense = async () => {
    if (form.description.trim().length < 3 || Number(form.amount) <= 0) {
      toast.error('Descreva a despesa e informe um valor maior que zero.');
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        await adminApi.updateExpense(editing.id, { ...form, amount: Number(form.amount) });
        toast.success('Despesa atualizada.');
      } else {
        await adminApi.createExpense({ ...form, amount: Number(form.amount) });
        toast.success('Despesa lançada.');
      }
      setEditing(null);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeExpense = async (expense) => {
    if (!window.confirm(`Excluir a despesa "${expense.description}"?`)) return;
    try {
      await adminApi.deleteExpense(expense.id);
      toast.success('Despesa excluída.');
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const exportExpenses = () => {
    const header = ['data', 'descricao', 'categoria', 'valor', 'observacoes'].join(';');
    const lines = expensesData.expenses.map((expense) =>
      [expense.date, expense.description, expense.category, String(expense.amount).replace('.', ','), expense.notes]
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(';'),
    );
    const blob = new Blob([`\uFEFF${[header, ...lines].join('\n')}`], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `despesas-${range.from}-a-${range.to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.info('Despesas exportadas em CSV.');
  };

  const breakEven = useMemo(() => {
    if (!kpi || kpi.avgTicket <= 0) return null;
    const contribution = kpi.avgTicket - kpi.productCost / Math.max(1, kpi.orders);
    if (contribution <= 0) return null;
    return Math.ceil(kpi.expenses / contribution);
  }, [kpi]);

  return (
    <>
      <PageHeader
        eyebrow="Financeiro"
        title="Controle financeiro"
        description="Faturamento, custo de produção, despesas e lucro real da Healthy Menu Floripa no período escolhido."
        actions={
          <>
            <Button variant="outline" onClick={exportExpenses}>
              <Download className="h-4 w-4" />
              Exportar despesas
            </Button>
            <Button variant="outline" onClick={downloadOrdersCSV}>
              <Download className="h-4 w-4" />
              Exportar pedidos
            </Button>
            <Button variant="lime" onClick={() => openExpense(null)}>
              <Plus className="h-4 w-4" />
              Nova despesa
            </Button>
          </>
        }
      />

      <Panel className="mb-6" padded={false}>
        <div className="flex flex-wrap items-end gap-4 p-5">
          <div className="flex flex-wrap gap-2">
            {[
              { days: 7, label: '7 dias' },
              { days: 30, label: '30 dias' },
              { days: 90, label: '90 dias' },
            ].map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() => applyPreset(option.days)}
                className={cx(
                  'rounded-full border px-3.5 py-1.5 text-[0.8rem] font-semibold transition',
                  preset === option.days
                    ? 'border-leaf-900 bg-leaf-900 text-cream-100'
                    : 'border-cream-300 bg-white text-leaf-600 hover:border-leaf-300',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div>
            <label className="label" htmlFor="f-from">De</label>
            <input
              id="f-from"
              type="date"
              className="field"
              value={range.from}
              onChange={(event) => {
                setPreset(null);
                setRange({ ...range, from: event.target.value });
              }}
            />
          </div>
          <div>
            <label className="label" htmlFor="f-to">Até</label>
            <input
              id="f-to"
              type="date"
              className="field"
              value={range.to}
              onChange={(event) => {
                setPreset(null);
                setRange({ ...range, to: event.target.value });
              }}
            />
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="accent"
          label="Receita bruta"
          value={brl(kpi?.revenue)}
          hint={`${numberBR(kpi?.orders)} pedidos · ticket médio ${brl(kpi?.avgTicket)}`}
        />
        <StatCard
          label="Custo dos produtos"
          value={brl(kpi?.productCost)}
          hint={`Lucro bruto de ${brl(kpi?.grossProfit)}`}
        />
        <StatCard
          label="Despesas"
          value={brl(kpi?.expenses)}
          hint={`${expensesData.expenses.length} lançamentos no período`}
        />
        <StatCard
          label="Lucro líquido"
          value={brl(kpi?.netProfit)}
          hint={`Margem de ${kpi?.margin ?? 0}%${breakEven ? ` · equilíbrio em ${breakEven} pedidos` : ''}`}
          tone={(kpi?.netProfit ?? 0) >= 0 ? 'sage' : 'danger'}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Receita por dia" description="Faturamento diário no período selecionado.">
          <BarChart data={dashboard?.byDay ?? []} />
        </Panel>

        <Panel title="Despesas por categoria">
          {Object.keys(expensesData.byCategory).length === 0 ? (
            <p className="py-6 text-center text-[0.85rem] text-leaf-400">
              Nenhuma despesa lançada neste período.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(expensesData.byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([category, total]) => (
                  <ProgressRow
                    key={category}
                    label={category}
                    value={total}
                    total={expensesData.total}
                  />
                ))}
            </div>
          )}
          <div className="mt-5 flex items-center justify-between border-t border-cream-200 pt-4 text-[0.88rem]">
            <span className="font-semibold text-leaf-700">Total de despesas</span>
            <span className="font-display text-xl text-leaf-900">{brl(expensesData.total)}</span>
          </div>
        </Panel>
      </div>

      <Panel
        className="mt-6"
        padded={false}
        title="Lançamentos de despesas"
        description="Insumos, embalagens, entregas e demais custos do período."
      >
        {loading && expensesData.expenses.length === 0 ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-xl bg-cream-200" />
            ))}
          </div>
        ) : expensesData.expenses.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[0.95rem] text-leaf-700">Nenhuma despesa neste período</p>
            <p className="mt-2 text-[0.84rem] text-leaf-500">
              Lance compras de insumos, embalagens e entregas para acompanhar o lucro real.
            </p>
            <Button variant="lime" className="mt-5" onClick={() => openExpense(null)}>
              <Plus className="h-4 w-4" />
              Lançar primeira despesa
            </Button>
          </div>
        ) : (
          <Table head={['Data', 'Descrição', 'Categoria', 'Valor', '']}>
            {expensesData.expenses.map((expense) => (
              <tr key={expense.id} className="transition hover:bg-cream-200/40">
                <td className="px-4 py-3 text-[0.84rem] text-leaf-500">{formatDate(expense.date)}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-leaf-800">{expense.description}</span>
                  {expense.notes && (
                    <span className="block text-[0.74rem] text-leaf-400">{expense.notes}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="chip">{expense.category}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-leaf-900">{brl(expense.amount)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openExpense(expense)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-cream-300 text-leaf-600 transition hover:border-leaf-900"
                      aria-label="Editar despesa"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExpense(expense)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-cream-300 text-leaf-400 transition hover:border-red-400 hover:text-red-600"
                      aria-label="Excluir despesa"
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

      <Panel className="mt-6" title="Resultado do período" description="Como chegamos ao lucro líquido.">
        <dl className="space-y-2.5 text-[0.9rem]">
          {[
            ['Receita bruta de vendas', kpi?.revenue, 'text-leaf-900'],
            ['(-) Custo dos produtos vendidos', -(kpi?.productCost ?? 0), 'text-leaf-600'],
            ['(=) Lucro bruto', kpi?.grossProfit, 'font-semibold text-leaf-900'],
            ['(-) Despesas operacionais', -(kpi?.expenses ?? 0), 'text-leaf-600'],
            ['(=) Lucro líquido', kpi?.netProfit, 'font-bold text-leaf-900'],
          ].map(([label, value, className]) => (
            <div
              key={label}
              className={cx(
                'flex items-center justify-between border-b border-cream-200 pb-2.5 last:border-0',
                className,
              )}
            >
              <dt>{label}</dt>
              <dd>{brl(value)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[0.78rem] leading-relaxed text-leaf-400">
          O custo dos produtos usa o campo “custo de produção” cadastrado em cada produto. Mantenha os
          valores atualizados para que o lucro reflita a realidade.
        </p>
      </Panel>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Editar despesa' : 'Nova despesa'}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button variant="lime" onClick={saveExpense} loading={saving}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div>
            <label className="label" htmlFor="e-date">Data *</label>
            <input
              id="e-date"
              type="date"
              className="field"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="e-description">Descrição *</label>
            <input
              id="e-description"
              className="field"
              placeholder="Ex.: chocolate 50% cacau 1 kg"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="e-category">Categoria</label>
              <select
                id="e-category"
                className="field"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="e-amount">Valor (R$) *</label>
              <input
                id="e-amount"
                type="number"
                step="0.01"
                min="0"
                className="field"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="e-notes">Observações</label>
            <textarea
              id="e-notes"
              rows={3}
              className="field resize-none"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

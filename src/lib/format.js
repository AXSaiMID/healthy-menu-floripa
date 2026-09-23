export const brl = (value) =>
  Number(value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const numberBR = (value) => Number(value ?? 0).toLocaleString('pt-BR');

export const digits = (value) => String(value ?? '').replace(/\D/g, '');

/* -------------------------------- Telefone -------------------------------- */
export function maskPhone(value) {
  const d = digits(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/* ---------------------------------- CPF ---------------------------------- */
export function maskCpf(value) {
  const d = digits(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function isValidCpf(value) {
  const cpf = digits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (len) => {
    let sum = 0;
    for (let i = 0; i < len; i += 1) sum += Number(cpf[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

/* ---------------------------------- CEP ---------------------------------- */
export function maskZip(value) {
  const d = digits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/* ------------------------------ Datas e horas ----------------------------- */
export function formatDate(value, { withTime = false } = {}) {
  if (!value) return '—';
  const iso = String(value).replace(' ', 'T');
  const date = new Date(iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function formatDateShort(value) {
  if (!value) return '—';
  const [y, m, d] = String(value).slice(0, 10).split('-');
  return `${d}/${m}`;
}

export function relativeDays(value) {
  if (!value) return '';
  const iso = String(value).replace(' ', 'T');
  const date = new Date(iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`);
  const diff = Math.round((Date.now() - date.getTime()) / 864e5);
  if (diff <= 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 30) return `há ${diff} dias`;
  const months = Math.round(diff / 30);
  return months <= 1 ? 'há 1 mês' : `há ${months} meses`;
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/* -------------------------------- Diversos -------------------------------- */
export const STATUS_META = {
  novo: { label: 'Novo', tone: 'bg-lime-200 text-leaf-800', dot: 'bg-lime-500' },
  confirmado: { label: 'Confirmado', tone: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  producao: { label: 'Em produção', tone: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  enviado: { label: 'Enviado', tone: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500' },
  entregue: { label: 'Entregue', tone: 'bg-sage-100 text-sage-700', dot: 'bg-sage-500' },
  cancelado: { label: 'Cancelado', tone: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export const PAYMENT_LABEL = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  link: 'Link de pagamento',
};

export const CATEGORY_LABEL = {
  brownies: 'Brownies',
  combos: 'Combos & Presentes',
  salgados: 'Salgados & Wraps',
  refeicoes: 'Refeições Fit',
  'zero-acucar': 'Zero Açúcar',
  bebidas: 'Bebidas',
};

export const categoryLabel = (id) => CATEGORY_LABEL[id] ?? id;

export function cx(...values) {
  return values.filter(Boolean).join(' ');
}

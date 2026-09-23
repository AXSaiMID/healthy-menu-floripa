import { brl } from './format.js';

const PAYMENT_LABEL = {
  pix: 'Pix',
  dinheiro: 'Dinheiro na entrega',
  cartao: 'Cartão (maquininha na entrega)',
  link: 'Link de pagamento',
};

/**
 * Monta a mensagem completa do pedido para o WhatsApp da empresa.
 * O texto usa a formatação nativa do WhatsApp (*negrito*, _itálico_).
 */
export function buildOrderMessage({ order, cart, settings, customer, address, deliveryType, notes, paymentMethod }) {
  const lines = [];

  lines.push('*NOVO PEDIDO · Healthy Menu Floripa*');
  if (order?.code) lines.push(`Pedido n. *${order.code}*`);
  lines.push('');

  lines.push('*ITENS DO PEDIDO*');
  for (const item of cart) {
    lines.push(`• ${item.qty}x ${item.name} — ${brl(item.price * item.qty)}`);
    if (item.unit) lines.push(`   _${item.unit}_`);
  }
  lines.push('');

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  lines.push(`Subtotal: ${brl(subtotal)}`);
  if (order) {
    if (order.deliveryFee > 0) lines.push(`Frete: ${brl(order.deliveryFee)}`);
    if (order.deliveryFee === 0 && deliveryType === 'delivery') lines.push('Frete: _a combinar / grátis_');
    lines.push(`*TOTAL: ${brl(order.total)}*`);
  }
  lines.push('');

  lines.push('*DADOS DO COMPRADOR*');
  lines.push(`Nome: ${customer.name}`);
  lines.push(`WhatsApp: ${customer.phone}`);
  if (customer.email) lines.push(`E-mail: ${customer.email}`);
  if (customer.cpf) lines.push(`CPF: ${customer.cpf}`);
  lines.push('');

  lines.push('*ENTREGA*');
  if (deliveryType === 'pickup') {
    lines.push('Retirada no Rio Vermelho (São João) — combinada pelo WhatsApp');
  } else {
    lines.push('Entrega em domicílio');
    lines.push(`CEP: ${address.zip}`);
    lines.push(`${address.address}, ${address.addressNumber}${address.complement ? ` — ${address.complement}` : ''}`);
    lines.push(`Bairro: ${address.district}`);
    lines.push(`Cidade: ${address.city}/${address.state}`);
  }
  lines.push('');
  lines.push(`Forma de pagamento: ${PAYMENT_LABEL[paymentMethod] ?? paymentMethod}`);
  if (notes) {
    lines.push('');
    lines.push(`*Observações:* ${notes}`);
  }

  lines.push('');
  lines.push('Pedido gerado pelo site 🍫');

  return lines.join('\n');
}

export function whatsappLink(phone, message) {
  const number = String(phone ?? '').replace(/\D/g, '');
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}

export function openWhatsApp(phone, message) {
  const url = whatsappLink(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
  return url;
}

export function simpleMessage(settings, text) {
  const greeting = `Olá, ${settings?.business_name ?? 'Healthy Menu Floripa'}! ${text}`;
  return whatsappLink(settings?.whatsapp, greeting);
}

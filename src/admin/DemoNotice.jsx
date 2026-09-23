import { useState } from 'react';
import { Info, RotateCcw } from 'lucide-react';

import { isStaticMode, resetDemoData } from '../lib/api.js';
import { useToast } from '../lib/toast.jsx';

/**
 * Aviso exibido apenas na versão publicada como arquivos estáticos (Netlify).
 *
 * Nesse modo não existe servidor: o painel lê e grava no localStorage do
 * navegador. Deixamos isso explícito para ninguém confundir com o painel
 * definitivo — e oferecemos o botão que devolve o estado de demonstração.
 */
export default function DemoNotice() {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  if (!isStaticMode) return null;

  const restore = () => {
    setBusy(true);
    resetDemoData?.();
    toast.success('Dados de exemplo restaurados.');
    setTimeout(() => window.location.reload(), 700);
  };

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-lime-300 bg-lime-100/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-lime-700" aria-hidden="true" />
        <div>
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-lime-700">
            Versão de demonstração
          </p>
          <p className="mt-1 max-w-2xl text-[0.82rem] leading-relaxed text-leaf-700">
            Este site está publicado como arquivos estáticos, sem servidor. Pedidos, despesas e alterações de
            produtos ficam salvos <strong>apenas neste navegador</strong> — o pedido do cliente continua chegando
            normalmente no WhatsApp da loja.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={restore}
        disabled={busy}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-leaf-300 bg-white px-3.5 py-2 text-[0.8rem] font-semibold text-leaf-800 transition hover:border-leaf-900 hover:bg-leaf-50 disabled:opacity-60"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        {busy ? 'Restaurando…' : 'Restaurar dados de exemplo'}
      </button>
    </div>
  );
}

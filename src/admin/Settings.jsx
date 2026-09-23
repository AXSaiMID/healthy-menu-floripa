import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';

import { Button, PageHeader, Panel } from './components.jsx';
import { adminApi, authApi } from '../lib/api.js';
import { useToast } from '../lib/toast.jsx';
import { useAuth } from './AdminApp.jsx';
import { brl } from '../lib/format.js';

const GROUPS = [
  {
    title: 'Identidade da empresa',
    description: 'Aparecem no cabeçalho, rodapé e nas mensagens automáticas.',
    fields: [
      { key: 'business_name', label: 'Nome da empresa' },
      { key: 'tagline', label: 'Slogan' },
      { key: 'address_line', label: 'Bairro / endereço curto' },
      { key: 'address_city', label: 'Cidade' },
      { key: 'address_state', label: 'Estado (UF)' },
    ],
  },
  {
    title: 'Contato e redes sociais',
    description: 'WhatsApp recebe os pedidos do site. Use o formato 55 + DDD + número.',
    fields: [
      { key: 'whatsapp', label: 'WhatsApp (somente números)', hint: 'Ex.: 5548920008689' },
      { key: 'whatsapp_display', label: 'WhatsApp exibido no site' },
      { key: 'email', label: 'E-mail de contato' },
      { key: 'instagram', label: 'Link do Instagram' },
      { key: 'instagram_handle', label: 'Usuário do Instagram' },
      { key: 'google_maps', label: 'Link do Google Maps' },
      { key: 'reviews_summary', label: 'Resumo das avaliações' },
    ],
  },
  {
    title: 'Vendas, entregas e envios',
    description: 'Regras usadas no cálculo do carrinho e nos textos de entrega.',
    fields: [
      { key: 'min_order', label: 'Pedido mínimo para entrega (R$)', type: 'number' },
      { key: 'delivery_fee', label: 'Taxa de entrega na Ilha (R$)', type: 'number' },
      { key: 'free_delivery_from', label: 'Frete grátis a partir de (R$)', type: 'number' },
      { key: 'pix_key', label: 'Chave Pix' },
      { key: 'pickup_note', label: 'Texto sobre retirada' },
      { key: 'address_note', label: 'Bairros atendidos (texto)', type: 'textarea' },
      { key: 'national_shipping', label: 'Texto sobre envio nacional', type: 'textarea' },
    ],
  },
  {
    title: 'Conteúdo do site',
    description: 'Textos longos exibidos nas páginas públicas.',
    fields: [
      { key: 'about_story', label: 'História da empresa', type: 'textarea' },
      { key: 'opening_hours', label: 'Horários (separe os dias com | )', type: 'textarea' },
    ],
  },
];

export default function Settings() {
  const toast = useToast();
  const { admin } = useAuth();
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    let alive = true;
    adminApi
      .settings()
      .then((data) => alive && setValues(data))
      .catch((error) => alive && toast.error(error.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [toast]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await adminApi.saveSettings(values);
      setValues(updated);
      toast.success('Configurações salvas. O site já está atualizado.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.newPassword.length < 6) {
      toast.error('A nova senha precisa ter ao menos 6 caracteres.');
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('A confirmação não confere com a nova senha.');
      return;
    }
    setChanging(true);
    try {
      await authApi.changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Senha alterada com sucesso.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setChanging(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Painel"
        title="Configurações"
        description="Dados da empresa, contatos, regras de entrega e textos do site. As alterações valem imediatamente."
        actions={
          <Button variant="caramel" onClick={save} loading={saving}>
            <Save className="h-4 w-4" />
            Salvar alterações
          </Button>
        }
      />

      <div className="mb-6 rounded-card border border-caramel-300 bg-caramel-100/70 px-5 py-4">
        <p className="text-[0.85rem] leading-relaxed text-cacao-700">
          Confira se o número do WhatsApp está no formato internacional (
          <strong>55 + DDD + número</strong>) — é para ele que todos os pedidos do site são enviados.
          Hoje os pedidos chegam em{' '}
          <strong>{values.whatsapp_display || values.whatsapp || '—'}</strong>.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-card bg-cream-200" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {GROUPS.map((group) => (
            <Panel key={group.title} title={group.title} description={group.description}>
              <div className="grid gap-5 lg:grid-cols-2">
                {group.fields.map((field) => (
                  <div
                    key={field.key}
                    className={field.type === 'textarea' ? 'lg:col-span-2' : undefined}
                  >
                    <label className="label" htmlFor={`s-${field.key}`}>
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={`s-${field.key}`}
                        rows={3}
                        className="field resize-none"
                        value={values[field.key] ?? ''}
                        onChange={(event) =>
                          setValues({ ...values, [field.key]: event.target.value })
                        }
                      />
                    ) : (
                      <input
                        id={`s-${field.key}`}
                        type={field.type ?? 'text'}
                        step="0.01"
                        min="0"
                        className="field"
                        value={values[field.key] ?? ''}
                        onChange={(event) =>
                          setValues({ ...values, [field.key]: event.target.value })
                        }
                      />
                    )}
                    {field.hint && (
                      <p className="mt-1 text-[0.72rem] text-cacao-400">{field.hint}</p>
                    )}
                  </div>
                ))}
              </div>

              {group.title === 'Vendas, entregas e envios' && (
                <p className="mt-5 rounded-xl bg-cream-200/70 px-4 py-3 text-[0.8rem] text-cacao-600">
                  Prévia: pedido mínimo {brl(Number(values.min_order) || 0)} · taxa de entrega{' '}
                  {brl(Number(values.delivery_fee) || 0)} · frete grátis a partir de{' '}
                  {brl(Number(values.free_delivery_from) || 0)}.
                </p>
              )}
            </Panel>
          ))}

          <div className="flex justify-end">
            <Button variant="caramel" size="lg" onClick={save} loading={saving}>
              <Save className="h-4 w-4" />
              Salvar alterações
            </Button>
          </div>

          <Panel
            title="Acesso ao painel"
            description={`Você está conectado como ${admin?.email ?? ''}.`}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="pw-current">Senha atual</label>
                <input
                  id="pw-current"
                  type="password"
                  className="field"
                  value={passwords.currentPassword}
                  onChange={(event) =>
                    setPasswords({ ...passwords, currentPassword: event.target.value })
                  }
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="label" htmlFor="pw-new">Nova senha</label>
                <input
                  id="pw-new"
                  type="password"
                  className="field"
                  value={passwords.newPassword}
                  onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="label" htmlFor="pw-confirm">Confirmar nova senha</label>
                <input
                  id="pw-confirm"
                  type="password"
                  className="field"
                  value={passwords.confirm}
                  onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button variant="primary" className="mt-5" onClick={changePassword} loading={changing}>
              Alterar senha
            </Button>

            <p className="mt-4 text-[0.78rem] leading-relaxed text-cacao-400">
              A senha inicial de demonstração é <strong>healthy2024</strong>. Recomendamos trocá-la no
              primeiro acesso para manter o painel protegido.
            </p>
          </Panel>
        </div>
      )}
    </>
  );
}

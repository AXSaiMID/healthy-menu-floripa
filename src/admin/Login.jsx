import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, Spinner, WhatsAppIcon } from '../components/ui.jsx';
import { Logo } from '../components/Logo.jsx';
import { FloatingDecor, GradientBlobs } from '../components/motion.jsx';
import { authApi } from '../lib/api.js';

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      onSuccess(data.admin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-leaf-950 lg:grid-cols-2">
      {/* Painel visual */}
      <div className="relative hidden overflow-hidden bg-leaf-950 lg:block">
        <img
          src="/images/hero-brownie-fresh.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-leaf-950 via-leaf-950/80 to-leaf-950/40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo tone="light" showTagline />

          <div>
            <h1 className="max-w-md text-4xl leading-tight text-cream-100">
              Painel da empresa e controle financeiro
            </h1>
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-cream-200/80">
              Acompanhe as vendas, atualize o cardápio, lance despesas e acompanhe o lucro real da
              Healthy Menu Floripa — tudo em um só lugar.
            </p>
          </div>

          <p className="text-[0.78rem] text-cream-200/50">
            © {new Date().getFullYear()} Healthy Menu Floripa · Florianópolis/SC
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="relative flex items-center justify-center overflow-hidden bg-cream-100 px-6 py-16">
        <GradientBlobs className="opacity-50" />
        <div className="relative w-full max-w-sm">
          <p className="eyebrow">Área restrita</p>
          <h2 className="mt-2 text-3xl text-leaf-900">Entrar no painel</h2>
          <p className="mt-3 text-[0.88rem] text-leaf-500">
            Use o e-mail e a senha da equipe Healthy Menu Floripa.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="label" htmlFor="admin-email">E-mail</label>
              <input
                id="admin-email"
                type="email"
                className="field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@healthymenufloripa.com.br"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="admin-password">Senha</label>
              <input
                id="admin-password"
                type="password"
                className="field"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[0.82rem] font-medium text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Spinner /> : null}
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-8 rounded-2xl border border-dashed border-lime-300 bg-lime-100/60 p-4">
            <p className="text-[0.72rem] font-bold uppercase tracking-wider text-lime-600">
              Acesso de demonstração
            </p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-leaf-700">
              E-mail: <strong>admin@healthymenufloripa.com.br</strong>
              <br />
              Senha: <strong>healthy2024</strong>
            </p>
            <p className="mt-2 text-[0.72rem] leading-relaxed text-leaf-500">
              Troque a senha em Configurações depois do primeiro acesso.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between text-[0.78rem]">
            <Link to="/" className="text-leaf-500 transition hover:text-leaf-800">
              ← Voltar para o site
            </Link>
            <a
              href="https://wa.me/5548920008689"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-leaf-500 transition hover:text-[#128C4A]"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

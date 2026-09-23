import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import SiteLayout from './components/SiteLayout.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import About from './pages/About.jsx';
import Delivery from './pages/Delivery.jsx';
import Contact from './pages/Contact.jsx';
import CartPage from './pages/CartPage.jsx';
import NotFound from './pages/NotFound.jsx';

/* O painel administrativo é carregado sob demanda — o site público não paga esse peso. */
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

function Loading() {
  return (
    <div className="grid min-h-[50vh] place-items-center bg-cream-100">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-cacao-300 border-t-cacao-900" />
        <p className="text-sm text-cacao-500">Carregando…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<Loading />}>
            <AdminApp />
          </Suspense>
        }
      />

      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cardapio" element={<Menu />} />
        <Route path="/produto/:slug" element={<ProductDetail />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/entregas" element={<Delivery />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

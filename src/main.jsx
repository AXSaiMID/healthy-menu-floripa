import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import '@fontsource-variable/fraunces';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/caveat';
import './index.css';

import App from './App.jsx';
import { SiteProvider } from './lib/site.jsx';
import { CartProvider } from './lib/cart.jsx';
import { ToastProvider } from './lib/toast.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <SiteProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </SiteProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

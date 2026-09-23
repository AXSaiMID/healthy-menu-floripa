import express from 'express';
import { get, run } from '../db.js';
import {
  SESSION_COOKIE,
  adminFromRequest,
  createSession,
  destroySession,
  hashPassword,
  purgeExpiredSessions,
  requireAdmin,
  verifyPassword,
} from '../auth.js';

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE === 'true',
};

/* ------------------------------- POST /login ------------------------------- */
router.post('/login', (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const admin = get('SELECT * FROM admins WHERE lower(email) = ?', [email]);
  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }

  purgeExpiredSessions();
  const { token, expires } = createSession(admin.id);
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, expires });
  res.json({ admin: { id: admin.id, name: admin.name, email: admin.email } });
});

/* ------------------------------- POST /logout ------------------------------ */
router.post('/logout', (req, res) => {
  destroySession(req.cookies?.[SESSION_COOKIE]);
  res.clearCookie(SESSION_COOKIE, cookieOptions);
  res.json({ ok: true });
});

/* --------------------------------- GET /me -------------------------------- */
router.get('/me', (req, res) => {
  const admin = adminFromRequest(req);
  if (!admin) return res.status(401).json({ error: 'Não autenticado.' });
  res.json({ admin: { id: admin.id, name: admin.name, email: admin.email } });
});

/* ------------------------- PUT /password (trocar senha) ------------------------- */
router.put('/password', requireAdmin, (req, res) => {
  const current = String(req.body?.currentPassword ?? '');
  const next = String(req.body?.newPassword ?? '');

  if (next.length < 6) {
    return res.status(400).json({ error: 'A nova senha precisa ter ao menos 6 caracteres.' });
  }

  const admin = get('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
  if (!admin || !verifyPassword(current, admin.password_hash)) {
    return res.status(401).json({ error: 'Senha atual incorreta.' });
  }

  run('UPDATE admins SET password_hash = ? WHERE id = ?', [hashPassword(next), admin.id]);
  res.json({ ok: true });
});

export default router;

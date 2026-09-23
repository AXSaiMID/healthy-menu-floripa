import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { all, get, run } from './db.js';

export const SESSION_COOKIE = 'hmf_session';
const SESSION_DAYS = 14;

export function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain, hash) {
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

export function createSession(adminId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  run('INSERT INTO sessions (token, admin_id, expires_at) VALUES (?, ?, ?)', [
    token,
    adminId,
    expires.toISOString(),
  ]);
  return { token, expires };
}

export function destroySession(token) {
  if (!token) return;
  run('DELETE FROM sessions WHERE token = ?', [token]);
}

export function adminFromRequest(req) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const row = get(
    `SELECT s.token, s.expires_at, a.id, a.name, a.email
       FROM sessions s
       JOIN admins a ON a.id = s.admin_id
      WHERE s.token = ?`,
    [token],
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    destroySession(token);
    return null;
  }
  return { id: row.id, name: row.name, email: row.email, token: row.token };
}

export function requireAdmin(req, res, next) {
  const admin = adminFromRequest(req);
  if (!admin) {
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }
  req.admin = admin;
  next();
}

export function purgeExpiredSessions() {
  run("DELETE FROM sessions WHERE expires_at < datetime('now')");
}

export function countAdmins() {
  return get('SELECT COUNT(*) AS n FROM admins')?.n ?? 0;
}

export { all, get, run };

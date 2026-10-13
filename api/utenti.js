// =====================================================
// api/utenti.js · funzione serverless di Vercel (Node, nessuna dipendenza)
// Serve a creare/gestire gli account dei ristoratori: richiede la chiave
// service_role, che deve stare SOLO nelle Environment Variables di Vercel.
// Solo un utente con ruolo "admin" può chiamarla.
// =====================================================
const crypto = require('crypto');

const BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DEFAULT_CATS = ['Antipasti', 'Primi piatti', 'Secondi piatti', 'Contorni', 'Pizze', 'Dolci', 'Bevande'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (status, message) => Object.assign(new Error(message), { status });

async function call(url, opt = {}) {
  const r = await fetch(BASE + url, {
    ...opt,
    headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', ...(opt.headers || {}) }
  });
  const t = await r.text();
  let j = null; try { j = t ? JSON.parse(t) : null; } catch { }
  return { ok: r.ok, status: r.status, body: j };
}
async function rest(method, path, body) {
  const r = await call('/rest/v1/' + path, { method, body: body ? JSON.stringify(body) : undefined, headers: { Prefer: 'return=representation' } });
  if (!r.ok) throw fail(400, (r.body && (r.body.message || r.body.error)) || 'Errore database');
  return r.body;
}
async function authAdmin(method, path, body) {
  const r = await call('/auth/v1/admin/' + path, { method, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) {
    const m = (r.body && (r.body.msg || r.body.message || r.body.error_description || r.body.error)) || 'Errore account';
    throw fail(400, /already|exists|registered/i.test(m) ? 'Esiste già un account con questa email' : m);
  }
  return r.body;
}

// verifica che chi chiama sia un amministratore loggato
async function verifyAdmin(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) throw fail(401, 'Accesso richiesto');
  const u = await fetch(BASE + '/auth/v1/user', { headers: { apikey: KEY, Authorization: 'Bearer ' + token } });
  if (!u.ok) throw fail(401, 'Sessione scaduta: accedi di nuovo');
  const { id } = await u.json();
  if (!UUID.test(id || '')) throw fail(401, 'Sessione non valida');
  const rows = await rest('GET', `utente?id=eq.${id}&select=ruolo`);
  if (!rows || !rows[0] || rows[0].ruolo !== 'admin') throw fail(403, 'Operazione consentita solo agli amministratori');
}

const token = () => crypto.randomBytes(6).toString('hex'); // 12 caratteri

function needEmail(v) {
  const e = String(v || '').trim().toLowerCase();
  if (!EMAIL.test(e)) throw fail(400, 'Email non valida');
  return e;
}
function needPassword(v) {
  const p = String(v || '');
  if (p.length < 6) throw fail(400, 'La password deve avere almeno 6 caratteri');
  return p;
}
function needId(v) {
  if (!UUID.test(String(v || ''))) throw fail(400, 'Identificativo non valido');
  return v;
}

// crea l'utente di login + la riga in "utente"
async function createOwner(email, password) {
  const u = await authAdmin('POST', 'users', { email, password, email_confirm: true });
  try { await rest('POST', 'utente', { id: u.id, email, ruolo: 'ristoratore' }); }
  catch (e) { await authAdmin('DELETE', 'users/' + u.id).catch(() => { }); throw e; }
  return u.id;
}

const actions = {
  // crea account + ristorante + categorie base + tavoli con codice
  async 'crea-ristorante'(b) {
    const email = needEmail(b.email), password = needPassword(b.password);
    const nome = String(b.nome || '').trim().slice(0, 50);
    if (!nome) throw fail(400, 'Inserisci il nome del ristorante');
    const n = Math.max(1, Math.min(200, parseInt(b.n_tavoli, 10) || 8));
    const ownerId = await createOwner(email, password);
    let rid = null;
    try {
      const [r] = await rest('POST', 'ristorante', {
        id_proprietario: ownerId, nome,
        titolare: String(b.titolare || '').trim().slice(0, 80),
        citta: String(b.citta || '').trim().slice(0, 50),
        n_tavoli: n, id_piano: b.id_piano || 'base',
        scadenza: /^\d{4}-\d{2}-\d{2}$/.test(b.scadenza || '') ? b.scadenza : undefined
      });
      rid = r.id;
      await rest('POST', 'categoria', DEFAULT_CATS.map((nm, i) => ({ id_ristorante: rid, nome: nm, posizione: i })));
      await rest('POST', 'tavolo', Array.from({ length: n }, (_, i) => ({ id_ristorante: rid, numero: i + 1, codice_qr: token() })));
      return { ok: true, id: rid };
    } catch (e) {
      if (rid) await rest('DELETE', 'ristorante?id=eq.' + rid).catch(() => { });
      await authAdmin('DELETE', 'users/' + ownerId).catch(() => { });
      throw e;
    }
  },

  // crea un account per un ristorante che non ce l'ha ancora
  async 'collega-account'(b) {
    const rid = needId(b.id_ristorante), email = needEmail(b.email), password = needPassword(b.password);
    const rows = await rest('GET', `ristorante?id=eq.${rid}&select=id,id_proprietario`);
    if (!rows[0]) throw fail(404, 'Ristorante non trovato');
    if (rows[0].id_proprietario) throw fail(400, 'Questo ristorante ha già un account');
    const ownerId = await createOwner(email, password);
    try { await rest('PATCH', `ristorante?id=eq.${rid}`, { id_proprietario: ownerId }); }
    catch (e) { await authAdmin('DELETE', 'users/' + ownerId).catch(() => { }); throw e; }
    return { ok: true };
  },

  async 'reset-password'(b) {
    const id = needId(b.user_id), password = needPassword(b.password);
    const rows = await rest('GET', `utente?id=eq.${id}&select=ruolo`);
    if (!rows[0] || rows[0].ruolo !== 'ristoratore') throw fail(400, 'Account non valido');
    await authAdmin('PUT', 'users/' + id, { password });
    return { ok: true };
  },

  async 'cambia-email'(b) {
    const id = needId(b.user_id), email = needEmail(b.email);
    const rows = await rest('GET', `utente?id=eq.${id}&select=ruolo`);
    if (!rows[0] || rows[0].ruolo !== 'ristoratore') throw fail(400, 'Account non valido');
    await authAdmin('PUT', 'users/' + id, { email, email_confirm: true });
    await rest('PATCH', `utente?id=eq.${id}`, { email });
    return { ok: true };
  },

  // elimina ristorante (con menù e ordini) e il suo account
  async 'elimina-ristorante'(b) {
    const rid = needId(b.id_ristorante);
    const rows = await rest('GET', `ristorante?id=eq.${rid}&select=id,id_proprietario`);
    if (!rows[0]) throw fail(404, 'Ristorante non trovato');
    await rest('DELETE', `ristorante?id=eq.${rid}`);
    if (rows[0].id_proprietario) {
      const u = await rest('GET', `utente?id=eq.${rows[0].id_proprietario}&select=ruolo`);
      if (u[0] && u[0].ruolo === 'ristoratore') await authAdmin('DELETE', 'users/' + rows[0].id_proprietario);
    }
    return { ok: true };
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });
  if (!BASE || !KEY) return res.status(500).json({ error: 'Mancano SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nelle variabili di Vercel' });
  try {
    await verifyAdmin(req);
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const fn = actions[b.action];
    if (!fn) throw fail(400, 'Azione non valida');
    return res.status(200).json(await fn(b));
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message || 'Errore del server' });
  }
};

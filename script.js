/* =====================================================
   MenuPro v2.1 · Admin + Ristoratore + Cliente (solo da QR)
   I dati stanno nel localStorage del browser: per usarlo
   tra dispositivi diversi serve un database online.
   ===================================================== */

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config.js"></script>
<script src="script.js"></script>
const KEY = 'menupro_admin_v1';          // stessa chiave della versione precedente: i dati restano
const THEME_KEY = 'menupro_theme';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ===== Date, soldi, testo ===== */
const pad = n => String(n).padStart(2, '0');
const dkey = t => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const today = () => dkey(Date.now());
const pd = d => (typeof d === 'string' && d.length === 10) ? new Date(d + 'T00:00:00') : new Date(d);
const addMonths = (d, n) => {
  const x = pd(d), day = x.getDate();
  x.setDate(1); x.setMonth(x.getMonth() + n);
  x.setDate(Math.min(day, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate()));
  return dkey(x);
};
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const eur = n => Number(n).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
const fdate = d => pd(d).toLocaleDateString('it-IT');
const ftime = t => new Date(t).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
const isToday = t => dkey(t) === today();
const ago = t => { const m = Math.floor((Date.now() - t) / 60000); return m < 1 ? 'adesso' : m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + pad(m % 60) + ' min'; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const validColor = c => /^#[0-9a-f]{6}$/i.test(c) ? c : '#0f5c4a';
const round2 = n => Math.round(n * 100) / 100;

/* ===== Icone (SVG inline) ===== */
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  book: '<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
  settings: '<path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  orders: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="9" rx="2"/><path d="M7 15h10v6H7z"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M21 14v1M14 21h1M18 18h3v3"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  volume: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>',
  mute: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/>',
  ext: '<path d="M14 4h6v6M20 4 10 14M18 14v6H4V6h6"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  wave: '<path d="M7 11V5a2 2 0 0 1 4 0v5M11 10V4a2 2 0 0 1 4 0v7M15 10V6a2 2 0 0 1 4 0v8a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L3 14a2 2 0 0 1 3-2.6L7 12"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>'
};
const ic = (n, s = 18) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
const hydrateIcons = () => $$('i[data-ic]').forEach(i => i.outerHTML = ic(i.dataset.ic));

/* ===== Tema chiaro / scuro (solo aree admin e ristoratore) ===== */
const applyTheme = t => {
  document.documentElement.dataset.theme = t;
  const m = document.querySelector('meta[name=theme-color]');
  if (m) m.content = t === 'dark' ? '#0b1612' : '#0f5c4a';
};
const getTheme = () => {
  try { const s = localStorage.getItem(THEME_KEY); if (s) return s; } catch { }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
applyTheme(getTheme());

/* ===== Colore del ristorante (area cliente) =====
   Calcolato qui, senza color-mix, così funziona anche sui telefoni più vecchi.
   Il testo sull'intestazione si adatta: scuro se il colore scelto è chiaro. */
const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
const mix = (c, t, p) => { const a = hx(c), b = hx(t); return toHex(a.map((v, i) => v * (1 - p) + b[i] * p)); };
const lum = c => {
  const [r, g, b] = hx(c).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
  return .2126 * r + .7152 * g + .0722 * b;
};
function setBrand(c) {
  const s = document.body.style;
  s.setProperty('--brand', c);
  s.setProperty('--brand-2', mix(c, '#ffffff', .89));
  s.setProperty('--brand-text', lum(c) > .2 ? mix(c, '#000000', .4) : c);
  s.setProperty('--on', lum(c) > .45 ? '#16231d' : '#ffffff');
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = c;
}
function clearBrand() {
  ['--brand', '--brand-2', '--brand-text', '--on'].forEach(v => document.body.style.removeProperty(v));
  applyTheme(getTheme());
}

/* ===== Foto dei piatti ===== */
const validImg = v => typeof v === 'string' && /^(https?:\/\/\S+|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+)$/i.test(v) ? v : '';
/* le foto salvate nel browser vengono trasformate una sola volta in un indirizzo breve (blob:), così la pagina resta leggera */
const imgCache = new Map();
function imgSrc(v) {
  if (!v) return '';
  if (!v.startsWith('data:')) return v;
  let u = imgCache.get(v);
  if (!u) {
    try {
      const [h, b] = v.split(','), mime = h.match(/data:(.*?);/)[1], bin = atob(b), arr = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) arr[k] = bin.charCodeAt(k);
      u = URL.createObjectURL(new Blob([arr], { type: mime }));
      imgCache.set(v, u);
    } catch { return ''; }
  }
  return u;
}
function loadImage(file) {
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(file), im = new Image();
    im.onload = () => { URL.revokeObjectURL(u); res(im); };
    im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('img')); };
    im.src = u;
  });
}
/* riduce la foto a 640 px e la comprime in JPEG */
async function compressImage(file, max = 640, q = .72) {
  const im = await loadImage(file);
  const k = Math.min(1, max / Math.max(im.width, im.height));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k));
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(im, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', q);
}
/* se un link non si carica, al suo posto compare un'icona */
document.addEventListener('error', e => {
  const t = e.target;
  if (t && t.tagName === 'IMG' && t.classList.contains('dimg')) {
    const s = document.createElement('span'); s.className = 'imgbad'; s.innerHTML = ic('image', 24); t.replaceWith(s);
  }
}, true);

/* ===== Costanti ===== */
const ALLERGENS = ['Glutine', 'Crostacei', 'Uova', 'Pesce', 'Arachidi', 'Soia', 'Latte e derivati', 'Frutta a guscio', 'Sedano', 'Senape', 'Sesamo', 'Solfiti', 'Lupini', 'Molluschi'];
const TAGS = ['Vegetariano', 'Vegano', 'Senza glutine', 'Piccante'];
const DEFAULT_CATS = ['Antipasti', 'Primi piatti', 'Secondi piatti', 'Contorni', 'Pizze', 'Dolci', 'Bevande'];
const CAT_RENAME = { Primi: 'Primi piatti', Secondi: 'Secondi piatti' };
const STATUS_LABEL = { nuovo: 'Ricevuto', preparazione: 'In preparazione', servito: 'Servito', chiuso: 'Chiuso', annullato: 'Annullato' };

/* ===== Codici casuali (password temporanee e codici dei tavoli) ===== */
const rnd = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
function ensureTokens(r) {
  r.tokens = r.tokens || {};
  for (let n = 1; n <= r.tables; n++) if (!r.tokens[n]) r.tokens[n] = rnd(10);
}

/* ===== Password: PBKDF2 con sale (mai in chiaro) =====
   Le vecchie password (sha / dj) restano valide e vengono aggiornate al primo accesso. */
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const unhex = s => Uint8Array.from(s.match(/../g).map(x => parseInt(x, 16)));
function dj(t) { let h = 5381; for (const c of t) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0; return 'dj:' + h.toString(16); }
async function pbkdf2(pw, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, key, 256);
}
async function hash(pw) {
  try {
    if (window.crypto && crypto.subtle) {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      return 'pb:' + hex(salt) + ':' + hex(await pbkdf2(pw, salt));
    }
  } catch { }
  return dj('menupro::' + pw);
}
async function verify(pw, stored) {
  if (!stored) return false;
  try {
    if (stored.startsWith('dj:')) return dj('menupro::' + pw) === stored;
    if (stored.startsWith('pb:')) { const [, s, h] = stored.split(':'); return hex(await pbkdf2(pw, unhex(s))) === h; }
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('menupro::' + pw));
    return 'sha:' + hex(b) === stored;
  } catch { return false; }
}
/* se l'hash è vecchio lo rifà con il metodo nuovo */
async function upgraded(pw, stored) {
  if (stored && stored.startsWith('pb:')) return stored;
  const h = await hash(pw);
  return h.startsWith('pb:') ? h : stored;
}

/* ===== Limite tentativi di accesso (30 secondi dopo 5 errori) ===== */
const lockKey = k => 'menupro_lock_' + k;
function lockLeft(k) {
  try { const x = JSON.parse(localStorage.getItem(lockKey(k)) || '{}'); return Math.max(0, Math.ceil(((x.until || 0) - Date.now()) / 1000)); } catch { return 0; }
}
function loginFail(k) {
  try {
    const x = JSON.parse(localStorage.getItem(lockKey(k)) || '{}');
    x.n = (x.n || 0) + 1;
    if (x.n >= 5) { x.until = Date.now() + 30000; x.n = 0; }
    localStorage.setItem(lockKey(k), JSON.stringify(x));
  } catch { }
}
const loginOk = k => { try { localStorage.removeItem(lockKey(k)); } catch { } };

/* ===== Dati ===== */
const defaults = () => ({
  settings: { baseUrl: '', adminHash: null },
  plans: [
    { id: 'base', name: 'Base', price: 29, desc: 'Menù digitale e QR code' },
    { id: 'pro', name: 'Pro', price: 59, desc: 'Base + ordini al tavolo' },
    { id: 'premium', name: 'Premium', price: 99, desc: 'Pro + prenotazioni e statistiche' }
  ],
  restaurants: [
    { id: 'r1', demo: true, name: 'Trattoria da Mario', owner: 'Mario Rossi', email: 'mario@esempio.it', password: 'mario123', city: 'Brescia', tables: 8, plan: 'pro', expires: addMonths(today(), 1), suspended: false, color: '#0f5c4a', cats: [...DEFAULT_CATS] }
  ],
  menu: [
    { id: uid(), rid: 'r1', cat: 'Antipasti', name: 'Tagliere misto', desc: 'Salumi e formaggi locali', price: 12, allergens: ['Latte e derivati'], tags: [] },
    { id: uid(), rid: 'r1', cat: 'Primi piatti', name: 'Casoncelli alla bresciana', desc: 'Burro, salvia e pancetta', price: 11.5, allergens: ['Glutine', 'Uova', 'Latte e derivati'], tags: [], featured: true },
    { id: uid(), rid: 'r1', cat: 'Primi piatti', name: "Spaghetti all'arrabbiata", desc: 'Pomodoro e peperoncino', price: 9, allergens: ['Glutine'], tags: ['Vegano', 'Piccante'] },
    { id: uid(), rid: 'r1', cat: 'Secondi piatti', name: 'Tagliata di manzo', desc: 'Con rucola e grana', price: 18, allergens: ['Latte e derivati'], tags: [] },
    { id: uid(), rid: 'r1', cat: 'Dolci', name: 'Tiramisù', desc: 'Fatto in casa', price: 6, allergens: ['Glutine', 'Uova', 'Latte e derivati'], tags: ['Vegetariano'] },
    { id: uid(), rid: 'r1', cat: 'Bevande', name: 'Acqua naturale 0,75 l', desc: '', price: 2.5, allergens: [], tags: ['Vegano'] }
  ],
  orders: [], calls: [], payments: []
});

let db;
function loadDb() {
  try { db = JSON.parse(localStorage.getItem(KEY)) || defaults(); } catch { db = defaults(); }
  db.settings = db.settings || {};
  db.settings.baseUrl = db.settings.baseUrl || '';
  db.settings.adminHash = db.settings.adminHash || null;
  db.plans = db.plans && db.plans.length ? db.plans : defaults().plans;
  ['restaurants', 'menu', 'orders', 'calls', 'payments'].forEach(k => db[k] = db[k] || []);
  db.restaurants.forEach(r => {
    r.tables = r.tables || 8; r.color = r.color || '#0f5c4a';
    const old = (r.cats || r.catOrder || []).map(c => CAT_RENAME[c] || c);
    r.cats = [...new Set(r.cats ? old : [...old, ...DEFAULT_CATS])];
    delete r.catOrder;
    ensureTokens(r);
  });
  db.menu.forEach(i => {
    i.tags = i.tags || []; i.allergens = i.allergens || [];
    i.img = validImg(i.img);
    if (CAT_RENAME[i.cat]) i.cat = CAT_RENAME[i.cat];
    if (i.tags.includes('Lattosio')) { i.tags = i.tags.filter(x => x !== 'Lattosio'); if (!i.allergens.includes('Latte e derivati')) i.allergens.push('Latte e derivati'); }
  });
  db.orders.forEach((o, i) => { if (!o.n) o.n = i + 1; o.messages = o.messages || []; o.items = o.items || []; });
}
loadDb();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch { return false; } };
const save = () => { const ok = persist(); if (!ok) toast('Impossibile salvare: la memoria del browser è piena'); return ok; };
/* salva; se non c'è spazio annulla la modifica (utile con le foto) */
function saveOrUndo(undo) {
  if (persist()) return true;
  undo();
  toast('Spazio esaurito: usa foto più piccole o toglile da altri piatti');
  return false;
}
async function migrate() {
  for (const r of db.restaurants) {
    if (!r.passHash) { r.passHash = await hash(r.password || '1234'); delete r.password; }
  }
  save();
}

/* spazio occupato (il browser consente circa 5 milioni di caratteri) */
function storageHtml() {
  const len = (localStorage.getItem(KEY) || '').length, pct = Math.min(100, len / 5e6 * 100);
  const n = db.menu.filter(i => i.img && i.img.startsWith('data:')).length;
  return `<p class="muted">Foto caricate: <b>${n}</b>. Spazio usato nel browser: <b>${(len / 1e6).toFixed(1)} MB</b> su circa 5 MB.</p>
    <div class="rt" style="margin-top:8px"><div class="rf" style="width:${pct}%${pct > 85 ? ';background:var(--bad)' : ''}"></div></div>`;
}

/* ===== Helper di dominio ===== */
const planOf = id => db.plans.find(p => p.id === id) || { name: '—', price: 0 };
const statusOf = r => r.suspended ? 'sospeso' : (r.expires < today() ? 'scaduto' : 'attivo');
const restActive = r => statusOf(r) === 'attivo';
const badge = r => `<span class="badge ${statusOf(r)}">${statusOf(r)}</span>`;
const orderTotal = o => round2(o.items.reduce((s, i) => s + i.price * i.qty, 0));
const emailTaken = (email, exceptId) => db.restaurants.some(r => r.id !== exceptId && r.email.toLowerCase() === String(email).trim().toLowerCase());
const siteUrl = () => ((db.settings.baseUrl || '').trim() || location.href).split('#')[0];
const isOpen = o => !['chiuso', 'annullato'].includes(o.status);
const focusedInput = () => { const a = document.activeElement; return !!a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); };

/* Ogni tavolo ha un codice segreto: l'area cliente si apre solo con il link/QR completo */
const tableUrl = (rid, n) => {
  const r = db.restaurants.find(x => x.id === rid);
  return `${siteUrl()}#/c/${rid}/${n}/${r?.tokens?.[n] || ''}`;
};
const tableOk = (rid, table, tok) => {
  const r = db.restaurants.find(x => x.id === rid);
  return !!(r && table >= 1 && table <= r.tables && tok && r.tokens && r.tokens[table] === tok);
};

const infoHtml = i => {
  const a = i.allergens || [], t = i.tags || [];
  return (t.length ? `<div class="tags">${t.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>` : '')
    + (a.length ? `<small class="allg">Allergeni: ${a.map(esc).join(', ')}</small>` : '');
};

/* ===== Categorie ===== */
function catsOf(rid) {
  const r = db.restaurants.find(x => x.id === rid);
  const base = r?.cats || [];
  const extra = [...new Set(db.menu.filter(m => m.rid === rid).map(m => m.cat))].filter(c => !base.includes(c));
  return [...base, ...extra];
}
function addCat(rid, name) { db.restaurants.find(x => x.id === rid).cats = [...catsOf(rid), name]; }
function moveCat(n, dir) {
  const rid = curRid(), list = catsOf(rid), j = n + dir;
  if (j < 0 || j >= list.length) return;
  [list[n], list[j]] = [list[j], list[n]];
  db.restaurants.find(x => x.id === rid).cats = list;
  save(); refresh();
}

/* ===== Notifiche ===== */
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 2800);
}
let soundOn = true, actx;
function beep() {
  if (!soundOn) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    [[880, 0], [1175, .18]].forEach(([f, d]) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.connect(g); g.connect(actx.destination); o.frequency.value = f;
      const t0 = actx.currentTime + d;
      g.gain.setValueAtTime(.18, t0);
      g.gain.exponentialRampToValueAtTime(.001, t0 + .4);
      o.start(t0); o.stop(t0 + .4);
    });
  } catch { }
}
function download(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

/* ===== Finestre di dialogo ===== */
let onSave = null, onCancel = null;
let cOpen = null, cDish = null;   // stato del cliente (pannello aperto e piatto mostrato)
const syncLock = () => document.body.classList.toggle('lock', !$('#modalBg').hidden || (!!cOpen && !$('#clientApp').hidden));
function openModal(title, html, cb, opt = {}) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  const s = $('#modalSave');
  s.hidden = !cb; s.textContent = opt.ok || 'Salva'; s.classList.toggle('danger', !!opt.danger);
  $('#modalCancel').textContent = cb ? 'Annulla' : 'Chiudi';
  onSave = cb; onCancel = opt.onCancel || null;
  $('#modalBg').hidden = false;
  syncLock();
  (opt.focusSave ? s : $('#modalBody').querySelector('input:not([type=checkbox]):not([type=hidden]):not([type=file]),select,textarea'))?.focus();
}
function closeModal() {
  const c = onCancel; onSave = null; onCancel = null;
  $('#modalBg').hidden = true; syncLock();
  if (c) c();
}
/* conferma con la finestra del sito, al posto di confirm() */
const ask = (title, text, ok = 'Conferma', danger = false) => new Promise(res =>
  openModal(title, `<p>${text}</p>`, () => { setTimeout(() => res(true)); }, { ok, danger, focusSave: true, onCancel: () => res(false) }));

$('#modalCancel').onclick = closeModal;
$('#modalBg').addEventListener('click', e => { if (e.target.id === 'modalBg') closeModal(); });
$('#modal').addEventListener('submit', async e => {
  e.preventDefault();
  const d = {};
  for (const [k, v] of new FormData(e.target)) d[k] = k in d ? [].concat(d[k], v) : v;
  if (onSave && (await onSave(d)) === false) return;   // false = la finestra resta aperta
  onCancel = null; closeModal();
});

/* ===== Router (in base all'indirizzo dopo #) ===== */
function route() {
  const p = location.hash.replace(/^#\/?/, '').split('/');
  ['adminGate', 'adminApp', 'restApp', 'clientApp'].forEach(id => $('#' + id).hidden = true);
  document.body.classList.remove('is-client');
  clearBrand();
  document.title = 'MenuPro';
  if (p[0] === 'c') { $('#clientApp').hidden = false; renderClient(p[1], p[2], p[3]); }
  else {
    syncLock();
    if (p[0] === 'ristoratore') { $('#restApp').hidden = false; renderRest(); }
    else renderAdmin();
  }
}
const refresh = route;
window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });

/* aggiornamento live tra schede dello stesso browser */
window.addEventListener('storage', e => {
  if (e.key !== KEY) return;
  const rid = rSess();
  const signal = () => db.orders.filter(o => o.rid === rid).length + db.orders.filter(o => o.rid === rid && o.unread).length + db.calls.filter(c => c.rid === rid && !c.done).length;
  const before = signal();
  const mineSnap = () => Object.fromEntries(db.orders.filter(o => getMine().includes(o.id)).map(o => [o.id, o.status]));
  const prevMine = mineSnap();
  loadDb();
  if (!$('#modalBg').hidden || focusedInput()) return;
  route();
  if (rid && location.hash.startsWith('#/ristoratore') && signal() > before) { toast('Nuova richiesta in arrivo'); beep(); }
  if (location.hash.startsWith('#/c/')) {
    const now = mineSnap();
    for (const id in now) if (prevMine[id] && prevMine[id] !== now[id]) {
      const o = db.orders.find(x => x.id === id);
      if (now[id] === 'preparazione') toast(`Ordine #${o.n}: lo stiamo preparando`);
      else if (now[id] === 'servito') toast(`Ordine #${o.n}: è in arrivo al tavolo`);
      else if (now[id] === 'annullato') toast(`Ordine #${o.n} annullato dal ristorante`);
    }
  }
});

/* =====================================================
   COMPONENTI COMUNI
   ===================================================== */
function barChart(data, fmt = n => n ? '€' + Math.round(n) : '') {
  const max = Math.max(1, ...data.map(d => d.v));
  return `<div class="bars" role="img" aria-label="Grafico a barre">${data.map(d => `<div class="bar">
    <div class="bcol">${d.v ? `<span class="bv">${fmt(d.v)}</span>` : ''}<div class="bfill" style="flex-basis:${d.v ? Math.max(3, d.v / max * 86) : 0}%"></div></div>
    <span class="bl">${esc(d.l)}</span></div>`).join('')}</div>`;
}
const emptyBox = (icon, text) => `<div class="empty">${ic(icon, 28)}<p>${text}</p></div>`;

/* =====================================================
   MENÙ (usato da admin e ristoratore)
   ===================================================== */
const curRid = () => location.hash.startsWith('#/ristoratore') ? rSess() : menuRid;

function menuHtml(rid) {
  const items = db.menu.filter(m => m.rid === rid);
  const cats = catsOf(rid);
  if (!cats.length) return `<div class="panel">${emptyBox('book', 'Nessuna categoria. Creane una con “Crea categoria”, poi aggiungi i piatti.')}</div>`;
  return `<div class="toolbar"><div class="searchbox">${ic('search', 16)}<input type="search" id="mSearch" placeholder="Cerca un piatto" aria-label="Cerca un piatto"></div></div>`
    + cats.map((c, n) => {
      const list = items.filter(i => i.cat === c);
      return `<div class="panel cat">
      <div class="cathead"><h4>${esc(c)} <span class="cnt">${list.length}</span></h4><span class="cattools">
        <button class="btn small ghost icon" data-act="cat-up" data-id="${n}" aria-label="Sposta la categoria su" title="Sposta su">${ic('up', 15)}</button>
        <button class="btn small ghost icon" data-act="cat-down" data-id="${n}" aria-label="Sposta la categoria giù" title="Sposta giù">${ic('down', 15)}</button>
        <button class="btn small ghost" data-act="cat-ren" data-id="${n}">Rinomina</button>
        <button class="btn small ghost" data-act="cat-del" data-id="${n}">Elimina</button></span></div>
      ${list.length ? list.map(i => { const src = imgSrc(i.img); return `<div class="item ${i.available === false ? 'off' : ''}" data-s="${esc((i.name + ' ' + i.desc).toLowerCase())}">
        <div class="lead">
          <div class="mthumb">${src ? `<img class="dimg" src="${esc(src)}" alt="" loading="lazy">` : ic('image', 20)}</div>
          <div class="info"><b>${esc(i.name)}</b>${i.featured ? `<span class="star" title="Consigliato">${ic('star', 14)}</span>` : ''}${i.available === false ? '<span class="tag out">Esaurito</span>' : ''}<small>${esc(i.desc)}</small>${infoHtml(i)}</div>
        </div>
        <div class="right">
          <input class="pin" type="number" step="0.10" min="0" value="${i.price}" data-price="${i.id}" aria-label="Prezzo ${esc(i.name)}">
          <button class="btn small ghost" data-act="avail-item" data-id="${i.id}">${i.available === false ? 'Rendi disponibile' : 'Segna esaurito'}</button>
          <button class="btn small ghost icon" data-act="dup-item" data-id="${i.id}" aria-label="Duplica ${esc(i.name)}" title="Duplica">${ic('copy', 15)}</button>
          <button class="btn small ghost icon" data-act="edit-item" data-id="${i.id}" aria-label="Modifica ${esc(i.name)}" title="Modifica">${ic('edit', 15)}</button>
          <button class="btn small ghost icon bad" data-act="del-item" data-id="${i.id}" aria-label="Elimina ${esc(i.name)}" title="Elimina">${ic('trash', 15)}</button>
        </div></div>`; }).join('') : '<div class="none">Nessun piatto in questa categoria.</div>'}
      </div>`;
    }).join('');
}

function itemForm(rid, i = {}) {
  const cats = catsOf(rid), none = !cats.length;
  const prev = imgSrc(i.img);
  return `
  <label for="catSel">Categoria</label>
  <select name="cat" id="catSel" required>
    ${cats.map(c => `<option value="${esc(c)}" ${c === i.cat ? 'selected' : ''}>${esc(c)}</option>`).join('')}
    <option value="__new__" ${none ? 'selected' : ''}>+ Crea nuova categoria…</option>
  </select>
  <div id="newCatWrap" ${none ? '' : 'hidden'}><label for="newCat">Nome della nuova categoria</label><input name="newcat" id="newCat" placeholder="Es. Menù bambini"></div>
  <label for="fName">Nome piatto</label><input id="fName" name="name" required maxlength="80" value="${esc(i.name)}">
  <label for="fDesc">Descrizione</label><input id="fDesc" name="desc" maxlength="160" value="${esc(i.desc)}">
  <label for="fPrice">Prezzo (€)</label><input id="fPrice" name="price" type="number" step="0.10" min="0" required value="${i.price ?? ''}">
  <label>Foto del piatto</label>
  <div class="imgfield">
    <div class="imgprev" id="imgPrev">${prev ? `<img class="dimg" src="${esc(prev)}" alt="">` : ic('image', 30)}</div>
    <div class="imgbtns">
      <button type="button" class="btn small ghost" data-act="img-pick">${ic('image', 15)} Scegli o scatta una foto</button>
      <button type="button" class="btn small ghost bad" data-act="img-clear">Rimuovi foto</button>
    </div>
  </div>
  <input type="file" id="imgFile" accept="image/*" hidden>
  <input type="hidden" name="img" id="imgVal" value="${esc(i.img || '')}">
  <label for="imgUrl">Oppure incolla il link di una foto</label>
  <input id="imgUrl" type="url" placeholder="https://…" value="${i.img && !i.img.startsWith('data:') ? esc(i.img) : ''}">
  <label>Allergeni presenti</label>
  <div class="checks">${ALLERGENS.map(a => `<label><input type="checkbox" name="allergen" value="${a}" ${i.allergens?.includes(a) ? 'checked' : ''}> ${a}</label>`).join('')}</div>
  <label>Caratteristiche</label>
  <div class="checks">${TAGS.map(t => `<label><input type="checkbox" name="tag" value="${t}" ${i.tags?.includes(t) ? 'checked' : ''}> ${t}</label>`).join('')}
    <label><input type="checkbox" name="featured" ${i.featured ? 'checked' : ''}> Consigliato dallo chef</label></div>`;
}
/* restituisce null se la nuova categoria è vuota */
function itemData(rid, d) {
  let cat = d.cat;
  if (cat === '__new__') {
    cat = (d.newcat || '').trim();
    if (!cat) return null;
    const ex = catsOf(rid).find(c => c.toLowerCase() === cat.toLowerCase());
    if (ex) cat = ex; else addCat(rid, cat);
  }
  return {
    cat, name: d.name.trim(), desc: (d.desc || '').trim(), price: round2(Math.max(0, +d.price || 0)),
    img: validImg(d.img), allergens: [].concat(d.allergen || []), tags: [].concat(d.tag || []), featured: !!d.featured
  };
}
const setPrev = src => { const p = $('#imgPrev'); if (p) p.innerHTML = src ? `<img class="dimg" src="${esc(src)}" alt="">` : ic('image', 30); };

/* =====================================================
   1. ADMIN
   ===================================================== */
let view = 'dashboard';
let menuRid = db.restaurants[0]?.id || '';
const adminAuthed = () => { try { return sessionStorage.getItem('menupro_admin') === '1'; } catch { return false; } };
const adminSet = v => { try { v ? sessionStorage.setItem('menupro_admin', '1') : sessionStorage.removeItem('menupro_admin'); } catch { } };

$('#adminForm').addEventListener('submit', async e => {
  e.preventDefault();
  const err = $('#adminErr');
  const left = lockLeft('admin');
  if (left) { err.textContent = `Troppi tentativi. Riprova tra ${left} secondi.`; return; }
  const f = new FormData(e.target), pw = String(f.get('password'));
  if (!db.settings.adminHash) {
    if (pw !== f.get('confirm')) { err.textContent = 'Le due password non coincidono.'; return; }
    db.settings.adminHash = await hash(pw); save();
  } else {
    if (!(await verify(pw, db.settings.adminHash))) { loginFail('admin'); err.textContent = 'Password errata.'; return; }
    const up = await upgraded(pw, db.settings.adminHash);
    if (up !== db.settings.adminHash) { db.settings.adminHash = up; save(); }
  }
  loginOk('admin'); err.textContent = '';
  adminSet(true); e.target.reset(); route();
});

function viewDashboard() {
  const active = db.restaurants.filter(restActive);
  const mrr = active.reduce((s, r) => s + planOf(r.plan).price, 0);
  const sameMonth = (t, d) => { const x = new Date(t); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); };
  const monthPay = db.payments.filter(p => sameMonth(p.at, new Date())).reduce((s, p) => s + p.amount, 0);
  const expired = db.restaurants.filter(r => statusOf(r) === 'scaduto');
  const soon = active.filter(r => pd(r.expires) - Date.now() < 7 * 864e5);
  const list = [...expired, ...soon];
  const chart = [...Array(6)].map((_, k) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + k);
    return { l: d.toLocaleDateString('it-IT', { month: 'short' }), v: db.payments.filter(p => sameMonth(p.at, d)).reduce((s, p) => s + p.amount, 0) };
  });
  return `
  <div class="stats">
    <div class="stat main-stat"><b>${eur(mrr)}</b><span>Incasso mensile ricorrente</span></div>
    <div class="stat"><b>${eur(monthPay)}</b><span>Pagamenti di questo mese</span></div>
    <div class="stat"><b>${active.length}<small>/${db.restaurants.length}</small></b><span>Ristoranti attivi</span></div>
    <div class="stat"><b>${expired.length}</b><span>Abbonamenti scaduti</span></div>
    <div class="stat"><b>${db.orders.length}</b><span>Ordini ricevuti</span></div>
  </div>
  <div class="grid2">
    <div class="panel"><h3>Pagamenti degli ultimi 6 mesi</h3>${barChart(chart)}</div>
    <div class="panel"><h3>Da rinnovare</h3>
      ${list.length ? `<table><tr><th>Ristorante</th><th>Scadenza</th><th>Stato</th><th></th></tr>
      ${list.map(r => `<tr><td>${esc(r.name)}<br><small class="muted">${planOf(r.plan).name}</small></td><td>${fdate(r.expires)}</td><td>${badge(r)}</td>
      <td class="act"><button class="btn small" data-act="renew" data-id="${r.id}">Rinnova +1 mese</button></td></tr>`).join('')}</table>`
        : emptyBox('check', 'Nessun abbonamento in scadenza nei prossimi 7 giorni.')}
    </div>
  </div>`;
}

function viewRistoranti() {
  if (!db.restaurants.length) return `<div class="panel">${emptyBox('store', 'Nessun ristorante. Aggiungi il primo cliente con “Nuovo ristorante”.')}</div>`;
  return `<div class="toolbar"><div class="searchbox">${ic('search', 16)}<input type="search" id="rSearch" placeholder="Cerca per nome, città o email" aria-label="Cerca ristorante"></div></div>
  <div class="panel"><table>
  <tr><th>Ristorante</th><th>Titolare</th><th>Città</th><th>Piano</th><th>Scadenza</th><th>Stato</th><th></th></tr>
  ${db.restaurants.map(r => `<tr data-s="${esc((r.name + ' ' + r.owner + ' ' + r.city + ' ' + r.email).toLowerCase())}">
    <td><b>${esc(r.name)}</b><br><small class="muted">${esc(r.email)} · ${r.tables} tavoli</small></td>
    <td>${esc(r.owner)}</td><td>${esc(r.city)}</td><td>${planOf(r.plan).name}</td>
    <td>${fdate(r.expires)}</td><td>${badge(r)}</td>
    <td class="act">
      <button class="btn small ghost" data-act="creds" data-id="${r.id}">Account</button>
      <button class="btn small ghost" data-act="open-menu" data-id="${r.id}">Menù</button>
      <button class="btn small ghost" data-act="edit-rest" data-id="${r.id}">Modifica</button>
      <button class="btn small ghost icon bad" data-act="del-rest" data-id="${r.id}" aria-label="Elimina ${esc(r.name)}" title="Elimina">${ic('trash', 15)}</button>
    </td></tr>`).join('')}
  </table></div>`;
}

function viewAbbonamenti() {
  const pays = [...db.payments].sort((a, b) => b.at - a.at).slice(0, 10);
  return `
  <div class="plans">${db.plans.map(p => `
    <div class="plan ${p.id === 'pro' ? 'pro' : ''}">
      <h3>${esc(p.name)}</h3>
      <div class="price">${eur(p.price)}<small> al mese</small></div>
      <p>${esc(p.desc)}</p>
      <p>${db.restaurants.filter(r => r.plan === p.id).length} ristoranti</p>
      <button class="btn small ghost" data-act="edit-plan" data-id="${p.id}">Modifica piano</button>
    </div>`).join('')}</div>
  <div class="panel"><h3>Abbonamenti dei ristoranti</h3>
  ${db.restaurants.length ? `<table><tr><th>Ristorante</th><th>Piano</th><th>Prezzo</th><th>Scadenza</th><th>Stato</th><th></th></tr>
  ${db.restaurants.map(r => `<tr><td>${esc(r.name)}</td><td>${planOf(r.plan).name}</td><td>${eur(planOf(r.plan).price)}</td>
    <td>${fdate(r.expires)}</td><td>${badge(r)}</td>
    <td class="act">
      <button class="btn small" data-act="renew" data-id="${r.id}">Registra pagamento +1 mese</button>
      <button class="btn small ghost" data-act="toggle" data-id="${r.id}">${r.suspended ? 'Riattiva' : 'Sospendi'}</button>
    </td></tr>`).join('')}</table>` : emptyBox('store', 'Nessun ristorante.')}
  </div>
  <div class="panel"><h3>Ultimi pagamenti</h3>
  ${pays.length ? `<table><tr><th>Data</th><th>Ristorante</th><th>Importo</th></tr>
  ${pays.map(p => `<tr><td>${fdate(p.at)}</td><td>${esc(p.name)}</td><td>${eur(p.amount)}</td></tr>`).join('')}</table>`
    : emptyBox('card', 'Nessun pagamento registrato.')}
  </div>`;
}

function viewMenuAdmin() {
  if (!db.restaurants.length) return `<div class="panel">${emptyBox('book', 'Crea prima un ristorante per poter inserire il menù.')}</div>`;
  return `<div class="toolbar"><select id="menuSel" aria-label="Ristorante">${db.restaurants.map(r => `<option value="${r.id}" ${r.id === menuRid ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select></div>`
    + menuHtml(menuRid);
}

function viewImpostazioni() {
  return `
  <div class="panel"><h3>Indirizzo pubblico del sito</h3>
    <p class="muted">I QR dei tavoli usano questo indirizzo. Inseriscilo quando il sito è online (es. https://miosito.it/). Se lo lasci vuoto viene usato quello attuale, che sul telefono non funziona se apri il file dal computer.</p>
    <div class="toolbar" style="margin-top:12px"><input id="baseUrl" style="max-width:420px" placeholder="https://miosito.it/" value="${esc(db.settings.baseUrl)}" aria-label="Indirizzo pubblico"><button class="btn" data-act="a-baseurl">Salva</button></div>
  </div>
  <div class="panel"><h3>Foto dei piatti e spazio</h3>
    ${storageHtml()}
    <p class="muted" style="margin-top:10px">Le foto caricate vengono ridotte in automatico (640 px). In questa versione stanno nella memoria del browser, quindi ne entrano alcune decine. Per averne di più e per vederle da più dispositivi serve il database online.</p>
  </div>
  <div class="panel"><h3>Sicurezza</h3>
    <p class="muted">Le password sono salvate cifrate (PBKDF2 con sale), non in chiaro. L'area cliente si apre solo dal QR del tavolo, che contiene un codice segreto. Sono protezioni lato browser: per un uso reale serve un login su server.</p>
    <p style="margin-top:12px"><button class="btn ghost" data-act="a-pass">Cambia password admin</button></p>
  </div>
  <div class="panel"><h3>Backup dei dati</h3>
    <p class="muted">Il file contiene ristoranti, menù, foto, ordini e le password cifrate. Conservalo in un posto sicuro.</p>
    <div class="toolbar" style="margin-top:12px">
      <button class="btn" data-act="a-export">${ic('download', 16)} Scarica backup</button>
      <button class="btn ghost" data-act="a-import">Importa backup</button>
      <button class="btn ghost bad" data-act="a-reset">Cancella tutti i dati</button>
    </div>
  </div>`;
}

const titles = { dashboard: 'Panoramica', ristoranti: 'Ristoranti', abbonamenti: 'Abbonamenti', menu: 'Menù e prezzi', impostazioni: 'Impostazioni' };
const themeBtn = () => `<button class="btn ghost small light" data-act="theme" aria-label="Cambia tema" title="Cambia tema">${ic(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon', 16)}</button>`;

function renderAdmin() {
  if (!adminAuthed()) {
    const first = !db.settings.adminHash;
    $('#adminGate').hidden = false;
    $('#adminGateMsg').textContent = first ? "Prima configurazione: scegli la password dell'amministratore." : 'Accedi al pannello amministratore.';
    $('#adminConfirm').hidden = !first;
    $('#adminConfirm input').required = first;
    $('#adminBtn').textContent = first ? 'Crea password e accedi' : 'Accedi';
    return;
  }
  $('#adminApp').hidden = false;
  if (!db.restaurants.find(r => r.id === menuRid)) menuRid = db.restaurants[0]?.id || '';
  $('#title').textContent = titles[view];
  $$('#nav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  $('#actions').innerHTML =
    view === 'ristoranti' ? `<button class="btn" data-act="new-rest">${ic('plus', 16)} Nuovo ristorante</button>` :
    view === 'menu' && menuRid ? `<button class="btn ghost" data-act="new-cat" data-id="${menuRid}">Crea categoria</button><button class="btn" data-act="new-item" data-id="${menuRid}">${ic('plus', 16)} Nuovo piatto</button>` : '';
  $('#view').innerHTML = { dashboard: viewDashboard, ristoranti: viewRistoranti, abbonamenti: viewAbbonamenti, menu: viewMenuAdmin, impostazioni: viewImpostazioni }[view]();
  $('#menuSel')?.addEventListener('change', e => { menuRid = e.target.value; refresh(); });
  $('#sideLinks').innerHTML =
    `<a href="#/ristoratore">${ic('store', 16)}<span class="lbl">Area ristoratore</span></a>` +
    (db.restaurants[0] ? `<a href="${esc(tableUrl(db.restaurants[0].id, 1))}" target="_blank" rel="noopener">${ic('ext', 16)}<span class="lbl">Anteprima cliente</span></a>` : '') +
    `<span class="spacer"></span>${themeBtn()}<button class="btn ghost small light" data-act="a-logout">${ic('logout', 16)}<span class="lbl">Esci</span></button>`;
}

$('#nav').addEventListener('click', e => {
  const b = e.target.closest('[data-view]');
  if (b) { view = b.dataset.view; refresh(); window.scrollTo(0, 0); }
});

function restForm(r = {}, isNew = false) {
  return `
  <label for="fN">Nome ristorante</label><input id="fN" name="name" required value="${esc(r.name)}">
  <div class="row">
    <div><label for="fO">Titolare</label><input id="fO" name="owner" required value="${esc(r.owner)}"></div>
    <div><label for="fC">Città</label><input id="fC" name="city" value="${esc(r.city)}"></div>
  </div>
  <label for="fE">Email (serve per il login del ristoratore)</label><input id="fE" name="email" type="email" required value="${esc(r.email)}">
  <div class="row">
    ${isNew ? '<div><label for="fP">Password (min. 6 caratteri)</label><input id="fP" name="password" minlength="6" required></div>' : ''}
    <div><label for="fT">Numero tavoli</label><input id="fT" name="tables" type="number" min="1" max="200" required value="${r.tables || 10}"></div>
  </div>
  <div class="row">
    <div><label for="fPl">Piano</label><select id="fPl" name="plan">${db.plans.map(p => `<option value="${p.id}" ${p.id === (r.plan || 'base') ? 'selected' : ''}>${esc(p.name)} · ${eur(p.price)}</option>`).join('')}</select></div>
    <div><label for="fX">Scadenza abbonamento</label><input id="fX" name="expires" type="date" required value="${r.expires || addMonths(today(), 1)}"></div>
  </div>`;
}

/* =====================================================
   2. RISTORATORE
   ===================================================== */
let rView = 'ordini';
const rSess = () => { try { return sessionStorage.getItem('menupro_rest'); } catch { return null; } };
const rSet = v => { try { v ? sessionStorage.setItem('menupro_rest', v) : sessionStorage.removeItem('menupro_rest'); } catch { } };
const curRest = () => db.restaurants.find(x => x.id === rSess());
const rTitles = { ordini: 'Ordini', tavoli: 'Tavoli e QR', menu: 'Menù e prezzi', stats: 'Statistiche', impostazioni: 'Impostazioni' };

$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const err = $('#loginErr');
  const left = lockLeft('rest');
  if (left) { err.textContent = `Troppi tentativi. Riprova tra ${left} secondi.`; return; }
  const f = new FormData(e.target);
  const email = String(f.get('email')).trim().toLowerCase(), pw = String(f.get('password'));
  const r = db.restaurants.find(x => x.email.toLowerCase() === email);
  if (!r || !(await verify(pw, r.passHash))) { loginFail('rest'); err.textContent = 'Email o password non corretti.'; return; }
  const up = await upgraded(pw, r.passHash);
  if (up !== r.passHash) { r.passHash = up; save(); }
  loginOk('rest'); err.textContent = '';
  rSet(r.id); e.target.reset(); renderRest();
});

function orderCard(o) {
  const next = { nuovo: 'Inizia preparazione', preparazione: 'Segna servito' }[o.status];
  const mins = Math.floor((Date.now() - o.at) / 60000);
  const late = ['nuovo', 'preparazione'].includes(o.status) && mins >= 15;
  const fresh = o.status === 'nuovo' && mins < 2;
  return `<article class="ocard ${o.unread ? 'hasmsg' : ''} ${late ? 'late' : ''} ${fresh ? 'fresh' : ''}">
    <div class="oh"><b>Tavolo ${o.table} <span class="num">#${o.n}</span></b>
      <span class="agebox"><small class="muted">${ftime(o.at)}</small><span class="agechip ${late ? 'late' : ''}">${ic('clock', 12)} ${ago(o.at)}</span></span></div>
    <ul>${o.items.map(i => `<li><span><b>${i.qty}×</b> ${esc(i.name)}</span><span>${eur(i.price * i.qty)}</span></li>`).join('')}</ul>
    ${o.note ? `<div class="note">Nota: ${esc(o.note)}</div>` : ''}
    ${o.messages.length ? `<div class="msgs"><b>${o.unread ? 'Nuovo messaggio dal cliente' : 'Messaggi del cliente'}</b>
      ${o.messages.map(m => `<p>${esc(m.text)}</p>`).join('')}
      ${o.unread ? `<button class="btn small" style="margin-top:8px" data-act="r-read" data-id="${o.id}">Segna come letto</button>` : ''}</div>` : ''}
    <div class="of"><b class="tot">${eur(orderTotal(o))}</b>
      <div class="btns">
        <button class="btn small ghost icon" data-act="r-print" data-id="${o.id}" aria-label="Stampa la comanda" title="Stampa">${ic('print', 15)}</button>
        ${o.status !== 'servito' ? `<button class="btn small ghost" data-act="r-cancel" data-id="${o.id}">Annulla</button>` : ''}
        ${next ? `<button class="btn small" data-act="r-next" data-id="${o.id}">${next}</button>` : '<span class="badge servito">Servito</span>'}
      </div></div></article>`;
}

function rOrdini(r) {
  const open = db.orders.filter(o => o.rid === r.id && isOpen(o)).sort((a, b) => a.at - b.at);
  const calls = db.calls.filter(c => c.rid === r.id && !c.done).sort((a, b) => a.at - b.at);
  const cols = [['nuovo', 'Nuovi'], ['preparazione', 'In preparazione'], ['servito', 'Serviti']];
  return (calls.length ? `<div class="calls">${calls.map(c => `<div class="call">
      <span>${ic('bell', 18)}<span><b>Tavolo ${c.table}</b> ${c.type === 'conto' ? 'chiede il conto' : 'chiama il cameriere'} <small class="muted">da ${ago(c.at)}</small></span></span>
      <button class="btn small" data-act="r-call-done" data-id="${c.id}">Fatto</button></div>`).join('')}</div>` : '')
    + `<div class="board">${cols.map(([s, l]) => {
      const list = open.filter(o => o.status === s);
      return `<div class="col"><h3><span class="dot ${s}"></span>${l} <span class="cnt">${list.length}</span></h3>${list.map(orderCard).join('') || '<div class="empty slim">Nessun ordine</div>'}</div>`;
    }).join('')}</div>`;
}

function rTavoli(r) {
  let html = '<div class="tables">';
  for (let n = 1; n <= r.tables; n++) {
    const open = db.orders.filter(o => o.rid === r.id && o.table === n && isOpen(o));
    const total = round2(open.reduce((s, o) => s + orderTotal(o), 0));
    const call = db.calls.some(c => c.rid === r.id && c.table === n && !c.done);
    const sum = {};
    open.forEach(o => o.items.forEach(i => sum[i.name] = (sum[i.name] || 0) + i.qty));
    html += `<div class="tbl ${open.length ? 'busy' : ''}"><b>Tavolo ${n} ${call ? '<span class="badge nuovo">Richiesta</span>' : ''}</b>
      <span class="tstat">${open.length ? `${open.length} ${open.length === 1 ? 'ordine' : 'ordini'} · ${eur(total)}` : 'Libero'}</span>
      ${open.length ? `<small>${Object.entries(sum).map(([k, v]) => `${v}× ${esc(k)}`).join(', ')}</small>` : ''}
      <div class="tb"><button class="btn small ghost" data-act="r-qr" data-id="${n}">${ic('qr', 15)} QR</button>
      ${open.length ? `<button class="btn small" data-act="r-close" data-id="${n}">Chiudi conto</button>` : ''}</div></div>`;
  }
  return html + '</div>';
}

function rStats(r) {
  const valid = db.orders.filter(o => o.rid === r.id && o.status !== 'annullato');
  const td = valid.filter(o => isToday(o.at));
  const rev = round2(td.reduce((s, o) => s + orderTotal(o), 0));
  const days = [...Array(7)].map((_, k) => { const d = new Date(); d.setDate(d.getDate() - 6 + k); return d; });
  const chart = days.map(d => ({ l: d.toLocaleDateString('it-IT', { weekday: 'short' }), v: valid.filter(o => dkey(o.at) === dkey(d)).reduce((s, o) => s + orderTotal(o), 0) }));
  const week = chart.reduce((s, d) => s + d.v, 0);
  const top = {};
  valid.forEach(o => o.items.forEach(i => top[i.name] = (top[i.name] || 0) + i.qty));
  const topList = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxT = topList[0]?.[1] || 1;
  const closed = db.orders.filter(o => o.rid === r.id && o.status === 'chiuso').sort((a, b) => b.at - a.at).slice(0, 20);
  return `
  <div class="stats">
    <div class="stat main-stat"><b>${eur(rev)}</b><span>Venduto oggi</span></div>
    <div class="stat"><b>${td.length}</b><span>Ordini di oggi</span></div>
    <div class="stat"><b>${eur(td.length ? rev / td.length : 0)}</b><span>Valore medio ordine</span></div>
    <div class="stat"><b>${eur(week)}</b><span>Venduto negli ultimi 7 giorni</span></div>
  </div>
  <div class="grid2">
    <div class="panel"><h3>Vendite degli ultimi 7 giorni</h3>${barChart(chart)}</div>
    <div class="panel"><h3>Piatti più venduti</h3>
      ${topList.length ? topList.map(([k, v]) => `<div class="rank"><span>${esc(k)}</span><div class="rt"><div class="rf" style="width:${v / maxT * 100}%"></div></div><b>${v}</b></div>`).join('') : emptyBox('chart', 'Ancora nessun ordine.')}
    </div>
  </div>
  <div class="panel"><h3>Ultimi conti chiusi</h3>
    ${closed.length ? `<table><tr><th>N.</th><th>Tavolo</th><th>Data</th><th>Totale</th></tr>${closed.map(o => `<tr><td>#${o.n}</td><td>${o.table}</td><td>${fdate(o.at)} ${ftime(o.at)}</td><td>${eur(orderTotal(o))}</td></tr>`).join('')}</table>` : emptyBox('orders', 'Nessun conto chiuso.')}
  </div>`;
}

function rImpostazioni(r) {
  return `<div class="panel"><h3>${esc(r.name)}</h3>
    <p>Piano: <b>${planOf(r.plan).name}</b>. Scadenza: <b>${fdate(r.expires)}</b> ${badge(r)}</p>
    <p>Tavoli: <b>${r.tables}</b></p>
    <p>Colore del menù: <span class="tag" style="background:${validColor(r.color)};color:${lum(validColor(r.color)) > .45 ? '#16231d' : '#fff'}">${validColor(r.color)}</span></p>
    <p style="margin-top:14px"><button class="btn" data-act="r-settings">Modifica impostazioni</button></p></div>
  <div class="panel"><h3>Foto dei piatti</h3>${storageHtml()}</div>
  <div class="panel"><h3>Codici QR</h3>
    <p class="muted">Il menù cliente si apre solo scansionando il QR del tavolo. Se un codice viene condiviso o rubato puoi rigenerare tutti i codici: i QR già stampati smetteranno di funzionare.</p>
    <p style="margin-top:14px"><button class="btn ghost bad" data-act="r-regen">Rigenera tutti i codici QR</button></p></div>`;
}

function renderRest() {
  const r = curRest();
  $('#restLogin').hidden = !!r;
  $('#restPanel').hidden = !r;
  if (!r) {
    const demo = db.restaurants.find(x => x.demo);
    $('#demoHint').hidden = !demo;
    if (demo) $('#demoHint').textContent = `Demo: ${demo.email} / mario123`;
    return;
  }
  $('#rBrand').innerHTML = `<span class="logo">${esc((r.name || 'M').trim().charAt(0).toUpperCase())}</span><span class="bn">${esc(r.name)}</span>`;
  $('#rTitle').textContent = rTitles[rView];
  const pending = db.orders.filter(o => o.rid === r.id && o.status === 'nuovo').length + db.calls.filter(c => c.rid === r.id && !c.done).length;
  $$('#rNav button').forEach(b => b.classList.toggle('active', b.dataset.rview === rView));
  const pill = $('#rNav [data-rview=ordini] .pill');
  pill.hidden = !pending; pill.textContent = pending;
  document.title = pending ? `(${pending}) ${r.name} · MenuPro` : `${r.name} · MenuPro`;
  $('#rSideLinks').innerHTML =
    `<a href="${esc(tableUrl(r.id, 1))}" target="_blank" rel="noopener">${ic('ext', 16)}<span class="lbl">Anteprima cliente</span></a><span class="spacer"></span>${themeBtn()}` +
    `<button class="btn ghost small light" data-act="r-logout">${ic('logout', 16)}<span class="lbl">Esci</span></button>`;
  if (!restActive(r)) {
    $('#rActions').innerHTML = '';
    $('#rView').innerHTML = `<div class="panel">${emptyBox('pause', "Il tuo abbonamento non è attivo. Contatta l'amministratore per riattivare il servizio.")}</div>`;
    return;
  }
  $('#rActions').innerHTML =
    rView === 'ordini' ? `<button class="btn ghost" data-act="r-sound">${ic(soundOn ? 'volume' : 'mute', 16)} Suono ${soundOn ? 'attivo' : 'spento'}</button>` :
    rView === 'tavoli' ? `<button class="btn ghost" data-act="r-qr-all">${ic('print', 16)} Stampa tutti i QR</button>` :
    rView === 'stats' ? `<button class="btn ghost" data-act="r-csv">${ic('download', 16)} Esporta ordini (CSV)</button>` :
    rView === 'menu' ? `<button class="btn ghost" data-act="new-cat" data-id="${r.id}">Crea categoria</button><button class="btn" data-act="new-item" data-id="${r.id}">${ic('plus', 16)} Nuovo piatto</button>` : '';
  $('#rView').innerHTML = { ordini: () => rOrdini(r), tavoli: () => rTavoli(r), menu: () => menuHtml(r.id), stats: () => rStats(r), impostazioni: () => rImpostazioni(r) }[rView]();
}

$('#rNav').addEventListener('click', e => {
  const b = e.target.closest('[data-rview]');
  if (b) { rView = b.dataset.rview; refresh(); window.scrollTo(0, 0); }
});

/* i tempi dei piatti in attesa si aggiornano da soli */
setInterval(() => {
  if (document.hidden || !location.hash.startsWith('#/ristoratore') || !rSess()) return;
  if (rView === 'ordini' && $('#modalBg').hidden && !focusedInput()) renderRest();
}, 30000);

/* =====================================================
   3. CLIENTE (telefono) — accessibile solo dal QR
   ===================================================== */
let cart = {}, cartNote = '', cKey = '', cSearch = '', cBanner = '', cEnter = false;
const cTags = new Set(), cAvoid = new Set();
const MINE_KEY = 'menupro_my_orders';
const getMine = () => { try { return JSON.parse(localStorage.getItem(MINE_KEY)) || []; } catch { return []; } };
const addMine = id => { try { localStorage.setItem(MINE_KEY, JSON.stringify([...getMine(), id].slice(-40))); } catch { } };
const cur = () => { const p = location.hash.replace(/^#\/?/, '').split('/'); return { rid: p[1], table: +p[2], tok: p[3] }; };
const saveCart = () => { try { sessionStorage.setItem('menupro_cart_' + cKey, JSON.stringify({ cart, cartNote })); } catch { } };
const loadCart = () => { try { const x = JSON.parse(sessionStorage.getItem('menupro_cart_' + cKey)); cart = x?.cart || {}; cartNote = x?.cartNote || ''; } catch { cart = {}; cartNote = ''; } };
const openClient = what => { cOpen = what; cEnter = true; refresh(); };

function applySearch() {
  const q = cSearch.trim().toLowerCase();
  let shown = 0;
  $$('.citem').forEach(el => {
    const t = (el.dataset.t || '').split('|'), a = (el.dataset.a || '').split('|');
    let ok = !q || el.dataset.s.includes(q);
    for (const x of cTags) if (!(t.includes(x) || (x === 'Vegetariano' && t.includes('Vegano')))) ok = false;
    for (const x of cAvoid) if (a.includes(x)) ok = false;
    el.hidden = !ok; if (ok) shown++;
  });
  $$('.ccat').forEach(s => s.hidden = ![...s.querySelectorAll('.citem')].some(i => !i.hidden));
  const nr = $('#noRes'); if (nr) nr.hidden = shown > 0;
}

/* evidenzia la categoria visibile mentre si scorre */
function spy() {
  if ($('#clientApp').hidden) return;
  const secs = $$('.ccat:not([hidden])');
  if (!secs.length) return;
  let c = +secs[0].id.slice(4);
  secs.forEach(s => { if (s.getBoundingClientRect().top <= 130) c = +s.id.slice(4); });
  $$('#chips button').forEach(b => {
    const on = +b.dataset.id === c;
    if (b.classList.contains('on') !== on) {
      b.classList.toggle('on', on);
      if (on) { const box = b.parentElement; box.scrollTo({ left: b.offsetLeft - box.clientWidth / 2 + b.clientWidth / 2, behavior: 'smooth' }); }
    }
  });
}
window.addEventListener('scroll', spy, { passive: true });

function renderClient(rid, t, tok) {
  const el = $('#clientApp');
  document.body.classList.add('is-client');
  document.documentElement.dataset.theme = 'light';   // il menù cliente è sempre in tema chiaro, anche se il telefono è in modalità scura
  const r = db.restaurants.find(x => x.id === rid);
  const table = +t;
  const msg = (icon, h, p) => { el.innerHTML = `<div class="phone"><div class="cmsg"><div class="qricon">${ic(icon, 52)}</div><h2>${h}</h2><p class="muted">${p}</p></div></div>`; syncLock(); };
  if (!tableOk(rid, table, tok)) return msg('qr', 'Scansiona il codice QR', 'Il menù si apre solo inquadrando il codice QR che trovi sul tuo tavolo. Se il codice non funziona, chiedi aiuto al personale.');
  if (!restActive(r)) return msg('pause', 'Menù non disponibile', 'Il servizio è momentaneamente sospeso. Chiedi al personale.');
  document.title = r.name + ' · Menù';
  const color = validColor(r.color);
  setBrand(color);

  if (cKey !== rid + '/' + t) { cKey = rid + '/' + t; cOpen = null; cDish = null; cSearch = ''; cBanner = ''; cTags.clear(); cAvoid.clear(); loadCart(); }
  const items = db.menu.filter(m => m.rid === rid);
  Object.keys(cart).forEach(id => { if (!items.some(i => i.id === id && i.available !== false)) delete cart[id]; });
  const dish = cOpen === 'dish' ? items.find(i => i.id === cDish) : null;
  if (cOpen === 'dish' && !dish) cOpen = null;
  const dishSrc = dish ? imgSrc(dish.img) : '';
  const cats = catsOf(rid).filter(c => items.some(i => i.cat === c));
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = round2(items.reduce((s, i) => s + (cart[i.id] || 0) * i.price, 0));
  const mine = db.orders.filter(o => o.rid === rid && o.table === table && getMine().includes(o.id) && o.status !== 'chiuso').sort((a, b) => b.at - a.at);
  const mineTotal = round2(mine.filter(o => o.status !== 'annullato').reduce((s, o) => s + orderTotal(o), 0));
  const nFilters = cTags.size + cAvoid.size;
  const callPending = type => db.calls.some(c => c.rid === rid && c.table === table && c.type === type && !c.done);
  const enter = cEnter ? 'enter' : '';

  const qty = i => cart[i.id]
    ? `<div class="qty"><button data-act="c-dec" data-id="${i.id}" aria-label="Togli uno">${ic('minus', 16)}</button><b>${cart[i.id]}</b><button data-act="c-inc" data-id="${i.id}" aria-label="Aggiungi uno">${ic('plus', 16)}</button></div>`
    : `<button class="add" data-act="c-inc" data-id="${i.id}">Aggiungi</button>`;
  const cartLines = items.filter(i => cart[i.id]).map(i => `<div class="cline"><div><b>${esc(i.name)}</b><br><small class="muted">${eur(i.price)}</small></div>${qty(i)}</div>`).join('');
  const track = o => o.status === 'annullato' ? '' : `<div class="track">${['nuovo', 'preparazione', 'servito'].map((s, k) => `<div class="st ${['nuovo', 'preparazione', 'servito'].indexOf(o.status) >= k ? 'done' : ''}"><i></i><span>${STATUS_LABEL[s]}</span></div>`).join('')}</div>`;

  const y = window.scrollY, cx = $('#chips')?.scrollLeft || 0, sy = $('.sheet')?.scrollTop || 0;
  el.innerHTML = `<div class="phone">
    <header class="chead">
      <button class="ibtn" data-act="c-help" aria-label="Chiama il personale">${ic('bell', 24)}</button>
      <div class="ctitle">${esc(r.name)}<small>Tavolo ${table}</small></div>
      <button class="ibtn" data-act="c-sheet" aria-label="Carrello e ordini">${ic('cart', 24)}
        ${count ? `<span class="cbadge">${count}</span>` : mine.length ? `<span class="cbadge alt">${mine.length}</span>` : ''}</button>
    </header>
    <div class="csearchrow">
      <div class="searchbox pill">${ic('search', 18)}<input id="cSearch" type="search" placeholder="Cerca un piatto" value="${esc(cSearch)}" aria-label="Cerca nel menù"></div>
      <button class="fbtn ${nFilters ? 'on' : ''}" data-act="c-filters" aria-label="Filtri per dieta e allergeni">${ic('filter', 20)}${nFilters ? `<span class="cbadge">${nFilters}</span>` : ''}</button>
    </div>
    ${cats.length > 1 ? `<nav class="chips" id="chips" aria-label="Categorie">${cats.map((c, n) => `<button data-act="c-cat" data-id="${n}" class="${n === 0 ? 'on' : ''}">${esc(c)}</button>`).join('')}</nav>` : ''}
    <main>
      ${cats.length ? cats.map((c, n) => `<section class="ccat" id="cat-${n}"><h2>${esc(c)}</h2>
        ${items.filter(i => i.cat === c).map(i => {
          const src = imgSrc(i.img);
          return `<div class="citem ${i.available === false ? 'off' : ''}" data-s="${esc((i.name + ' ' + i.desc + ' ' + i.tags.join(' ') + ' ' + i.allergens.join(' ')).toLowerCase())}" data-t="${esc(i.tags.join('|'))}" data-a="${esc(i.allergens.join('|'))}">
          <div class="info"><b>${esc(i.name)}</b>${i.featured ? `<span class="star" title="Consigliato">${ic('star', 14)}</span>` : ''}<small>${esc(i.desc)}</small>${infoHtml(i)}<div class="pr">${eur(i.price)}</div></div>
          <div class="cside">${src ? `<button class="thumb" data-act="c-view" data-id="${i.id}" aria-label="Vedi ${esc(i.name)}"><img class="dimg" src="${esc(src)}" alt="" loading="lazy" decoding="async"></button>` : ''}${i.available === false ? '<small class="muted">Esaurito</small>' : qty(i)}</div></div>`;
        }).join('')}
      </section>`).join('') + `<div class="cmsg slim" id="noRes" hidden><p class="muted">Nessun piatto corrisponde alla ricerca o ai filtri scelti.</p></div>
        <p class="legal">Hai allergie o intolleranze? Segnalalo al personale prima di ordinare.</p>`
        : '<div class="cmsg"><p class="muted">Il menù non è ancora disponibile.</p></div>'}
    </main>
    ${count && cOpen !== 'sheet' ? `<button class="cartbar" data-act="c-sheet"><span>${ic('cart', 18)} Vedi carrello (${count})</span><span>${eur(total)}</span></button>` : ''}

    ${cOpen === 'dish' && dish ? `<div class="overlay" data-act="c-close"></div>
    <section class="sheet dish ${dishSrc ? 'hasimg' : ''} ${enter}" role="dialog" aria-label="${esc(dish.name)}">
      <button class="close" data-act="c-close" aria-label="Chiudi">${ic('x', 22)}</button>
      ${dishSrc ? `<div class="dishimg"><img class="dimg" src="${esc(dishSrc)}" alt="${esc(dish.name)}"></div>` : ''}
      <h2>${esc(dish.name)}${dish.featured ? `<span class="star" title="Consigliato">${ic('star', 16)}</span>` : ''}</h2>
      ${dish.desc ? `<p class="muted">${esc(dish.desc)}</p>` : ''}
      ${infoHtml(dish)}
      <div class="dishfoot"><b class="dprice">${eur(dish.price)}</b>${dish.available === false ? '<span class="tag out">Esaurito</span>' : qty(dish)}</div>
    </section>` : ''}

    ${cOpen === 'help' ? `<div class="overlay" data-act="c-close"></div>
    <section class="sheet ${enter}" role="dialog" aria-label="Serve aiuto?">
      <button class="close" data-act="c-close" aria-label="Chiudi">${ic('x', 22)}</button>
      <h2>Serve aiuto?</h2>
      <p class="muted">Il personale riceve subito la richiesta al tavolo ${table}.</p>
      <button class="svcbtn" data-act="c-call" data-id="cameriere" ${callPending('cameriere') ? 'disabled' : ''}>${ic('wave', 24)}<span><b>Chiama il cameriere</b><small>${callPending('cameriere') ? 'Richiesta inviata, arriviamo' : 'Arriviamo al tavolo'}</small></span></button>
      <button class="svcbtn" data-act="c-call" data-id="conto" ${callPending('conto') ? 'disabled' : ''}>${ic('card', 24)}<span><b>Richiedi il conto</b><small>${callPending('conto') ? 'Richiesta inviata, arriviamo' : 'Portiamo il conto al tavolo'}</small></span></button>
    </section>` : ''}

    ${cOpen === 'filters' ? `<div class="overlay" data-act="c-close"></div>
    <section class="sheet ${enter}" role="dialog" aria-label="Filtri">
      <button class="close" data-act="c-close" aria-label="Chiudi">${ic('x', 22)}</button>
      <h2>Filtri</h2>
      <h3>Mostra solo i piatti</h3>
      <div class="checks pills">${TAGS.map(x => `<label><input type="checkbox" data-f="tag" value="${x}" ${cTags.has(x) ? 'checked' : ''}><span>${x}</span></label>`).join('')}</div>
      <h3>Escludi i piatti con</h3>
      <div class="checks pills">${ALLERGENS.map(x => `<label><input type="checkbox" data-f="avoid" value="${x}" ${cAvoid.has(x) ? 'checked' : ''}><span>${x}</span></label>`).join('')}</div>
      <p class="muted" style="margin-top:14px;font-size:13px">Il filtro è un aiuto, non una garanzia: in caso di allergia chiedi sempre al personale.</p>
      <div class="sheet-actions"><button class="btn ghost" data-act="c-reset">Azzera filtri</button><button class="btn" data-act="c-close">Mostra i piatti</button></div>
    </section>` : ''}

    ${cOpen === 'sheet' ? `<div class="overlay" data-act="c-close"></div>
    <section class="sheet ${enter}" role="dialog" aria-label="Il tuo ordine">
      <button class="close" data-act="c-close" aria-label="Chiudi">${ic('x', 22)}</button>
      <h2>Il tuo ordine</h2>
      ${cBanner ? `<div class="okbanner">${ic('check', 18)}<span>${esc(cBanner)}</span></div>` : ''}
      ${count ? `${cartLines}
        <div class="ctotal"><span>Totale</span><span>${eur(total)}</span></div>
        <label for="cNote">Messaggio per il ristorante (facoltativo)</label>
        <textarea id="cNote" rows="2" maxlength="300" placeholder="Es. senza cipolla, cotto al sangue">${esc(cartNote)}</textarea>
        <button class="btn wide" style="margin-top:14px" data-act="c-send">Invia ordine</button>`
        : '<p class="muted">Il carrello è vuoto. Aggiungi qualcosa dal menù.</p>'}
      ${mine.length ? `<h3>I tuoi ordini inviati</h3>${mine.map(o => `<div class="myorder">
        <div class="mh"><b>Ordine #${o.n} · ${ftime(o.at)}</b><span class="badge ${o.status}">${STATUS_LABEL[o.status]}</span></div>
        ${track(o)}
        <p>${o.items.map(i => `${i.qty}× ${esc(i.name)}`).join(', ')}</p>
        ${o.note ? `<p class="muted">Nota: ${esc(o.note)}</p>` : ''}
        ${o.messages.map(m => `<p class="msg">Tu: ${esc(m.text)}</p>`).join('')}
        ${['nuovo', 'preparazione'].includes(o.status) ? `<div class="msgform"><input id="msg-${o.id}" maxlength="200" placeholder="Scrivi per modificare l'ordine" aria-label="Messaggio per l'ordine ${o.n}"><button class="btn small" data-act="c-msg" data-id="${o.id}">Invia</button></div>` : ''}
      </div>`).join('')}
      <div class="ctotal"><span>Ordinato finora</span><span>${eur(mineTotal)}</span></div>` : ''}
    </section>` : ''}
  </div>`;
  cEnter = false;
  syncLock();
  applySearch();
  window.scrollTo(0, y);
  const chips = $('#chips'); if (chips) chips.scrollLeft = cx;
  const sh = $('.sheet'); if (sh) sh.scrollTop = sy;
  spy();
}

/* =====================================================
   AZIONI (click su elementi con data-act)
   ===================================================== */
const actions = {
  'theme'() { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; applyTheme(t); try { localStorage.setItem(THEME_KEY, t); } catch { } refresh(); },

  /* ---- admin: ristoranti e account ---- */
  'new-rest'() {
    openModal('Nuovo ristorante e account', restForm({}, true), async d => {
      if (emailTaken(d.email)) { toast('Esiste già un account con questa email'); return false; }
      const { password, ...rest } = d;
      const r = { id: uid(), suspended: false, color: '#0f5c4a', cats: [...DEFAULT_CATS], ...rest, name: rest.name.trim(), email: rest.email.trim(), tables: +rest.tables, passHash: await hash(password) };
      ensureTokens(r);
      db.restaurants.push(r); if (!menuRid) menuRid = r.id;
      save(); refresh(); toast('Ristorante e account creati');
    });
  },
  'edit-rest'(id) {
    openModal('Modifica ristorante', restForm(db.restaurants.find(x => x.id === id)), d => {
      if (emailTaken(d.email, id)) { toast('Esiste già un account con questa email'); return false; }
      const r = db.restaurants.find(x => x.id === id);
      Object.assign(r, d, { email: d.email.trim(), tables: +d.tables }); ensureTokens(r);
      save(); refresh(); toast('Modifiche salvate');
    });
  },
  'creds'(id) {
    const r = db.restaurants.find(x => x.id === id);
    openModal('Account di ' + r.name, `
      <p>Email: <b>${esc(r.email)}</b></p>
      <p class="muted" style="margin-top:6px">La password non è visibile perché è salvata cifrata. Se il ristoratore l'ha dimenticata, generane una nuova.</p>
      <p style="margin-top:12px">Link di accesso:</p><p class="qrlink">${esc(siteUrl() + '#/ristoratore')}</p>
      <p style="margin-top:14px"><button type="button" class="btn" data-act="reset-pass" data-id="${r.id}">Genera nuova password</button></p>`, null);
  },
  async 'reset-pass'(id) {
    const r = db.restaurants.find(x => x.id === id);
    if (!(await ask('Nuova password', `Generare una nuova password per <b>${esc(r.name)}</b>? Quella attuale smetterà di funzionare.`, 'Genera'))) return;
    const pw = rnd(8);
    r.passHash = await hash(pw); delete r.demo; save();
    openModal('Nuova password', `<p>Comunica al ristoratore questi dati. La password non verrà più mostrata.</p>
      <p style="margin-top:12px">Email: <b>${esc(r.email)}</b></p>
      <p>Password: <b class="mono">${esc(pw)}</b></p>`, null);
  },
  async 'del-rest'(id) {
    const r = db.restaurants.find(x => x.id === id);
    if (!(await ask('Elimina ristorante', `Eliminare <b>${esc(r.name)}</b>, il suo menù e i suoi ordini? L'operazione non si può annullare.`, 'Elimina', true))) return;
    db.restaurants = db.restaurants.filter(x => x.id !== id);
    db.menu = db.menu.filter(m => m.rid !== id);
    db.orders = db.orders.filter(o => o.rid !== id);
    db.calls = db.calls.filter(c => c.rid !== id);
    save(); refresh(); toast('Ristorante eliminato');
  },
  'open-menu'(id) { menuRid = id; view = 'menu'; refresh(); window.scrollTo(0, 0); },
  async 'renew'(id) {
    const r = db.restaurants.find(x => x.id === id);
    const price = planOf(r.plan).price;
    if (!(await ask('Registra pagamento', `Registrare il pagamento di <b>${eur(price)}</b> per <b>${esc(r.name)}</b> e rinnovare di 1 mese?`, 'Registra'))) return;
    r.expires = addMonths(r.expires > today() ? r.expires : today(), 1); r.suspended = false;
    db.payments.push({ id: uid(), rid: r.id, name: r.name, amount: price, at: Date.now() });
    save(); refresh(); toast('Pagamento registrato. Scadenza: ' + fdate(r.expires));
  },
  'toggle'(id) {
    const r = db.restaurants.find(x => x.id === id);
    r.suspended = !r.suspended; save(); refresh();
    toast(r.suspended ? 'Abbonamento sospeso' : 'Abbonamento riattivato');
  },
  'edit-plan'(id) {
    const p0 = db.plans.find(x => x.id === id);
    openModal('Modifica piano ' + p0.name, `
      <label for="pN">Nome</label><input id="pN" name="name" required value="${esc(p0.name)}">
      <label for="pP">Prezzo mensile (€)</label><input id="pP" name="price" type="number" step="1" min="0" required value="${p0.price}">
      <label for="pD">Descrizione</label><input id="pD" name="desc" value="${esc(p0.desc)}">`,
      d => { const p = db.plans.find(x => x.id === id); p.name = d.name; p.price = +d.price; p.desc = d.desc; save(); refresh(); toast('Piano aggiornato'); });
  },

  /* ---- admin: impostazioni ---- */
  'a-baseurl'() {
    const v = $('#baseUrl').value.trim();
    if (v && !/^https?:\/\//i.test(v)) { toast("L'indirizzo deve iniziare con https://"); return; }
    db.settings.baseUrl = v; save(); toast('Indirizzo salvato. Ristampa i QR dei tavoli');
  },
  'a-pass'() {
    openModal('Cambia password admin', `
      <label for="ap1">Nuova password (min. 6 caratteri)</label><input id="ap1" name="p1" type="password" minlength="6" required autocomplete="new-password">
      <label for="ap2">Ripeti la password</label><input id="ap2" name="p2" type="password" minlength="6" required autocomplete="new-password">`, async d => {
      if (d.p1 !== d.p2) { toast('Le due password non coincidono'); return false; }
      db.settings.adminHash = await hash(d.p1); save(); toast('Password aggiornata');
    });
  },
  'a-export'() { download(`menupro-backup-${today()}.json`, new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' })); },
  'a-import'() { $('#importFile').click(); },
  async 'a-reset'() {
    if (!(await ask('Cancella tutti i dati', 'Cancellare <b>tutti</b> i dati (ristoranti, menù, foto, ordini)? Scarica prima un backup: l\'operazione non si può annullare.', 'Cancella tutto', true))) return;
    localStorage.removeItem(KEY); adminSet(false); rSet(null); location.hash = ''; location.reload();
  },
  'a-logout'() { adminSet(false); refresh(); },

  /* ---- menù: piatti e categorie (admin e ristoratore) ---- */
  'new-cat'(rid) {
    openModal('Crea categoria', `<label for="ncN">Nome categoria</label><input id="ncN" name="name" required placeholder="Es. Menù bambini">`, d => {
      const name = d.name.trim();
      if (!name) return false;
      if (catsOf(rid).some(c => c.toLowerCase() === name.toLowerCase())) { toast('Questa categoria esiste già'); return false; }
      addCat(rid, name); save(); refresh(); toast('Categoria creata');
    });
  },
  'new-item'(rid) {
    openModal('Nuovo piatto', itemForm(rid), d => {
      const x = itemData(rid, d);
      if (!x) { toast('Inserisci il nome della nuova categoria'); return false; }
      const row = { id: uid(), rid, ...x };
      db.menu.push(row);
      if (!saveOrUndo(() => { db.menu = db.menu.filter(m => m !== row); })) return false;
      refresh(); toast('Piatto aggiunto');
    });
  },
  'edit-item'(id) {
    const i0 = db.menu.find(x => x.id === id);
    openModal('Modifica piatto', itemForm(i0.rid, i0), d => {
      const x = itemData(i0.rid, d);
      if (!x) { toast('Inserisci il nome della nuova categoria'); return false; }
      const idx = db.menu.findIndex(y => y.id === id), prev = db.menu[idx];
      db.menu[idx] = { ...prev, ...x };
      if (!saveOrUndo(() => { db.menu[idx] = prev; })) return false;
      refresh(); toast('Piatto aggiornato');
    });
  },
  'dup-item'(id) {
    const i = db.menu.find(x => x.id === id);
    const copy = { ...i, id: uid(), name: i.name + ' (copia)', allergens: [...i.allergens], tags: [...i.tags] };
    db.menu.splice(db.menu.indexOf(i) + 1, 0, copy);
    if (!saveOrUndo(() => { db.menu = db.menu.filter(m => m !== copy); })) return;
    refresh(); toast('Piatto duplicato: modificane il nome');
  },
  async 'del-item'(id) {
    const i = db.menu.find(x => x.id === id);
    if (!(await ask('Elimina piatto', `Eliminare <b>${esc(i.name)}</b> dal menù?`, 'Elimina', true))) return;
    db.menu = db.menu.filter(x => x.id !== id); save(); refresh(); toast('Piatto eliminato');
  },
  'avail-item'(id) { const i = db.menu.find(x => x.id === id); i.available = i.available === false; save(); refresh(); toast(i.available === false ? 'Segnato come esaurito' : 'Di nuovo disponibile'); },
  'cat-up'(n) { moveCat(+n, -1); },
  'cat-down'(n) { moveCat(+n, 1); },
  'cat-ren'(n) {
    const rid = curRid(), old = catsOf(rid)[+n];
    openModal('Rinomina categoria', `<label for="rcN">Nome</label><input id="rcN" name="name" required value="${esc(old)}">`, d => {
      const nn = d.name.trim(); if (!nn) return false;
      if (catsOf(rid).some(c => c !== old && c.toLowerCase() === nn.toLowerCase())) { toast('Questa categoria esiste già'); return false; }
      const order = catsOf(rid).map(c => c === old ? nn : c);
      db.menu.forEach(m => { if (m.rid === rid && m.cat === old) m.cat = nn; });
      db.restaurants.find(x => x.id === rid).cats = order;
      save(); refresh(); toast('Categoria rinominata');
    });
  },
  async 'cat-del'(n) {
    const rid = curRid(), c = catsOf(rid)[+n];
    if (db.menu.some(m => m.rid === rid && m.cat === c)) { toast('Sposta o elimina prima i piatti di questa categoria'); return; }
    if (!(await ask('Elimina categoria', `Eliminare la categoria <b>${esc(c)}</b>?`, 'Elimina', true))) return;
    db.restaurants.find(x => x.id === rid).cats = catsOf(rid).filter(x => x !== c);
    save(); refresh(); toast('Categoria eliminata');
  },

  /* ---- foto del piatto (dentro il form) ---- */
  'img-pick'() { $('#imgFile')?.click(); },
  'img-clear'() {
    const v = $('#imgVal'); if (!v) return;
    v.value = ''; const u = $('#imgUrl'); if (u) u.value = '';
    setPrev('');
  },

  /* ---- ristoratore ---- */
  'r-next'(id) { const o = db.orders.find(x => x.id === id); o.status = o.status === 'nuovo' ? 'preparazione' : 'servito'; save(); refresh(); },
  async 'r-cancel'(id) {
    if (!(await ask('Annulla ordine', 'Annullare questo ordine? Il cliente vedrà che è stato annullato.', 'Annulla ordine', true))) return;
    const o = db.orders.find(x => x.id === id); o.status = 'annullato'; o.unread = false; save(); refresh(); toast('Ordine annullato');
  },
  'r-read'(id) { db.orders.find(x => x.id === id).unread = false; save(); refresh(); },
  'r-call-done'(id) { db.calls.find(x => x.id === id).done = true; save(); refresh(); },
  'r-sound'() { soundOn = !soundOn; if (soundOn) beep(); refresh(); },
  'r-print'(id) {
    const o = db.orders.find(x => x.id === id);
    const w = window.open('', '_blank', 'width=380,height=600');
    if (!w) { toast('Consenti i popup per stampare'); return; }
    w.document.write(`<!doctype html><meta charset="utf-8"><title>Comanda</title><style>body{font-family:monospace;padding:12px;font-size:16px}h2{margin:0}hr{border:0;border-top:1px dashed #000}</style>
      <h2>Tavolo ${o.table} · #${o.n}</h2><p>${ftime(o.at)}</p><hr>
      ${o.items.map(i => `<div><b>${i.qty} x</b> ${esc(i.name)}</div>`).join('')}
      ${o.note ? `<hr><b>NOTA:</b> ${esc(o.note)}` : ''}
      ${o.messages.map(m => `<div>Msg: ${esc(m.text)}</div>`).join('')}`);
    w.document.close(); w.focus(); w.print();
  },
  async 'r-close'(n) {
    const rid = rSess();
    const open = db.orders.filter(o => o.rid === rid && o.table === +n && isOpen(o));
    const total = round2(open.reduce((s, o) => s + orderTotal(o), 0));
    if (!(await ask('Chiudi il conto', `Chiudere il conto del tavolo ${n}? Totale <b>${eur(total)}</b>.`, 'Chiudi il conto'))) return;
    open.forEach(o => o.status = 'chiuso');
    db.calls.forEach(c => { if (c.rid === rid && c.table === +n) c.done = true; });
    save(); refresh(); toast('Conto chiuso');
  },
  'r-qr'(n) {
    const rid = rSess(), url = tableUrl(rid, n);
    const local = location.protocol === 'file:' && !db.settings.baseUrl;
    openModal('QR tavolo ' + n, `<div class="qrbox"><div id="qrBox"></div></div>
      <p class="qrlink">${esc(url)}</p>
      ${local ? '<p class="warn">Stai aprendo il sito dal computer: questo QR non funzionerà sui telefoni finché il sito non sarà online. L\'amministratore deve impostare l\'indirizzo pubblico.</p>' : ''}
      <p style="margin-top:12px" class="btns"><button type="button" class="btn small" data-act="r-qr-dl" data-id="${n}">${ic('download', 15)} Scarica PNG</button>
      <a class="btn small ghost" href="${esc(url)}" target="_blank" rel="noopener">Apri come cliente</a></p>`, null);
    if (typeof QRCode !== 'undefined') new QRCode($('#qrBox'), { text: url, width: 220, height: 220 });
    else $('#qrBox').textContent = 'Libreria QR non caricata: controlla la connessione.';
  },
  'r-qr-dl'(n) {
    const c = document.querySelector('#qrBox canvas'); if (!c) return;
    const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = `tavolo-${n}.png`; a.click();
  },
  'r-qr-all'() {
    const r = curRest();
    if (typeof QRCode === 'undefined') { toast('Libreria QR non caricata: controlla la connessione'); return; }
    const tmp = document.createElement('div'); tmp.style.cssText = 'position:fixed;left:-9999px'; document.body.appendChild(tmp);
    let cards = '';
    for (let n = 1; n <= r.tables; n++) {
      const d = document.createElement('div'); tmp.appendChild(d);
      new QRCode(d, { text: tableUrl(r.id, n), width: 220, height: 220 });
      const src = d.querySelector('canvas')?.toDataURL() || '';
      cards += `<div class="c"><h2>${esc(r.name)}</h2><img src="${src}" alt=""><p>Tavolo ${n}</p><small>Inquadra il codice per vedere il menù e ordinare</small></div>`;
    }
    tmp.remove();
    const w = window.open('', '_blank');
    if (!w) { toast('Consenti i popup per stampare'); return; }
    w.document.write(`<!doctype html><meta charset="utf-8"><title>QR tavoli</title><style>body{font-family:sans-serif;margin:0}.g{display:grid;grid-template-columns:repeat(2,1fr)}.c{text-align:center;padding:24px;border:1px dashed #999;page-break-inside:avoid}.c img{width:220px;height:220px}h2{margin:0 0 8px}p{font-size:28px;font-weight:700;margin:8px 0 0}</style><div class="g">${cards}</div>`);
    w.document.close(); setTimeout(() => w.print(), 400);
  },
  async 'r-regen'() {
    if (!(await ask('Rigenera i codici QR', 'Rigenerare tutti i codici QR? Quelli già stampati smetteranno di funzionare e dovrai stamparli di nuovo.', 'Rigenera', true))) return;
    const r = curRest(); r.tokens = {}; ensureTokens(r);
    save(); refresh(); toast('Codici rigenerati: stampa di nuovo i QR dei tavoli');
  },
  'r-settings'() {
    const r = curRest();
    openModal('Impostazioni', `
      <label for="sT">Numero tavoli</label><input id="sT" name="tables" type="number" min="1" max="200" required value="${r.tables}">
      <label for="sC">Colore del menù cliente</label><input id="sC" name="color" type="color" value="${validColor(r.color)}">
      <label for="sP">Nuova password (lascia vuoto per non cambiarla)</label><input id="sP" name="password" type="password" minlength="6" autocomplete="new-password">`, async d => {
      const x = curRest();
      x.tables = +d.tables; x.color = validColor(d.color); ensureTokens(x);
      if (d.password) { x.passHash = await hash(d.password); delete x.demo; }
      save(); refresh(); toast('Impostazioni salvate');
    });
  },
  'r-csv'() {
    const r = curRest();
    const q = v => { let s = String(v); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
    const rows = [['N.', 'Data', 'Ora', 'Tavolo', 'Stato', 'Piatti', 'Nota', 'Totale €'],
      ...db.orders.filter(o => o.rid === r.id).sort((a, b) => a.at - b.at).map(o => [o.n, fdate(o.at), ftime(o.at), o.table, STATUS_LABEL[o.status], o.items.map(i => i.qty + 'x ' + i.name).join(' | '), o.note || '', orderTotal(o).toFixed(2).replace('.', ',')])];
    download(`ordini-${today()}.csv`, new Blob(['\ufeff' + rows.map(x => x.map(q).join(';')).join('\n')], { type: 'text/csv;charset=utf-8' }));
  },
  'r-logout'() { rSet(null); refresh(); },

  /* ---- cliente ---- */
  'c-help'() { openClient('help'); },
  'c-filters'() { openClient('filters'); },
  'c-sheet'() { cBanner = ''; openClient('sheet'); },
  'c-view'(id) { cDish = id; openClient('dish'); },
  'c-close'() { cOpen = null; cDish = null; cBanner = ''; refresh(); },
  'c-reset'() { cTags.clear(); cAvoid.clear(); refresh(); },
  'c-cat'(n) { document.getElementById('cat-' + n)?.scrollIntoView({ behavior: 'smooth' }); },
  'c-inc'(id) {
    const i = db.menu.find(x => x.id === id);
    if (!i || i.available === false) return;
    cart[id] = Math.min(20, (cart[id] || 0) + 1); saveCart(); refresh();
  },
  'c-dec'(id) { cart[id] = (cart[id] || 0) - 1; if (cart[id] <= 0) delete cart[id]; saveCart(); refresh(); },
  async 'c-send'() {
    const { rid, table, tok } = cur();
    if (!tableOk(rid, table, tok)) { refresh(); return; }
    const pick = () => db.menu.filter(m => m.rid === rid && cart[m.id] && m.available !== false).map(m => ({ name: m.name, price: m.price, qty: cart[m.id] }));
    const first = pick();
    if (!first.length) return;
    if (db.orders.filter(o => o.rid === rid && o.table === table && o.status === 'nuovo').length >= 5) { toast('Ci sono già diversi ordini in attesa: attendi che vengano presi in carico'); return; }
    const tot = round2(first.reduce((s, i) => s + i.price * i.qty, 0));
    if (!(await ask("Inviare l'ordine?", `Totale <b>${eur(tot)}</b>. Il ristorante lo riceve subito.`, 'Invia ordine'))) return;
    if (!tableOk(rid, table, tok)) { refresh(); return; }
    const items = pick();
    if (!items.length) return;
    const n = Math.max(0, ...db.orders.filter(o => o.rid === rid).map(o => o.n || 0)) + 1;
    const o = { id: uid(), n, rid, table, items, note: cartNote.trim().slice(0, 300), status: 'nuovo', messages: [], unread: false, at: Date.now() };
    db.orders.push(o); addMine(o.id);
    cart = {}; cartNote = ''; saveCart();
    cBanner = `Ordine #${n} inviato. Qui sotto vedi a che punto è.`;
    save(); refresh();
  },
  'c-msg'(id) {
    const { rid, table, tok } = cur();
    if (!tableOk(rid, table, tok)) { refresh(); return; }
    const v = $('#msg-' + id)?.value.trim().slice(0, 200);
    if (!v) return;
    const o = db.orders.find(x => x.id === id);
    if (!o || !['nuovo', 'preparazione'].includes(o.status)) { refresh(); return; }
    o.messages.push({ text: v, at: Date.now() }); o.unread = true;
    save(); refresh(); toast('Messaggio inviato');
  },
  'c-call'(type) {
    const { rid, table, tok } = cur();
    if (!tableOk(rid, table, tok)) { refresh(); return; }
    if (db.calls.some(c => c.rid === rid && c.table === table && c.type === type && !c.done)) { toast('Richiesta già inviata, arriviamo subito'); return; }
    db.calls.push({ id: uid(), rid, table, type, at: Date.now(), done: false });
    cOpen = null; save(); refresh(); toast(type === 'conto' ? 'Conto richiesto' : 'Cameriere chiamato');
  }
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (b && !b.disabled) actions[b.dataset.act]?.(b.dataset.id);
});

document.addEventListener('change', e => {
  /* "Crea nuova categoria" dentro il form del piatto */
  if (e.target.id === 'catSel') {
    const w = $('#newCatWrap'); w.hidden = e.target.value !== '__new__';
    if (!w.hidden) $('#newCat').focus();
    return;
  }
  /* foto scelta dal dispositivo: la riduco e la comprimo */
  if (e.target.id === 'imgFile') {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    if (!/^image\//.test(f.type)) { toast('Scegli un file immagine'); return; }
    toast('Sto preparando la foto…');
    compressImage(f).then(d => {
      if (!$('#imgVal')) return;                      // la finestra è stata chiusa nel frattempo
      $('#imgVal').value = d; $('#imgUrl').value = ''; setPrev(d);
      toast(`Foto pronta (${Math.round(d.length * .75 / 1024)} KB)`);
    }).catch(() => toast('Non riesco a leggere questa foto. Prova con un altro file'));
    return;
  }
  /* foto da link */
  if (e.target.id === 'imgUrl') {
    const v = e.target.value.trim(), val = $('#imgVal');
    if (!val) return;
    if (!v) { if (!val.value.startsWith('data:')) { val.value = ''; setPrev(''); } return; }
    if (!/^https?:\/\/\S+$/i.test(v)) { toast('Il link deve iniziare con https://'); return; }
    val.value = v; setPrev(v);
    return;
  }
  /* filtri del cliente */
  if (e.target.dataset?.f) {
    const set = e.target.dataset.f === 'tag' ? cTags : cAvoid;
    e.target.checked ? set.add(e.target.value) : set.delete(e.target.value);
    applySearch();
    return;
  }
  /* modifica rapida del prezzo dalla lista del menù */
  const id = e.target.dataset?.price;
  if (id) {
    const i = db.menu.find(x => x.id === id);
    i.price = round2(Math.max(0, +e.target.value || 0)); e.target.value = i.price;
    save(); toast('Prezzo aggiornato');
    return;
  }
  /* import backup */
  if (e.target.id === 'importFile') {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = async () => {
      try {
        const x = JSON.parse(rd.result);
        if (!x || !Array.isArray(x.restaurants) || !Array.isArray(x.menu)) throw 0;
        if (!(await ask('Importa backup', 'Importare il backup? I dati attuali verranno sostituiti.', 'Importa', true))) return;
        db = x; save(); location.reload();
      } catch { toast('File di backup non valido'); }
    };
    rd.readAsText(f); e.target.value = '';
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'cNote') { cartNote = e.target.value; saveCart(); }
  if (e.target.id === 'cSearch') { cSearch = e.target.value; applySearch(); }
  if (e.target.id === 'rSearch') {
    const q = e.target.value.trim().toLowerCase();
    $$('tr[data-s]').forEach(tr => tr.hidden = !!q && !tr.dataset.s.includes(q));
  }
  if (e.target.id === 'mSearch') {
    const q = e.target.value.trim().toLowerCase();
    $$('.item[data-s]').forEach(it => it.hidden = !!q && !it.dataset.s.includes(q));
    $$('.panel.cat').forEach(p => p.hidden = !!q && ![...p.querySelectorAll('.item')].some(i => !i.hidden));
  }
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#modalBg').hidden) closeModal();
  else if (cOpen && location.hash.startsWith('#/c/')) { cOpen = null; cDish = null; cBanner = ''; refresh(); }
});
sb.from('piano').select('*').then(r => console.log('Supabase:', r));

/* ===== Avvio ===== */
(async () => { hydrateIcons(); await migrate(); route(); })();

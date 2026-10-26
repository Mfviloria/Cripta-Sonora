"use strict";
/*
 * Cripta Sonora: servidor sin dependencias (solo módulos de Node).
 *   /               encuesta para los participantes
 *   /facilitador    panel del facilitador (pide un PIN)
 *   /api/*          almacenamiento de respuestas, protegido por reglas
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data.json");
const PUBLIC_DIR = path.join(__dirname, "public");
const MAX_BODY = 64 * 1024;
const MAX_DOCS = 5000;

/* ---------- almacenamiento en un archivo JSON ---------- */
let store = { meta: {}, docs: {} };
try {
  store = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
} catch (e) {
  /* primera ejecución */
}
store.meta = store.meta || {};
store.docs = store.docs || {};

const PIN =
  process.env.FACILITATOR_PIN ||
  store.meta.pin ||
  (store.meta.pin = String(crypto.randomInt(100000, 1000000)));

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const tmp = DATA_FILE + ".tmp";
    fs.writeFile(tmp, JSON.stringify(store), (err) => {
      if (!err) fs.rename(tmp, DATA_FILE, () => {});
    });
  }, 250);
}
save();

/* ---------- autenticación y reglas ---------- */
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function whoIs(req) {
  const pin = req.headers["x-pin"];
  const uid = String(req.headers["x-uid"] || "");
  return {
    admin: Boolean(pin) && safeEqual(pin, PIN),
    uid: /^[A-Za-z0-9_-]{8,64}$/.test(uid) ? uid : null,
  };
}

/* Reglas, equivalentes a las de la versión en Claude:
 *  responses/<id>   el participante solo lee y escribe el suyo
 *  matches/<id>     el participante solo lee el suyo
 *  state/*          todos leen
 *  todo lo demás    solo el facilitador                       */
function allowed(who, method, docPath) {
  if (who.admin) return true;
  const [col, id] = docPath.split("/");
  if (col === "responses") return Boolean(who.uid) && id === who.uid;
  if (col === "matches") return method === "GET" && Boolean(who.uid) && id === who.uid;
  if (col === "state") return method === "GET";
  return false;
}

const SEGMENT = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;
const COLLECTIONS = new Set(["responses", "matches", "state"]);
function parsePath(p, wantDoc) {
  if (typeof p !== "string" || p.length > 400) return null;
  const parts = p.split("/");
  if (!parts.every((s) => SEGMENT.test(s) && s !== "." && s !== "..")) return null;
  if (!COLLECTIONS.has(parts[0])) return null;
  if (wantDoc ? parts.length !== 2 : parts.length !== 1) return null;
  return parts.join("/");
}

/* ---------- utilidades HTTP ---------- */
function send(res, status, body, headers) {
  const isString = typeof body === "string";
  res.writeHead(status, {
    "Content-Type": isString ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  res.end(isString ? body : JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooBig = false;
    const chunks = [];
    req.on("data", (c) => {
      if (tooBig) return;
      size += c.length;
      if (size > MAX_BODY) {
        tooBig = true;
        reject(Object.assign(new Error("too large"), { status: 413 }));
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      if (tooBig) return;
      try {
        const v = JSON.parse(Buffer.concat(chunks).toString("utf8") || "null");
        if (v === null || typeof v !== "object" || Array.isArray(v)) throw new Error("bad");
        resolve(v);
      } catch (e) {
        reject(Object.assign(new Error("bad json"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

/* ---------- limitador simple por IP (solo para escrituras) ---------- */
const hits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const rec = hits.get(ip) || { n: 0, t: now };
  if (now - rec.t > 10000) {
    rec.n = 0;
    rec.t = now;
  }
  rec.n += 1;
  hits.set(ip, rec);
  return rec.n > 200;
}
setInterval(() => hits.clear(), 60000).unref();

/* ---------- archivos estáticos (lista cerrada) ---------- */
const FILES = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/facilitador": ["facilitador.html", "text/html; charset=utf-8"],
  "/facilitador/": ["facilitador.html", "text/html; charset=utf-8"],
  "/app.js": ["app.js", "text/javascript; charset=utf-8"],
  "/style.css": ["style.css", "text/css; charset=utf-8"],
};

function serveStatic(req, res, pathname) {
  const entry = FILES[pathname];
  if (!entry) return false;
  fs.readFile(path.join(PUBLIC_DIR, entry[0]), (err, buf) => {
    if (err) return send(res, 500, "No se pudo leer el archivo.");
    const headers = {
      "Content-Type": entry[1],
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    };
    if (pathname.startsWith("/facilitador")) headers["X-Robots-Tag"] = "noindex, nofollow";
    res.writeHead(200, headers);
    res.end(req.method === "HEAD" ? undefined : buf);
  });
  return true;
}

/* ---------- API ---------- */
async function handleApi(req, res, url) {
  const who = whoIs(req);

  if (url.pathname === "/api/whoami") {
    return send(res, 200, { admin: who.admin });
  }

  if (url.pathname === "/api/doc") {
    const p = parsePath(url.searchParams.get("path"), true);
    if (!p) return send(res, 400, { error: "path" });
    const method = req.method;
    if (!["GET", "PUT", "DELETE"].includes(method)) return send(res, 405, { error: "method" });
    if (!allowed(who, method, p)) return send(res, 403, { error: "forbidden" });
    if (method !== "GET" && tooMany(req.socket.remoteAddress || "x")) return send(res, 429, { error: "rate" });

    if (method === "GET") return send(res, 200, { data: store.docs[p] === undefined ? null : store.docs[p] });
    if (method === "DELETE") {
      delete store.docs[p];
      save();
      return send(res, 200, { ok: true });
    }
    const body = await readJson(req);
    if (!(p in store.docs) && Object.keys(store.docs).length >= MAX_DOCS) return send(res, 507, { error: "quota" });
    store.docs[p] = body;
    save();
    return send(res, 200, { ok: true });
  }

  if (url.pathname === "/api/col") {
    const c = parsePath(url.searchParams.get("path"), false);
    if (!c) return send(res, 400, { error: "path" });
    if (req.method !== "GET") return send(res, 405, { error: "method" });
    if (!who.admin) return send(res, 403, { error: "forbidden" });
    const docs = Object.keys(store.docs)
      .filter((k) => k.startsWith(c + "/"))
      .map((k) => ({ id: k.slice(c.length + 1), data: store.docs[k] }));
    return send(res, 200, { docs });
  }

  return send(res, 404, { error: "not found" });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url).catch((e) => send(res, e.status || 500, { error: e.message || "error" }));
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Método no permitido.");
  if (!serveStatic(req, res, url.pathname)) send(res, 404, "No hay nada aquí.");
});

server.listen(PORT, () => {
  console.log("\n  Cripta Sonora lista");
  console.log("  Participantes:  http://localhost:" + PORT + "/");
  console.log("  Facilitador:    http://localhost:" + PORT + "/facilitador");
  console.log("  PIN del facilitador: " + PIN + "\n");
});

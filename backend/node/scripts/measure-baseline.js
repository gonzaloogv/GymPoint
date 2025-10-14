'use strict';

// Baseline performance measurement for key endpoints
// - Registers a temp user, logs in, then measures latencies for:
//   GET /api/gyms (public)
//   GET /api/gyms/filtro (auth)
//   GET /api/frequency/me (auth)

const http = require('http');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const RUNS = Number(process.env.MEASURE_RUNS || '100');

function request(method, path, { headers, body } = {}) {
  const url = new URL(path, BASE_URL);
  const payload = body ? Buffer.from(JSON.stringify(body)) : null;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(payload ? { 'Content-Length': String(payload.length) } : {}),
      ...(headers || {})
    }
  };
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    const req = http.request(url, opts, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const end = process.hrtime.bigint();
        const ms = Number(end - start) / 1e6;
        const text = Buffer.concat(chunks).toString('utf8');
        resolve({ status: res.statusCode, ms, body: text });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
}

async function main() {
  console.log(`[MEASURE] Base URL: ${BASE_URL}`);

  // 1) Register temp user
  const ts = Date.now();
  const email = `measure_${ts}@example.com`;
  const password = 'Measure#12345';
  const registerRes = await request('POST', '/api/auth/register', {
    body: {
      name: 'Measure',
      lastname: 'Bot',
      email,
      password,
      gender: 'O',
      locality: 'Test City',
      birth_date: null,
      role: 'USER',
      frequency_goal: 3
    }
  });
  if (registerRes.status >= 300) {
    console.error('[MEASURE] Register failed:', registerRes.status, registerRes.body);
    process.exit(1);
  }

  // 2) Login
  const loginRes = await request('POST', '/api/auth/login', {
    body: { email, password }
  });
  if (loginRes.status !== 200) {
    console.error('[MEASURE] Login failed:', loginRes.status, loginRes.body);
    process.exit(1);
  }
  let token;
  try {
    const parsed = JSON.parse(loginRes.body);
    token = parsed.token || parsed.accessToken; // soportar ambas claves
  } catch (e) {
    console.error('[MEASURE] Invalid login response:', loginRes.body);
    process.exit(1);
  }
  const authHeaders = { Authorization: `Bearer ${token}` };

  // 3) Measure helper
  async function measureLoop(label, method, path, opts = {}) {
    const times = [];
    let ok = 0, fail = 0;
    let firstFail = null;
    for (let i = 0; i < RUNS; i++) {
      try {
        const res = await request(method, path, opts);
        times.push(res.ms);
        if (res.status >= 200 && res.status < 300) {
          ok++;
        } else {
          fail++;
          if (!firstFail) firstFail = { status: res.status, body: res.body?.slice(0, 200) };
        }
      } catch (e) {
        fail++;
      }
    }
    const p50 = percentile(times, 50).toFixed(2);
    const p95 = percentile(times, 95).toFixed(2);
    console.log(`[MEASURE] ${label} -> runs=${RUNS} ok=${ok} fail=${fail} p50=${p50}ms p95=${p95}ms`);
    if (firstFail) {
      console.log(`[MEASURE] ${label} first fail -> status=${firstFail.status} body=${firstFail.body}`);
    }
  }

  // 4) Measure endpoints
  await measureLoop('GET /api/gyms', 'GET', '/api/gyms');
  await measureLoop('GET /api/gyms/filtro', 'GET', '/api/gyms/filtro', { headers: authHeaders });
  await measureLoop('GET /api/frequency/me', 'GET', '/api/frequency/me', { headers: authHeaders });
}

main().catch((err) => {
  console.error('[MEASURE] Unexpected error:', err);
  process.exit(1);
});

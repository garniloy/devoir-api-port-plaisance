/* ============================================
   MARINA API — DASHBOARD JS
   ============================================ */



/* ---- DATE ---- */
(function renderDate() {
  const el = document.getElementById('current-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
})();

/* ---- USER INFO ----
   Reads from a <meta name="user-*"> tag OR window.__USER injected server-side.
   Falls back to fetching /users/me if neither is present.
   Adapt the source to however your server exposes the logged-in user.
--------------------------------------------------------------- */
(async function loadUser() {
  const nameEl  = document.getElementById('user-name');
  const emailEl = document.getElementById('user-email');
  const avatarEl = document.getElementById('user-avatar');

  function applyUser(name, email) {
    if (nameEl)  nameEl.textContent  = name  || '–';
    if (emailEl) emailEl.textContent = email || '';
    if (avatarEl && name) {
      // initials: up to 2 chars
      const parts = name.trim().split(/\s+/);
      avatarEl.textContent = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
    }
  }

  const user = JSON.parse(localStorage.getItem('user'))
  // Fallback
  applyUser(user.name, user.email);
})();

/* ---- ONGOING RESERVATIONS ----
   Fetches all catways, then all reservations for each, and shows
   only those whose endDate is today or in the future.
--------------------------------------------------------------- */
(async function loadReservations() {
  const tbody  = document.getElementById('reservations-tbody');
  const countEl = document.getElementById('reservation-count');

  function setEmpty(msg) {
    tbody.innerHTML = `<tr class="table-empty"><td colspan="4">${msg}</td></tr>`;
    if (countEl) countEl.textContent = '0';
  }

  function formatDate(iso) {
    if (!iso) return '–';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  function isExpiringSoon(iso) {
    const diff = new Date(iso) - new Date();
    return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000; // within 3 days
  }

  try {
    // 1. Get all catways
    const catwaysRes = await fetch('/catways');
    if (!catwaysRes.ok) { setEmpty('Could not load catways.'); return; }
    const catways = await catwaysRes.json();
    if (!Array.isArray(catways) || catways.length === 0) {
      setEmpty('No catways found.');
      return;
    }

    // 2. For each catway, fetch reservations in parallel
    const now = new Date();
    const allReservations = [];

    await Promise.all(catways.map(async (catway) => {
      try {
        const r = await fetch(`/catways/${catway.catwayNumber}/reservations`);
        if (!r.ok) return;
        const reservations = await r.json();
        if (!Array.isArray(reservations)) return;
        reservations.forEach(res => {
          // Only show ongoing: endDate >= today
          if (new Date(res.endDate) >= now) {
            allReservations.push({ ...res, catwayNumber: catway.catwayNumber });
          }
        });
      } catch (_) { /* skip failed catway */ }
    }));

    if (allReservations.length === 0) {
      setEmpty('No ongoing reservations.');
      return;
    }

    // 3. Sort by endDate ascending
    allReservations.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    // 4. Render
    if (countEl) countEl.textContent = allReservations.length;

    tbody.innerHTML = allReservations.map(r => {
      const soon = isExpiringSoon(r.endDate);
      return `
        <tr>
          <td><span class="catway-badge">${r.catwayNumber}</span></td>
          <td>${escapeHtml(r.clientName)}</td>
          <td>${escapeHtml(r.boatName)}</td>
          <td><span class="date-cell${soon ? ' expiring-soon' : ''}">${formatDate(r.endDate)}${soon ? ' ⚠' : ''}</span></td>
        </tr>`;
    }).join('');

  } catch (err) {
    
    setEmpty('Failed to load reservations.');
  }
})();

/* ---- API EXPLORER ---- */
(function initExplorer() {
  const methodSelect  = document.getElementById('method');
  const urlInput      = document.getElementById('url');
  const sendBtn       = document.getElementById('send-btn');
  const addHeaderBtn  = document.getElementById('add-header-btn');
  const headersList   = document.getElementById('headers-list');
  const bodyInput     = document.getElementById('body-input');
  const formatBtn     = document.getElementById('format-btn');
  const responseArea  = document.getElementById('response-area');
  const statusBadge   = document.getElementById('status-badge');
  const responseTime  = document.getElementById('response-time');
  const responseOutput = document.getElementById('response-output');
  const copyResBtn    = document.getElementById('copy-response-btn');

  if (!sendBtn) return;

  // ---- Method select colour ----
  function updateMethodColor() {
    methodSelect.dataset.method = methodSelect.value;
    // enable/disable body textarea
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(methodSelect.value);
    bodyInput.disabled = !hasBody;
    bodyInput.style.opacity = hasBody ? '1' : '0.45';
    bodyInput.placeholder = hasBody ? '{\n  "key": "value"\n}' : 'Body not applicable for ' + methodSelect.value;
  }

  methodSelect.addEventListener('change', updateMethodColor);
  updateMethodColor();

  // ---- Tabs ----
  document.querySelectorAll('.fetch-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.fetch-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.fetch-tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab)?.classList.add('active');
    });
  });

  // ---- Add / remove headers ----
  addHeaderBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'header-row';
    row.innerHTML = `
      <input type="text" class="header-key" placeholder="Key" />
      <input type="text" class="header-val" placeholder="Value" />
      <button class="header-remove" title="Remove">–</button>`;
    row.querySelector('.header-remove').addEventListener('click', () => row.remove());
    headersList.appendChild(row);
    row.querySelector('.header-key').focus();
  });

  // ---- Format JSON ----
  formatBtn.addEventListener('click', () => {
    try {
      const parsed = JSON.parse(bodyInput.value);
      bodyInput.value = JSON.stringify(parsed, null, 2);
    } catch {
      bodyInput.classList.add('shake');
      setTimeout(() => bodyInput.classList.remove('shake'), 400);
    }
  });

  // ---- Send request ----
  sendBtn.addEventListener('click', sendRequest);
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendRequest(); });

  async function sendRequest() {
    const method = methodSelect.value;
    let url = urlInput.value.trim();

    if (!url) {
      urlInput.focus();
      urlInput.classList.add('shake');
      setTimeout(() => urlInput.classList.remove('shake'), 400);
      return;
    }

    // If user types a relative path like /catways, keep it.
    // If they type a full URL, use it directly.
    if (!url.startsWith('http') && !url.startsWith('/')) {
      url = '/' + url;
    }

    // Collect headers
    const headers = {};
    document.querySelectorAll('.header-row').forEach(row => {
      const k = row.querySelector('.header-key')?.value.trim();
      const v = row.querySelector('.header-val')?.value.trim();
      if (k && v) headers[k] = v;
    });

    // Build fetch options
    const options = { method, headers };

    if (['POST', 'PUT', 'PATCH'].includes(method) && bodyInput.value.trim()) {
      try {
        JSON.parse(bodyInput.value); // validate
        options.body = bodyInput.value;
      } catch {
        showResponse('error', '–', 0, '{ "error": "Invalid JSON in request body" }');
        return;
      }
    }

    // Loading state
    sendBtn.classList.add('loading');
    sendBtn.innerHTML = '<span class="spinner" style="width:12px;height:12px;border-width:2px"></span> Sending…';

    const start = performance.now();

    try {
      const res = await fetch(url, options);
      const elapsed = Math.round(performance.now() - start);
      let text;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const json = await res.json();
        text = JSON.stringify(json, null, 2);
      } else {
        text = await res.text();
      }
      showResponse(res.status, res.status, elapsed, text);
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      showResponse('error', 'Network error', elapsed, `{ "error": "${escapeHtml(err.message)}" }`);
    } finally {
      sendBtn.classList.remove('loading');
      sendBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send';
    }
  }

  function showResponse(status, label, ms, body) {
    responseArea.style.display = 'block';

    // Status badge class
    statusBadge.className = 'status-badge';
    if (status === 'error') {
      statusBadge.classList.add('status-err');
    } else if (status >= 500) {
      statusBadge.classList.add('status-5xx');
    } else if (status >= 400) {
      statusBadge.classList.add('status-4xx');
    } else {
      statusBadge.classList.add('status-2xx');
    }

    statusBadge.textContent = label;
    responseTime.textContent = ms ? `${ms} ms` : '';
    responseOutput.textContent = body;

    // Scroll into view
    responseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ---- Copy response ----
  copyResBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(responseOutput.textContent).then(() => {
      copyResBtn.classList.add('copied');
      copyResBtn.innerHTML = '✓ Copied';
      setTimeout(() => {
        copyResBtn.classList.remove('copied');
        copyResBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy';
      }, 2000);
    });
  });
})();

/* ---- HELPERS ---- */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ---- SHAKE ANIMATION (inline) ---- */
(function injectShake() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%,60%  { transform: translateX(-4px); }
      40%,80%  { transform: translateX(4px); }
    }
    .shake { animation: shake 0.35s ease; border-color: var(--delete) !important; }
  `;
  document.head.appendChild(style);
})();
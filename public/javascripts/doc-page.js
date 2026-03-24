/* ============================================
   MARINA API — SHARED DOCUMENTATION JS
   ============================================ */

// ---- COPY BUTTONS ----
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;
  const pre = btn.closest('.code-block').querySelector('pre');
  const text = pre ? pre.innerText : '';
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '✓ Copied';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy';
    }, 2000);
  });
});

// ---- ENDPOINT ACCORDION ----
document.addEventListener('click', function (e) {
  const header = e.target.closest('.endpoint-header');
  if (!header) return;
  const body = header.nextElementSibling;
  if (!body || !body.classList.contains('endpoint-body')) return;
  header.classList.toggle('open');
  body.classList.toggle('open');
});

// ---- RESPONSE TABS ----
document.addEventListener('click', function (e) {
  const tab = e.target.closest('.resp-tab');
  if (!tab) return;
  const group = tab.closest('.response-section');
  if (!group) return;
  group.querySelectorAll('.resp-tab').forEach(t => t.classList.remove('active'));
  group.querySelectorAll('.resp-panel').forEach(p => p.classList.remove('active'));
  tab.classList.add('active');
  const target = tab.dataset.tab;
  const panel = group.querySelector(`.resp-panel[data-tab="${target}"]`);
  if (panel) panel.classList.add('active');
});

// ---- TOC ACTIVE ON SCROLL ----
(function () {
  const links = document.querySelectorAll('.toc-list a');
  if (!links.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const id = entry.target.id;
        const link = document.querySelector(`.toc-list a[href="#${id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '0px 0px -70% 0px' });
  document.querySelectorAll('.doc-section[id]').forEach(s => observer.observe(s));
})();

// ---- SIDEBAR ACTIVE LINK ----
(function () {
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    if (a.getAttribute('href') === current || a.getAttribute('href') === './' + current) {
      a.classList.add('active');
    }
  });
})();
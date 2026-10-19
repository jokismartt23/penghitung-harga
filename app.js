(() => {
  'use strict';
  const RATE_KEY = 'jokismart_pricedesk_rates_v1';
  const HISTORY_KEY = 'jokismart_pricedesk_history_v1';
  const WA_NUMBER = '6282285150571';
  const PRESETS = {
    excel:   { name: 'Excel', unit: 'sheet',    rate: 45000, hoursPerUnit: 1.3, setup: 0.5, minimum: 35000, icon: 'i-calc' },
    data:    { name: 'Olah Data', unit: 'analisis',rate: 55000, hoursPerUnit: 2.2, setup: 0.6, minimum: 55000, icon: 'i-data' },
    makalah: { name: 'Makalah / Laporan', unit: 'halaman', rate: 32000, hoursPerUnit: 0.6, setup: 0.8, minimum: 40000, icon: 'i-doc' },
    ppt:     { name: 'PPT / Presentasi', unit: 'slide', rate: 30000, hoursPerUnit: 0.3, setup: 0.7, minimum: 30000, icon: 'i-ppt' },
    coding:  { name: 'Coding', unit: 'fitur', rate: 65000, hoursPerUnit: 3.1, setup: 1.0, minimum: 80000, icon: 'i-code' },
    web:     { name: 'Website', unit: 'halaman', rate: 75000, hoursPerUnit: 4.4, setup: 1.5, minimum: 120000, icon: 'i-web' },
    iot:     { name: 'IoT', unit: 'modul', rate: 85000, hoursPerUnit: 5.5, setup: 1.5, minimum: 150000, icon: 'i-chip' },
    lainnya: { name: 'Layanan Lainnya', unit: 'unit', rate: 40000, hoursPerUnit: 1.0, setup: 0.8, minimum: 35000, icon: 'i-spark' }
  };
  const DIFFICULTY = {
    mudah:  { name: 'Mudah', factor: .8, hint: 'Pekerjaan sederhana, instruksi jelas, dan revisi ringan.' },
    sedang: { name: 'Sedang', factor: 1, hint: 'Butuh penyesuaian, pengerjaan terstruktur, dan pemeriksaan hasil.' },
    sulit:  { name: 'Sulit', factor: 1.4, hint: 'Memerlukan analisis tambahan, ketelitian tinggi, atau logika kompleks.' },
    sangat: { name: 'Sangat Sulit', factor: 1.85, hint: 'Memerlukan riset khusus, pengujian mendalam, atau keahlian teknis lanjut.' }
  };
  const RUSH = [
    { min: 168, factor: 1, label: 'Normal' },
    { min: 72, factor: 1.08, label: 'Cukup dekat' },
    { min: 48, factor: 1.18, label: 'Mendesak' },
    { min: 24, factor: 1.35, label: 'Cepat' },
    { min: 12, factor: 1.55, label: 'Prioritas' },
    { min: 6, factor: 1.8, label: 'Ekspres' },
    { min: 0, factor: 2, label: 'Darurat' }
  ];
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const currency = n => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
  const formatHours = n => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' jam';
  const clamp = (v, min, max, fallback = min) => Number.isFinite(+v) && String(v).trim() !== '' ? Math.min(max, Math.max(min, +v)) : fallback;
  const round5 = n => Math.ceil(n / 5000) * 5000;
  const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function stored(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } }
  function initialRates() {
    const loaded = stored(RATE_KEY, {});
    return Object.fromEntries(Object.entries(PRESETS).map(([k, v]) => {
      const custom = loaded && typeof loaded === 'object' ? loaded[k] : null;
      return [k, {
        ...v,
        rate: clamp(custom?.rate, 5000, 10000000, v.rate),
        hoursPerUnit: clamp(custom?.hoursPerUnit, .1, 300, v.hoursPerUnit),
        setup: clamp(custom?.setup, 0, 100, v.setup),
        minimum: clamp(custom?.minimum, 5000, 100000000, v.minimum)
      }];
    }));
  }
  let rates = initialRates();
  let history = stored(HISTORY_KEY, []);
  if (!Array.isArray(history)) history = [];
  let selectedService = 'excel';
  let selectedDifficulty = 'sedang';
  let result;
  let toastTimeout;
  function toast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimeout); toastTimeout = setTimeout(() => el.classList.remove('show'), 2750);
  }
  function getRush(h) { return RUSH.find(item => h >= item.min) || RUSH[RUSH.length - 1]; }
  function currentQuote() {
    const s = rates[selectedService];
    const difficulty = DIFFICULTY[selectedDifficulty];
    const quantity = clamp($('#quantity').value, 1, 200, 1);
    const deadlineHours = clamp($('#deadline').value, 1, 8760, 168);
    const manual = $('#manualEffort').checked;
    const autoHours = Math.ceil((s.setup + s.hoursPerUnit * quantity) * 4) / 4;
    const hours = manual ? clamp($('#manualHours').value, .5, 500, autoHours) : autoHours;
    const extra = clamp($('#extraCost').value, 0, 100000000, 0);
    const discount = clamp($('#discount').value, 0, 50, 0);
    const dpRate = clamp($('#dpRate').value, 0, 100, 50);
    const rush = getRush(deadlineHours);
    const labor = Math.round(hours * s.rate * difficulty.factor);
    const surcharge = Math.round(labor * (rush.factor - 1));
    const beforeDiscount = labor + surcharge + extra;
    const discountAmount = Math.round(beforeDiscount * discount / 100);
    const recommended = round5(Math.max(s.minimum, beforeDiscount - discountAmount));
    return {
      serviceId: selectedService, service: s.name, unit: s.unit, difficultyId: selectedDifficulty, difficulty: difficulty.name,
      quantity, deadlineHours, hours, autoHours, manual, rate: s.rate, difficultyFactor: difficulty.factor,
      rushName: rush.label, rushFactor: rush.factor, labor, surcharge, extra, discount, discountAmount,
      minimum: s.minimum, recommended, low: Math.max(s.minimum, round5(recommended * .9)), high: round5(recommended * 1.18),
      dpRate, deposit: round5(recommended * dpRate / 100), balance: recommended - round5(recommended * dpRate / 100),
      unrealistic: hours > (deadlineHours >= 24 ? deadlineHours / 24 * 8 : deadlineHours * .75)
    };
  }
  function deadlineLabel(hours) { return hours >= 24 ? (hours / 24) + ' hari' : hours + ' jam'; }
  function renderCalculator() {
    result = currentQuote();
    $('#unitLabel').textContent = rates[selectedService].unit;
    $('#autoHoursLabel').textContent = $('#manualEffort').checked ? 'Menggunakan jam yang kamu masukkan' : formatHours(result.autoHours) + ' · dihitung otomatis';
    $('#manualHoursWrap').hidden = !$('#manualEffort').checked;
    $('#difficultyHint').textContent = DIFFICULTY[selectedDifficulty].hint;
    $('#recommendedPrice').textContent = currency(result.recommended);
    $('#priceRange').textContent = currency(result.low) + ' – ' + currency(result.high);
    $('#workHours').textContent = formatHours(result.hours);
    $('#hourlyRate').textContent = currency(result.rate);
    $('#laborPrice').textContent = currency(result.labor);
    $('#urgencyPrice').textContent = result.surcharge ? '+ ' + currency(result.surcharge) : currency(0);
    const adj = result.extra - result.discountAmount;
    $('#adjustments').textContent = (adj >= 0 ? '+ ' : '− ') + currency(Math.abs(adj));
    $('#depositPercent').textContent = result.dpRate + '%';
    $('#depositAmount').textContent = currency(result.deposit);
    $('#deadlineWarning').hidden = !result.unrealistic;
  }
  function chooseService(id) {
    if (!rates[id]) return;
    selectedService = id;
    $$('.service-option').forEach(btn => { const active = btn.dataset.service === id; btn.classList.toggle('active', active); btn.setAttribute('aria-pressed', String(active)); });
    if (!$('#manualEffort').checked) $('#manualHours').value = currentQuote().autoHours;
    renderCalculator();
  }
  function chooseDifficulty(id) {
    if (!DIFFICULTY[id]) return;
    selectedDifficulty = id;
    $$('.difficulty-options button').forEach(btn => { const active = btn.dataset.difficulty === id; btn.classList.toggle('active', active); btn.setAttribute('aria-pressed', String(active)); });
    renderCalculator();
  }
  function quoteText(q) {
    return [
      'Halo! Berikut estimasi penawaran dari JokiSmart 💙',
      '',
      '📌 Layanan: ' + q.service,
      '📋 Volume: ' + q.quantity + ' ' + q.unit,
      '⚙️ Tingkat kesulitan: ' + q.difficulty,
      '⏰ Deadline: ' + deadlineLabel(q.deadlineHours),
      '🛠️ Estimasi waktu kerja: ' + formatHours(q.hours),
      '',
      '💰 *Estimasi harga: ' + currency(q.recommended) + '*',
      '💳 DP ' + q.dpRate + '%: ' + currency(q.deposit),
      '💵 Sisa pembayaran: ' + currency(q.balance),
      '',
      'Harga final ditentukan setelah detail pekerjaan disepakati.',
      'JokiSmart | Konsultasi & layanan digital'
    ].join('\n');
  }
  async function copyText(content) {
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(content); return true; }
    } catch { /* use fallback */ }
    const area = document.createElement('textarea');
    area.value = content; area.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(area); area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* not available */ }
    area.remove();
    return ok;
  }
  function saveHistory() {
    const record = { ...result, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), timestamp: new Date().toISOString() };
    history.unshift(record); history = history.slice(0, 40);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    $('#historyCount').textContent = history.length;
    toast('Estimasi berhasil disimpan di perangkat ini.');
  }
  function renderHistory() {
    $('#historyCount').textContent = history.length;
    const list = $('#historyList');
    if (!history.length) {
      list.innerHTML = '<div class="empty-history"><svg><use href="#i-book"/></svg><b>Belum ada estimasi tersimpan</b><p>Buat perhitungan pada tab Kalkulator, lalu klik Simpan riwayat.</p></div>';
      return;
    }
    list.innerHTML = history.map(item => {
      const date = new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      return `<div class="history-row"><div class="history-info"><b>${escapeHTML(item.service || 'Layanan')} · ${escapeHTML(item.difficulty || 'Sedang')}</b><span>${escapeHTML(date)} · ${escapeHTML(item.quantity)} ${escapeHTML(item.unit)} · Deadline ${escapeHTML(deadlineLabel(item.deadlineHours))}</span></div><strong class="history-price">${escapeHTML(currency(item.recommended))}</strong><div class="history-actions"><button type="button" data-history-copy="${escapeHTML(item.id)}" aria-label="Salin penawaran" title="Salin penawaran"><svg><use href="#i-copy"/></svg></button><button type="button" data-history-delete="${escapeHTML(item.id)}" aria-label="Hapus dari riwayat" title="Hapus"><svg><use href="#i-trash"/></svg></button></div></div>`;
    }).join('');
  }
  function renderSettings() {
    $('#settingsGrid').innerHTML = Object.entries(rates).map(([key, r]) => `<article class="setting-card"><div class="setting-card-head"><svg><use href="#${r.icon}"/></svg><div><b>${r.name}</b><small>Satuan pekerjaan: ${r.unit}</small></div></div><div class="settings-fields"><div><label for="rate-${key}">Tarif per jam (Rp)</label><input type="number" inputmode="numeric" id="rate-${key}" min="5000" max="10000000" step="5000" value="${r.rate}"></div><div><label for="hour-${key}">Jam per ${r.unit}</label><input type="number" inputmode="decimal" id="hour-${key}" min="0.1" max="300" step="0.1" value="${r.hoursPerUnit}"></div><div><label for="setup-${key}">Waktu persiapan (jam)</label><input type="number" inputmode="decimal" id="setup-${key}" min="0" max="100" step="0.1" value="${r.setup}"></div><div><label for="min-${key}">Minimum order (Rp)</label><input type="number" inputmode="numeric" id="min-${key}" min="5000" max="100000000" step="5000" value="${r.minimum}"></div></div><div class="setting-unit-note">Rumus: (jam persiapan + jumlah × jam/unit) × tarif/jam × tingkat kesulitan × faktor deadline.</div></article>`).join('');
  }
  function storeSettings() {
    const next = {};
    for (const [key, r] of Object.entries(rates)) {
      const fields = {
        rate: +$(`#rate-${key}`).value,
        hoursPerUnit: +$(`#hour-${key}`).value,
        setup: +$(`#setup-${key}`).value,
        minimum: +$(`#min-${key}`).value
      };
      if (!(fields.rate >= 5000 && fields.rate <= 10000000 && fields.hoursPerUnit >= .1 && fields.hoursPerUnit <= 300 && fields.setup >= 0 && fields.setup <= 100 && fields.minimum >= 5000 && fields.minimum <= 100000000)) {
        toast('Periksa kembali tarif ' + r.name + '. Ada angka di luar batas.');
        return;
      }
      next[key] = { ...r, ...fields };
    }
    rates = next;
    localStorage.setItem(RATE_KEY, JSON.stringify(Object.fromEntries(Object.entries(rates).map(([k, r]) => [k, { rate: r.rate, hoursPerUnit: r.hoursPerUnit, setup: r.setup, minimum: r.minimum }]))));
    renderCalculator(); toast('Tarif JokiSmart berhasil disimpan.');
  }
  function switchView(target) {
    $$('.view').forEach(section => section.classList.toggle('active', section.id === 'view-' + target));
    $$('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.view === target));
    $('#pageBreadcrumb').textContent = { kalkulator: 'Kalkulator Harga', riwayat: 'Riwayat Penawaran', pengaturan: 'Atur Tarif' }[target];
    if (target === 'riwayat') renderHistory();
    if (target === 'pengaturan') renderSettings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function resetCalculator() {
    $('#quantity').value = '2';
    $('#deadline').value = '168';
    $('#manualEffort').checked = false;
    $('#manualHours').value = '3';
    $('#extraCost').value = '0';
    $('#discount').value = '0';
    $('#dpRate').value = '50';
    chooseService('excel'); chooseDifficulty('sedang');
    renderCalculator(); toast('Perhitungan sudah direset.');
  }
  function printQuote() {
    const q = result;
    $('#printSheet').innerHTML = `<h1>JokiSmart | Estimasi Penawaran</h1><p>Estimasi ini dapat berubah setelah kebutuhan proyek diperiksa.</p><h2>${escapeHTML(currency(q.recommended))}</h2><div class="print-line"><span>Layanan</span><b>${escapeHTML(q.service)}</b></div><div class="print-line"><span>Volume</span><b>${q.quantity} ${escapeHTML(q.unit)}</b></div><div class="print-line"><span>Kesulitan</span><b>${escapeHTML(q.difficulty)}</b></div><div class="print-line"><span>Deadline</span><b>${deadlineLabel(q.deadlineHours)}</b></div><div class="print-line"><span>Jam kerja</span><b>${formatHours(q.hours)}</b></div><div class="print-line"><span>DP ${q.dpRate}%</span><b>${currency(q.deposit)}</b></div><footer>Harga sementara. JokiSmart · WhatsApp 082285150571</footer>`;
    window.print();
  }
  function attachEvents() {
    $$('.nav-link').forEach(link => link.addEventListener('click', () => switchView(link.dataset.view)));
    $('#goSettings').addEventListener('click', () => switchView('pengaturan'));
    $$('.service-option').forEach(button => button.addEventListener('click', () => chooseService(button.dataset.service)));
    $$('.difficulty-options button').forEach(button => button.addEventListener('click', () => chooseDifficulty(button.dataset.difficulty)));
    ['quantity', 'deadline', 'manualEffort', 'manualHours', 'extraCost', 'discount', 'dpRate'].forEach(id => {
      const el = $('#' + id);
      el.addEventListener('input', renderCalculator);
      el.addEventListener('change', () => {
        if (el.type === 'number') {
          const bounds = { quantity: [1, 200], manualHours: [.5, 500], extraCost: [0, 100000000], discount: [0, 50] };
          if (bounds[id]) el.value = clamp(el.value, ...bounds[id]);
        }
        renderCalculator();
      });
    });
    $('#increaseQty').addEventListener('click', () => { $('#quantity').value = clamp(+$('#quantity').value + 1, 1, 200, 1); renderCalculator(); });
    $('#decreaseQty').addEventListener('click', () => { $('#quantity').value = clamp(+$('#quantity').value - 1, 1, 200, 1); renderCalculator(); });
    $('#resetCalc').addEventListener('click', resetCalculator);
    $('#copyQuote').addEventListener('click', async () => toast(await copyText(quoteText(result)) ? 'Penawaran berhasil disalin!' : 'Gagal menyalin otomatis. Periksa izin clipboard.'));
    $('#sendWhatsapp').addEventListener('click', () => { const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(quoteText(result))}`; window.open(url, '_blank', 'noopener,noreferrer'); });
    $('#saveQuote').addEventListener('click', saveHistory);
    $('#clearHistory').addEventListener('click', () => {
      if (!history.length) { toast('Belum ada riwayat untuk dihapus.'); return; }
      if (confirm('Hapus semua riwayat estimasi di perangkat ini?')) { history = []; localStorage.removeItem(HISTORY_KEY); renderHistory(); toast('Semua riwayat dihapus.'); }
    });
    $('#historyList').addEventListener('click', async event => {
      const cp = event.target.closest('[data-history-copy]');
      const del = event.target.closest('[data-history-delete]');
      if (cp) { const item = history.find(h => h.id === cp.dataset.historyCopy); if (item) toast(await copyText(quoteText(item)) ? 'Penawaran berhasil disalin!' : 'Tidak dapat menyalin otomatis.'); }
      if (del) { history = history.filter(h => h.id !== del.dataset.historyDelete); localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); renderHistory(); toast('Satu penawaran dihapus.'); }
    });
    $('#saveRates').addEventListener('click', storeSettings);
    $('#resetRates').addEventListener('click', () => {
      if (confirm('Kembalikan seluruh tarif menjadi contoh awal?')) {
        localStorage.removeItem(RATE_KEY); rates = initialRates(); renderSettings(); renderCalculator(); toast('Tarif contoh awal telah dikembalikan.');
      }
    });
    document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'p') { event.preventDefault(); printQuote(); } });
  }
  $('#year').textContent = new Date().getFullYear();
  $('#historyCount').textContent = history.length;
  attachEvents();
  renderCalculator();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();

'use strict';
// Terminal Sudirman — ui.js (renderer, boot flow, keyboard, ARIA; hanya baca 4 fungsi Engine)
const UI = (function () {
  var $ = function (id) { return document.getElementById(id); };
  var nfID = new Intl.NumberFormat('id-ID');
  var nfPct = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  var mq = window.matchMedia('(min-width: 960px)');
  var ui = { screen: 'home', query: '', sector: 'all', sort: 'default', ncat: 'all', mode: 'buy', lots: 1, ptab: 'daily', faqOpen: -1, modal: null, stack: [], onbIdx: 0, editName: false, nameDraft: '', resetWord: '', lastPrices: {}, lastFocus: null, lastModalKey: '', bootRes: null };

  // ===== Format (§26) =====
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtRp(n) { return 'Rp' + nfID.format(Math.round(n)); }
  function fmtSignedRp(n) { return (n >= 0 ? '+' : '-') + 'Rp' + nfID.format(Math.abs(Math.round(n))); }
  function fmtPct(frac) { var s = frac > 0 ? '+' : frac < 0 ? '-' : ''; return s + nfPct.format(Math.abs(frac * 100)) + '%'; }
  function fmtTime(ts) { var w = Engine.utils.wib(ts); return pad(w.hh) + ':' + pad(w.mm) + ':' + pad(w.ss) + ' ' + T('misc.wib'); }
  function fmtDate(ts) { var w = Engine.utils.wib(ts); return w.d + ' ' + MONTHS[w.m - 1] + ' ' + w.y; }
  function fmtRelative(ts) {
    var min = Math.floor((Date.now() - ts) / 60000);
    if (min < 1) return T('misc.justNow');
    if (min < 60) return min + 'm lalu';
    if (min < 1440) return Math.floor(min / 60) + 'j ' + (min % 60) + 'm lalu';
    return Math.floor(min / 1440) + 'h lalu';
  }
  function fmtDur(sec) {
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    if (h > 0) return h + 'j ' + m + 'm';
    if (m > 0) return m + 'm';
    return '<1m';
  }
  function esc(s) { return String(s).split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;').split('"').join('&quot;').split("'").join('&#39;'); }
  function T(path) {
    var cur = DATA.copy, parts = path.split('.');
    for (var i = 0; i < parts.length; i++) { if (cur == null) return path; cur = cur[parts[i]]; }
    return typeof cur === 'string' ? cur : path;
  }
  function tpl(str, vars) {
    var out = String(str);
    Object.keys(vars || {}).forEach(function (k) { out = out.split('{' + k + '}').join(String(vars[k])); });
    return out;
  }
  function debounce(fn, ms) { var t = null; return function () { if (t) clearTimeout(t); t = setTimeout(fn, ms); }; }

  // ===== SVG geometris (§1.4) =====
  function svg(inner) { return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'; }
  var ICON = {
    home: '<path d="M3 11 L12 4 L21 11 V20 H14 V14 H10 V20 H3 Z"/>',
    market: '<path d="M3 17 L9 11 L13 14 L21 6"/><path d="M15 6 H21 V12"/>',
    news: '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M8 9 H16 M8 13 H16 M8 17 H12"/>',
    portfolio: '<rect x="3" y="8" width="18" height="11" rx="1"/><path d="M9 8 V6 H15 V8 M3 13 H21"/>',
    profile: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20 C5 16 8 14.5 12 14.5 C16 14.5 19 16 19 20"/>',
    star: '<path d="M12 3.5 L14.6 9 L20.5 9.7 L16.2 13.8 L17.5 19.7 L12 16.7 L6.5 19.7 L7.8 13.8 L3.5 9.7 L9.4 9 Z"/>',
    lock: '<rect x="6" y="11" width="12" height="8" rx="1"/><path d="M9 11 V8 A3 3 0 0 1 15 8 V11"/>',
    award: '<circle cx="12" cy="9" r="5"/><path d="M9 13.5 L7.5 21 L12 18.5 L16.5 21 L15 13.5"/>',
    arrow: '<path d="M5 12 H19 M13 6 L19 12 L13 18"/>',
    download: '<path d="M12 4 V15 M7 11 L12 16 L17 11 M5 20 H19"/>',
    trash: '<path d="M5 7 H19 M9 7 V5 H15 V7 M8 7 L9 20 H15 L16 7"/>',
    refresh: '<path d="M20 12 A8 8 0 1 1 17.7 6.3 M20 4 V9 H15"/>',
    alert: '<path d="M12 4 L21 19 H3 Z M12 10 V14 M12 16.5 V17"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8 V12 L15 14"/>'
  };
  function icon(name) { return svg(ICON[name] || ''); }
  function starIcon(on) { return '<svg width="24" height="24" viewBox="0 0 24 24" fill="' + (on ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true">' + ICON.star + '</svg>'; }
  function monogram(s, lg) {
    var col = DATA.sectorColors[s.sector] || 'var(--border-strong)';
    return '<span class="mono-gram' + (lg ? ' lg' : '') + '" style="border-color:' + col + '">' + esc(s.icon) + '</span>';
  }
  function sparkSVG(pts, w, h) {
    if (!pts || pts.length < 2) pts = [0, 0];
    var min = Math.min.apply(null, pts), max = Math.max.apply(null, pts), range = max - min;
    var flat = range < pts[pts.length - 1] * 0.001;
    var color = flat ? 'var(--text-muted)' : (pts[pts.length - 1] > pts[0] ? 'var(--up)' : pts[pts.length - 1] < pts[0] ? 'var(--down)' : 'var(--text-muted)');
    var coords = [];
    for (var i = 0; i < pts.length; i++) {
      var x = (i / (pts.length - 1)) * (w - 2) + 1;
      var y = flat ? h / 2 : (h - 2) - ((pts[i] - min) / (range || 1)) * (h - 4) + 1;
      coords.push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    return '<svg class="spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><polyline points="' + coords.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function pctPill(frac, flash) {
    var cls = frac > 0 ? 'pill-up' : frac < 0 ? 'pill-down' : 'pill-flat';
    return '<span class="pill ' + cls + (flash ? ' ' + flash : '') + '">' + fmtPct(frac) + '</span>';
  }

  // ===== Komponen =====
  function stockRow(s, flash) {
    return '<button class="stock-row" data-action="stock" data-code="' + s.code + '">' + monogram(s) +
      '<span class="grow"><span class="tk">' + s.code + '</span><span class="nm ellip">' + esc(s.name) + '</span></span>' +
      sparkSVG(s.sparkline, 68, 24) +
      '<span class="right"><span class="pr">' + fmtRp(s.price) + '</span>' + pctPill(s.changePct, flash) + '</span></button>';
  }
  function watchCard(s) {
    return '<button class="watch-card" data-action="stock" data-code="' + s.code + '">' +
      '<span class="spread"><span class="tk">' + s.code + '</span>' + pctPill(s.changePct) + '</span>' +
      '<span class="pr">' + fmtRp(s.price) + '</span>' + sparkSVG(s.sparkline, 60, 22) + '</button>';
  }
  function missionDef(kind, id) {
    var pool = kind === 'daily' ? DATA.dailyPool : DATA.weeklyPool, r = null;
    pool.forEach(function (m) { if (m.id === id) r = m; });
    return r;
  }
  function missionItem(m, def, kind, claimLabel) {
    var done = m.progress >= def.target, pct = Math.min(100, Math.round(m.progress / def.target * 100)), right;
    if (m.claimed) right = '<span class="pill pill-amber">' + T('label.claimed') + '</span>';
    else if (done) right = '<button class="btn btn-amber btn-sm" data-action="claim" data-kind="' + kind + '" data-id="' + m.id + '">' + claimLabel + '</button>';
    else right = '<span class="pill">' + nfID.format(m.progress) + ' / ' + nfID.format(def.target) + '</span>';
    return '<div class="mission"><div class="spread"><span class="desc">' + esc(def.desc) + '</span>' + right + '</div>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div><span class="micro">+' + def.xp + ' ' + T('label.xp') + '</span></div>';
  }
  function newsCard(n) {
    var sentCls = n.sentiment === 'bullish' ? 'pill-up' : n.sentiment === 'bearish' ? 'pill-down' : 'pill-flat';
    var tags = n.targets.length ? n.targets.map(function (t) { return '<span class="pill">' + esc(t) + '</span>'; }).join('') : '<span class="pill">' + T('label.all') + '</span>';
    return '<button class="news-card' + (n.read ? '' : ' unread') + '" data-action="news" data-id="' + n.id + '">' +
      '<span class="meta"><span class="pill pill-sent ' + sentCls + '">' + T('sentiment.' + n.sentiment) + '</span><span>' + esc(n.category) + '</span><span>·</span><span class="mono">' + fmtRelative(n.publishedAt) + '</span>' + (n.read ? '' : '<span class="pill pill-amber pill-sent">' + T('misc.unread') + '</span>') + '</span>' +
      '<span class="nh">' + esc(n.title) + '</span><span class="sum">' + esc(n.summary) + '</span>' +
      '<span class="tags">' + tags + '</span><span class="micro muted" style="display:block;margin-top:8px">' + T('label.simNews') + '</span></button>';
  }
  function holdingCard(code, h, s) {
    var shares = h.lots * 100, val = shares * s.price, upl = (s.price - h.avgBuy) * shares, pct = h.avgBuy ? (s.price - h.avgBuy) / h.avgBuy : 0;
    return '<div class="card"><div class="row">' + monogram(s) +
      '<span class="grow"><span class="mono" style="display:block;font-weight:700">' + code + '</span><span class="sec mono" style="font-size:12px">' + nfID.format(h.lots) + ' ' + T('label.lot') + ' • ' + nfID.format(shares) + ' ' + T('label.shares') + '</span></span>' + pctPill(pct) + '</div>' +
      '<div class="hold-grid">' +
      '<span class="cell"><span class="micro">' + T('label.avgBuy') + '</span><span class="v" style="display:block">' + fmtRp(h.avgBuy) + '</span></span>' +
      '<span class="cell"><span class="micro">' + T('label.nowPrice') + '</span><span class="v" style="display:block">' + fmtRp(s.price) + '</span></span>' +
      '<span class="cell"><span class="micro">' + T('label.marketValue') + '</span><span class="v" style="display:block">' + fmtRp(val) + '</span></span></div>' +
      '<div class="spread"><span class="mono ' + (upl >= 0 ? 'up-t' : 'down-t') + '" style="font-weight:700;font-size:13px">' + fmtSignedRp(upl) + '</span>' +
      '<span class="row"><button class="btn btn-sm btn-up" data-action="stock" data-code="' + code + '" data-mode="buy">' + T('label.buyShort') + '</button>' +
      '<button class="btn btn-sm btn-down" data-action="stock" data-code="' + code + '" data-mode="sell">' + T('label.sellShort') + '</button></span></div></div>';
  }
  function ledgerRow(e) {
    var cls = e.side === 'buy' ? 'pill-up' : 'pill-down', w = Engine.utils.wib(e.t);
    return '<div class="ledger-row"><span class="pill pill-sent ' + cls + '">' + T('side.' + (e.side === 'buy' ? 'BUY' : 'SELL')) + '</span>' +
      '<span class="grow"><span class="lt" style="display:block;font-weight:700">' + e.code + ' · ' + nfID.format(e.lots) + ' ' + T('label.lot') + ' × ' + fmtRp(e.price) + '</span>' +
      '<span class="muted" style="font-size:11px">' + T('label.feeShort') + ' ' + fmtRp(e.fee) + '</span></span>' +
      '<span style="text-align:right"><span class="lt" style="display:block;font-weight:700">' + fmtRp(e.total) + '</span>' +
      '<span class="muted mono" style="font-size:11px">' + pad(w.hh) + ':' + pad(w.mm) + ' · ' + fmtDate(e.t) + '</span></span></div>';
  }
  function badgeCell(b, on) {
    return '<div class="badge' + (on ? ' on' : '') + '" title="' + esc(b.desc) + '">' + icon('award') + '<span class="bn">' + esc(b.name) + '</span><span class="bx">+' + b.xp + ' ' + T('label.xp') + '</span></div>';
  }
  function meterHTML(n) {
    if (!n.meter) return '<div class="meter"><span class="micro">' + T('label.noEffect') + '</span></div>';
    var m = n.meter, frac = m.releasePrice ? (m.currentPrice - m.releasePrice) / m.releasePrice : 0, eff = n.activeEffect;
    var pctW = eff ? Math.max(0, Math.min(100, Math.round(eff.remainingSec / eff.durationSec * 100))) : 0;
    var cap = eff ? T('label.remaining') + ': ' + fmtDur(eff.remainingSec) : T('label.effectDone');
    return '<div class="meter"><span class="micro">' + T('label.meterTitle') + ' — ' + m.code + '</span>' +
      '<div class="cols"><span><span class="micro" style="display:block">' + T('label.atRelease') + '</span><span class="mp">' + fmtRp(m.releasePrice) + '</span></span>' + icon('arrow') +
      '<span style="text-align:right"><span class="micro" style="display:block">' + T('label.now') + '</span><span class="mp">' + fmtRp(m.currentPrice) + '</span> ' + pctPill(frac) + '</span></div>' +
      '<div class="bar bar-lg"><i style="width:' + pctW + '%"></i></div><span class="micro" style="display:block;margin-top:6px">' + cap + '</span></div>';
  }
  function emptyBox(text, action, label) {
    return '<div class="empty">' + icon('alert') + '<span>' + esc(text) + '</span>' + (action ? '<button class="btn btn-amber btn-sm" data-action="' + action + '">' + esc(label) + '</button>' : '') + '</div>';
  }

  // ===== Order sheet (§6) =====
  function currentCode(st) { return st.selectedStock || st.watchlist[0] || 'BCAX'; }
  function orderSheet(st, code) {
    var s = null;
    Engine.getStocks().forEach(function (x) { if (x.code === code) s = x; });
    if (!s) return '';
    var pv = Engine.getOrderPreview(ui.mode, code, ui.lots), h = st.holdings[code], pos = '';
    if (h && h.lots > 0) {
      var upl = (s.price - h.avgBuy) * h.lots * 100;
      pos = '<div class="card-inset sec" style="font-size:12px">' + T('label.position') + ': <b class="mono">' + nfID.format(h.lots) + ' ' + T('label.lot') + '</b> @ Avg <b class="mono">' + fmtRp(h.avgBuy) + '</b> (P/L <b class="mono ' + (upl >= 0 ? 'up-t' : 'down-t') + '">' + fmtSignedRp(upl) + '</b>)</div>';
    }
    var starLabel = tpl(T(s.isInWatchlist ? 'label.watchRemove' : 'label.watchAdd'), { code: code });
    var buy = ui.mode === 'buy', total = buy ? pv.totalDebet : pv.totalKredit;
    var reason = pv.valid ? '' : T('reason.' + pv.reason);
    return '<div class="stack">' +
      '<div class="row">' + monogram(s, true) +
      '<span class="grow"><span class="mono" style="display:block;font-weight:700;font-size:15px">' + s.code + '</span><span class="sec ellip" style="display:block;font-size:12px">' + esc(s.name) + '</span></span>' +
      '<button class="star-btn' + (s.isInWatchlist ? ' on' : '') + '" data-action="star" data-code="' + code + '" aria-label="' + esc(starLabel) + '" aria-pressed="' + s.isInWatchlist + '">' + starIcon(s.isInWatchlist) + '</button></div>' +
      '<div class="order-head spread"><span class="pr">' + fmtRp(s.price) + '</span>' + pctPill(s.changePct) + '</div>' +
      '<div>' + sparkSVG(s.sparkline, 280, 96) + '<div class="hl-row"><span>' + T('label.low') + ' ' + fmtRp(s.dayLow) + '</span><span>' + T('label.high') + ' ' + fmtRp(s.dayHigh) + '</span></div></div>' + pos +
      '<div class="mode-tabs"><button class="' + (buy ? 'on-buy' : '') + '" data-action="mode" data-mode="buy">' + T('label.buyTab') + '</button><button class="' + (!buy ? 'on-sell' : '') + '" data-action="mode" data-mode="sell">' + T('label.sellTab') + '</button></div>' +
      '<div class="stepper">' +
      '<button data-action="step" data-d="-10" aria-label="-10 ' + T('label.lot') + '">-10</button>' +
      '<button data-action="step" data-d="-1" aria-label="-1 ' + T('label.lot') + '">-1</button>' +
      '<input type="number" data-input="lot" min="1" step="1" inputmode="numeric" value="' + ui.lots + '" aria-label="' + T('label.lot') + '">' +
      '<button data-action="step" data-d="1" aria-label="+1 ' + T('label.lot') + '">+1</button>' +
      '<button data-action="step" data-d="10" aria-label="+10 ' + T('label.lot') + '">+10</button></div>' +
      '<div class="quick"><button data-action="quick" data-q="25">25%</button><button data-action="quick" data-q="50">50%</button><button data-action="quick" data-q="75">75%</button><button data-action="quick" data-q="max">' + T('label.max') + '</button></div>' +
      '<div class="receipt">' +
      '<div class="rl"><span>' + T('label.principal') + ' (' + nfID.format(ui.lots * 100) + ' ' + T('label.shares') + ')</span><b>' + fmtRp(pv.principal) + '</b></div>' +
      '<div class="rl"><span>' + T('label.fee') + '</span><b>' + fmtRp(pv.fee) + '</b></div>' +
      '<div class="rl total"><span>' + T(buy ? 'label.totalDebit' : 'label.totalCredit') + '</span><b>' + fmtRp(total) + '</b></div>' +
      '<div class="rl"><span>' + T('label.cashAfter') + '</span><b>' + fmtRp(pv.cashAfter) + '</b></div></div>' +
      '<div class="reason">' + reason + '</div>' +
      '<button class="btn btn-block ' + (buy ? 'btn-up' : 'btn-down') + '" data-action="exec" data-code="' + code + '"' + (pv.valid ? '' : ' disabled') + '>' + T(buy ? 'label.execBuy' : 'label.execSell') + '</button>' +
      '<span class="micro muted" style="text-align:center">' + T('label.sharesPerLot') + '</span></div>';
  }

  // ===== Layar (§5) =====
  function screenHome(st) {
    var byCode = {};
    Engine.getStocks().forEach(function (s) { byCode[s.code] = s; });
    var delta = st.equity - st.initialCapital, pct = delta / st.initialCapital;
    var html = '<div class="stack">' +
      '<div class="card hero"><span class="micro">' + T('label.heroTitle') + '</span><div class="value">' + fmtRp(st.equity) + '</div>' +
      '<div class="hero-grid"><span class="cell"><span class="micro">' + T('label.totalReturn') + '</span><span class="v"><span class="pill ' + (delta >= 0 ? 'pill-up' : 'pill-down') + '">' + fmtSignedRp(delta) + ' (' + fmtPct(pct) + ')</span></span></span>' +
      '<span class="cell"><span class="micro">' + T('label.cash') + '</span><span class="v" style="display:block">' + fmtRp(st.cash) + '</span></span></div></div>';
    if (st.sessionPhase === 'preMarket') html += '<div class="banner"><div class="row">' + icon('clock') + '<span class="bt">' + T('phase.preMarket') + '</span></div><div class="bb">' + T('banner.preMarket') + '</div></div>';
    if (st.sessionPhase === 'weekend') html += '<div class="banner banner-frozen"><div class="row">' + icon('lock') + '<span class="bt">' + T('phase.weekend') + '</span></div><div class="bb">' + T('banner.weekend') + '</div></div>';
    if (st.activeEvent) {
      var ev = st.activeEvent;
      html += '<div class="banner"><span class="micro amber-t">' + T('banner.event') + '</span><div class="bt mt-s">' + esc(ev.title) + '</div>' +
        '<div class="row mt-s"><span class="pill pill-amber">' + esc(ev.label) + '</span><span class="mono sec" style="font-size:12px">' + fmtDur(ev.remainingSec) + ' ' + T('label.left') + '</span></div>' +
        '<div class="bb">' + T('label.affected') + ': ' + ev.sectors.map(esc).join(', ') + '</div></div>';
    }
    html += '<div><h3 class="sub">' + T('label.watchlist') + '</h3>';
    if (!st.watchlist.length) html += emptyBox(T('empty.watchlist'), 'goto-market', T('label.exploreShort'));
    else {
      html += '<div class="watch-grid">';
      st.watchlist.forEach(function (c) { if (byCode[c]) html += watchCard(byCode[c]); });
      html += '</div>';
    }
    html += '</div><div class="card"><h3 class="sub" style="margin-top:0">' + T('label.dailyMissions') + '</h3>';
    st.dailyMissions.forEach(function (m) { var def = missionDef('daily', m.id); if (def) html += missionItem(m, def, 'daily', T('label.claim')); });
    html += '</div></div>';
    return html;
  }
  function screenMarket(st) {
    var q = ui.query.toLowerCase();
    var list = Engine.getStocks().filter(function (s) {
      var okQ = !q || s.code.toLowerCase().indexOf(q) >= 0 || s.name.toLowerCase().indexOf(q) >= 0;
      return okQ && (ui.sector === 'all' || s.sector === ui.sector);
    });
    if (ui.sort === 'gain') list.sort(function (a, b) { return b.changePct - a.changePct; });
    else if (ui.sort === 'lose') list.sort(function (a, b) { return a.changePct - b.changePct; });
    else if (ui.sort === 'price') list.sort(function (a, b) { return b.price - a.price; });
    var html = '<h2 class="title">' + T('label.screenerTitle') + (st.tickError ? ' <span class="pill pill-down pill-sent">' + T('banner.dataDelayed') + '</span>' : '') + '</h2><div class="stack">' +
      '<div class="search-wrap"><input id="search-input" data-input="search" type="text" value="' + esc(ui.query) + '" placeholder="' + T('label.searchPlaceholder') + '" aria-label="' + T('label.searchPlaceholder') + '"><button class="search-clear" data-action="search-clear" aria-label="' + T('label.resetFilter') + '">×</button></div><div class="chips">' +
      '<button class="chip' + (ui.sector === 'all' ? ' active' : '') + '" data-action="chip" data-sector="all">' + T('label.all') + '</button>';
    DATA.sectors.forEach(function (sec) { html += '<button class="chip' + (ui.sector === sec ? ' active' : '') + '" data-action="chip" data-sector="' + sec + '">' + sec + '</button>'; });
    html += '</div><select class="sort" data-input="sort" aria-label="' + T('label.sortDefault') + '">' +
      '<option value="default"' + (ui.sort === 'default' ? ' selected' : '') + '>' + T('label.sortDefault') + '</option>' +
      '<option value="gain"' + (ui.sort === 'gain' ? ' selected' : '') + '>' + T('label.sortGain') + '</option>' +
      '<option value="lose"' + (ui.sort === 'lose' ? ' selected' : '') + '>' + T('label.sortLose') + '</option>' +
      '<option value="price"' + (ui.sort === 'price' ? ' selected' : '') + '>' + T('label.sortPrice') + '</option></select>';
    if (!list.length) html += emptyBox(T('empty.search'), 'reset-filters', T('label.resetFilter'));
    else {
      html += '<div class="stock-list">';
      list.forEach(function (s) {
        var prev = ui.lastPrices[s.code], flash = '';
        if (prev != null && s.price > prev) flash = 'flash-up';
        else if (prev != null && s.price < prev) flash = 'flash-down';
        html += stockRow(s, flash);
      });
      html += '</div>';
    }
    return html + '</div>';
  }
  function screenNews() {
    var cats = ['all', 'Ekonomi', 'Sektor', 'Emiten', 'Event Khusus'];
    var list = Engine.getNews().filter(function (n) { return ui.ncat === 'all' || n.category === ui.ncat; });
    var html = '<h2 class="title">' + T('label.newsTitle') + '</h2><div class="stack"><div class="chips">';
    cats.forEach(function (c) { html += '<button class="chip' + (ui.ncat === c ? ' active' : '') + '" data-action="ncat" data-cat="' + c + '">' + (c === 'all' ? T('label.all') : c) + '</button>'; });
    html += '</div>';
    if (!list.length) html += emptyBox(T('empty.news'), null, '');
    else list.forEach(function (n) { html += newsCard(n); });
    return html + '<p class="foot-note">' + T('label.newsFooter') + '</p></div>';
  }
  function screenPortfolio(st) {
    var byCode = {};
    Engine.getStocks().forEach(function (s) { byCode[s.code] = s; });
    var codes = Object.keys(st.holdings);
    var html = '<h2 class="title">' + DATA.copy.nav[3] + '</h2><div class="stack">';
    var parts = [], total = st.equity || 1, bySec = {};
    codes.forEach(function (c) { var s = byCode[c]; if (!s) return; var v = st.holdings[c].lots * 100 * s.price; bySec[s.sector] = (bySec[s.sector] || 0) + v; });
    Object.keys(bySec).forEach(function (sec) { parts.push({ name: sec, val: bySec[sec], color: DATA.sectorColors[sec] }); });
    parts.push({ name: T('label.quickCash'), val: st.cash, color: '#5C6270' });
    parts.sort(function (a, b) { return b.val - a.val; });
    html += '<div class="card"><h3 class="sub" style="margin-top:0">' + T('label.allocation') + '</h3><div class="alloc-bar">';
    parts.forEach(function (p) { html += '<i style="width:' + (p.val / total * 100).toFixed(1) + '%;background:' + p.color + '"></i>'; });
    html += '</div><div class="legend">';
    parts.forEach(function (p) { html += '<span><span class="dot" style="background:' + p.color + '"></span>' + esc(p.name) + ' ' + Math.round(p.val / total * 100) + '%</span>'; });
    html += '</div></div><div><h3 class="sub">' + T('label.holdings') + '</h3>';
    if (!codes.length) html += emptyBox(T('empty.holdings'), 'goto-market', T('label.explore'));
    else { html += '<div class="stack">'; codes.forEach(function (c) { if (byCode[c]) html += holdingCard(c, st.holdings[c], byCode[c]); }); html += '</div>'; }
    html += '</div><div class="card"><h3 class="sub" style="margin-top:0">' + T('label.ledger') + '</h3>';
    if (!st.ledger.length) html += '<p class="sec" style="font-size:13px">' + T('empty.ledger') + '</p>';
    else st.ledger.slice().reverse().forEach(function (e) { html += ledgerRow(e); });
    return html + '</div></div>';
  }
  function screenProfile(st) {
    var nextThr = st.level >= 10 ? T('label.xpMax') : nfID.format(DATA.levels[st.level].xp);
    var inLvl = st.level >= 10 ? 250 : st.xp - DATA.levels[st.level - 1].xp;
    var blocks = '';
    for (var i = 0; i < 10; i++) blocks += '<i class="' + (i < Math.floor(inLvl / 25) ? 'on' : '') + '"></i>';
    var nameRow = ui.editName
      ? '<div class="row"><input class="name-input" data-input="name" id="name-input" maxlength="24" value="' + esc(ui.nameDraft) + '" aria-label="' + T('label.nameLabel') + '"><button class="btn btn-amber btn-sm" data-action="name-save">' + T('label.nameSave') + '</button></div>'
      : '<div class="spread"><strong style="font-size:16px">' + esc(st.playerName) + '</strong><button class="btn btn-ghost btn-sm" data-action="name-edit">' + T('label.nameEdit') + '</button></div>';
    var html = '<h2 class="title">' + T('label.profileTitle') + '</h2><div class="stack">' +
      '<div class="card">' + nameRow +
      '<div class="spread mt"><span class="micro">' + T('label.rank') + '</span><span class="pill pill-amber">' + T('label.level') + ' ' + st.level + '</span></div>' +
      '<div style="font-weight:700;margin:4px 0 8px">' + esc(st.rankTitle) + '</div><div class="xp-blocks">' + blocks + '</div>' +
      '<div class="mono sec mt-s" style="font-size:12px">' + nfID.format(st.xp) + ' / ' + nextThr + ' ' + T('label.xp') + '</div></div>' +
      '<div class="card"><h3 class="sub" style="margin-top:0">' + T('label.missions') + '</h3><div class="chips mb">' +
      '<button class="chip' + (ui.ptab === 'daily' ? ' active' : '') + '" data-action="ptab" data-tab="daily">' + T('label.daily') + ' (' + st.dailyMissions.length + ')</button>' +
      '<button class="chip' + (ui.ptab === 'weekly' ? ' active' : '') + '" data-action="ptab" data-tab="weekly">' + T('label.weekly') + '</button></div>';
    var mList = ui.ptab === 'daily' ? st.dailyMissions : st.weeklyMissions;
    mList.forEach(function (m) { var def = missionDef(ui.ptab, m.id); if (def) html += missionItem(m, def, ui.ptab, T('label.claimReady')); });
    html += '</div><div><h3 class="sub">' + T('label.badges') + '</h3>';
    if (!st.badges.length) html += '<p class="sec mb" style="font-size:12px">' + T('empty.badges') + '</p>';
    html += '<div class="badge-grid">';
    DATA.badges.forEach(function (b) { html += badgeCell(b, st.badges.indexOf(b.id) >= 0); });
    html += '</div></div>';
    var minor = st.ageVerified === 'minor';
    html += '<div class="card"><h3 class="sub" style="margin-top:0">' + T('label.simPanel') + '</h3>' +
      '<div class="panel-row"><button class="btn btn-amber" data-action="event"' + (minor || st.activeEvent ? ' disabled' : '') + '>' + T('label.ujiEvent') + '</button><span class="pd">' + T('label.ujiEventDesc') + '</span></div>' +
      '<div class="panel-row"><button class="btn" data-action="export">' + icon('download') + T('label.exportData') + '</button><span class="pd">' + T('label.exportDesc') + '</span></div>' +
      '<div class="panel-row"><button class="btn btn-danger" data-action="reset1">' + icon('refresh') + T('label.resetSim') + '</button><span class="pd">' + T('label.resetSimDesc') + '</span></div>' +
      '<div class="panel-row"><button class="btn btn-danger" data-action="clear1">' + icon('trash') + T('label.clearData') + '</button><span class="pd">' + T('label.clearDesc') + '</span></div>' +
      '<div class="panel-row"><span class="micro">' + T('label.ageStatus') + '</span><span class="pill ' + (minor ? 'pill-frozen' : 'pill-up') + '">' + T(minor ? 'label.minor' : 'label.adult') + '</span></div></div>' +
      '<button class="btn btn-block" data-action="nav" data-screen="faq">' + T('label.faqLink') + '</button></div>';
    return html;
  }
  function screenFAQ() {
    var html = '<div class="spread mb"><h2 class="title" style="margin-bottom:0">' + T('label.faqTitle') + '</h2><button class="btn btn-ghost btn-sm" data-action="nav" data-screen="profile">' + T('label.back') + '</button></div><div class="acc">';
    DATA.faq.forEach(function (f, i) {
      var open = ui.faqOpen === i;
      html += '<div class="acc-item"><button class="acc-q" data-action="faq" data-i="' + i + '" aria-expanded="' + open + '"><span>' + esc(f.q) + '</span><span class="ind">' + (open ? '−' : '+') + '</span></button>' + (open ? '<div class="acc-a">' + esc(f.a) + '</div>' : '') + '</div>';
    });
    return html + '</div>';
  }

  // ===== Chrome global =====
  function renderTopBar(st) {
    $('topbar').innerHTML = '<span class="led led-' + st.sessionPhase + '"></span><span class="phase-label">' + T('phase.' + st.sessionPhase) + '</span><span class="clock" id="clock">' + fmtTime(Date.now()) + '</span><span class="top-cash"><span class="micro">' + T('label.quickCash') + '</span>' + fmtRp(st.cash) + '</span>';
  }
  var NAV = [{ screen: 'home', icon: 'home' }, { screen: 'market', icon: 'market' }, { screen: 'news', icon: 'news' }, { screen: 'portfolio', icon: 'portfolio' }, { screen: 'profile', icon: 'profile' }];
  function renderNav(st) {
    var active = ui.screen === 'faq' ? 'profile' : ui.screen, rail = '', bottom = '';
    NAV.forEach(function (n, i) {
      var on = active === n.screen, label = DATA.copy.nav[i];
      var badge = n.screen === 'news' && st.newsUnreadCount > 0 ? ' (' + st.newsUnreadCount + ')' : '';
      rail += '<button class="' + (on ? 'active' : '') + '" data-action="nav" data-screen="' + n.screen + '" aria-label="' + label + '"' + (on ? ' aria-current="page"' : '') + '>' + icon(n.icon) + '<span class="key">' + (i + 1) + '</span></button>';
      bottom += '<button class="' + (on ? 'active' : '') + '" data-action="nav" data-screen="' + n.screen + '"' + (on ? ' aria-current="page"' : '') + '>' + icon(n.icon) + '<span>' + label + badge + '</span></button>';
    });
    $('rail').innerHTML = rail;
    $('bottomnav').innerHTML = bottom;
  }
  function renderDock(st) { $('dock').innerHTML = orderSheet(st, currentCode(st)); }

  // ===== Modal (§22, §31) =====
  var DISMISSABLE = { stock: 1, news: 1, legal: 1, reset1: 1, reset2: 1, clear1: 1 };
  function modalKey(m) { return m ? m.type + ':' + (m.code || m.id || m.doc || '') : ''; }
  function sheetHead(title, dismiss) {
    return '<div class="sheet-head"><h3 id="modal-title">' + esc(title) + '</h3>' + (dismiss ? '<button class="modal-x" data-action="close-modal" aria-label="' + T('label.close') + '">×</button>' : '') + '</div>';
  }
  function modalHTML(st) {
    var m = ui.modal;
    if (!m) return '';
    var inner = '';
    if (m.type === 'stock') {
      inner = sheetHead(T('label.detail'), true) + orderSheet(st, m.code);
    } else if (m.type === 'news') {
      var n = null;
      Engine.getNews().forEach(function (x) { if (x.id === m.id) n = x; });
      if (!n) return '';
      var sentCls = n.sentiment === 'bullish' ? 'pill-up' : n.sentiment === 'bearish' ? 'pill-down' : 'pill-flat';
      inner = sheetHead(T('label.newsTitle'), true) +
        '<div class="row" style="flex-wrap:wrap"><span class="pill pill-sent ' + sentCls + '">' + T('sentiment.' + n.sentiment) + '</span><span class="micro">' + esc(n.category) + '</span><span class="mono sec" style="font-size:12px">' + fmtRelative(n.publishedAt) + ' · ' + fmtDate(n.publishedAt) + '</span></div>' +
        '<div class="onb-title mt" style="font-size:16px">' + esc(n.title) + '</div><div class="news-body"><p>' + esc(n.body) + '</p></div>' + meterHTML(n) + '<p class="foot-note mt">' + T('label.simNews') + '</p>';
    } else if (m.type === 'legal') {
      var body = '';
      if (m.doc === 'disclaimer') body = '<p>' + DATA.legal.disclaimer + '</p><h4>' + T('legalTitle.privacy') + '</h4><p>' + DATA.legal.breach + '</p>';
      else {
        var secs = m.doc === 'privacy' ? DATA.legal.privacy : DATA.legal.tos;
        secs.forEach(function (s) { body += '<h4>' + esc(s.h) + '</h4><p>' + esc(s.p) + '</p>'; });
        if (m.doc === 'privacy') body += '<p style="margin-top:10px">' + DATA.legal.breach + '</p>';
      }
      inner = sheetHead(T('legalTitle.' + m.doc), true) + '<div class="legal-body">' + body + '</div>';
    } else if (m.type === 'reset1') {
      inner = sheetHead(T('label.resetSim'), true) + '<p class="sec">' + T('confirm.reset1') + '</p><div class="row mt"><button class="btn btn-danger grow" data-action="reset2">' + T('confirm.reset1Yes') + '</button><button class="btn btn-ghost grow" data-action="close-modal">' + T('confirm.cancel') + '</button></div>';
    } else if (m.type === 'reset2') {
      inner = sheetHead(T('label.resetSim'), true) + '<p class="sec mb">' + T('confirm.reset2') + '</p><input class="reset-input" data-input="resetword" maxlength="8" value="' + esc(ui.resetWord) + '" aria-label="' + T('confirm.reset2') + '"><div class="row mt"><button class="btn btn-danger grow" data-action="reset2-do"' + (ui.resetWord === 'RESET' ? '' : ' disabled') + '>' + T('confirm.reset2Btn') + '</button><button class="btn btn-ghost grow" data-action="close-modal">' + T('confirm.cancel') + '</button></div>';
    } else if (m.type === 'clear1') {
      inner = sheetHead(T('label.clearData'), true) + '<p class="sec">' + T('confirm.clear') + '</p><div class="row mt"><button class="btn btn-danger grow" data-action="clear-do">' + T('confirm.clearYes') + '</button><button class="btn btn-ghost grow" data-action="close-modal">' + T('confirm.cancel') + '</button></div>';
    } else if (m.type === 'consent') {
      inner = '<div id="consent-banner">' + sheetHead(T('boot.consentTitle'), false) + '<p class="sec">' + T('boot.consentBody') + '</p><p class="foot-note mt">' + DATA.legal.disclaimer + '</p><div class="row mt"><button class="btn btn-amber grow" data-action="consent-ok">' + T('boot.consentOk') + '</button><button class="btn btn-ghost grow" data-action="consent-learn">' + T('boot.consentLearn') + '</button></div></div>';
    } else if (m.type === 'age') {
      inner = '<div id="age-gate">' + sheetHead(T('boot.ageTitle'), false) + '<p class="sec">' + T('boot.ageBody') + '</p><div class="row mt"><button class="btn btn-amber grow" data-action="age" data-v="adult">' + T('boot.ageYes') + '</button><button class="btn grow" data-action="age" data-v="minor">' + T('boot.ageNo') + '</button></div><p class="foot-note mt">' + T('boot.ageMinorNote') + '</p></div>';
    } else if (m.type === 'onboarding') {
      var slide = DATA.copy.onboarding[ui.onbIdx], dots = '';
      for (var i = 0; i < 3; i++) dots += '<i class="' + (i === ui.onbIdx ? 'on' : '') + '"></i>';
      inner = '<div id="onboarding"><div class="onb-title" id="modal-title">' + esc(slide.t) + '</div><p class="onb-body">' + esc(slide.b) + '</p><div class="dots">' + dots + '</div><div class="row"><button class="btn btn-ghost grow" data-action="onb-skip">' + T('boot.onbSkip') + '</button><button class="btn btn-amber grow" data-action="onb-next">' + T(ui.onbIdx >= 2 ? 'boot.onbStart' : 'boot.onbNext') + '</button></div></div>';
    } else if (m.type === 'corrupt') {
      inner = sheetHead(T('boot.corruptTitle'), false) + '<p class="sec">' + T('boot.corruptBody') + '</p><div class="row mt">' + (m.backupAvail ? '<button class="btn btn-amber grow" data-action="corrupt-restore">' + T('boot.restore') + '</button>' : '') + '<button class="btn btn-danger grow" data-action="corrupt-reset">' + T('boot.reset') + '</button></div>';
    } else if (m.type === 'error') {
      inner = sheetHead(T('boot.errorTitle'), false) + '<p class="sec">' + T('boot.errorBody') + '</p><button class="btn btn-amber btn-block mt" data-action="reload">' + T('label.reload') + '</button>';
    }
    return '<div class="overlay" data-action="overlay"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><div class="grab"></div>' + inner + '</div></div>';
  }
  function renderModal(st) {
    var root = $('modal-root'), key = modalKey(ui.modal), changed = key !== ui.lastModalKey;
    if (changed && ui.modal) ui.lastFocus = document.activeElement;
    root.innerHTML = modalHTML(st);
    if (changed) {
      ui.lastModalKey = key;
      if (ui.modal) {
        var sheet = root.querySelector('.sheet');
        if (sheet) { var f = sheet.querySelector('input') || sheet.querySelector('button'); (f || sheet).focus(); }
      } else if (ui.lastFocus && ui.lastFocus.focus) {
        try { ui.lastFocus.focus(); } catch (e) {}
        ui.lastFocus = null;
      }
    }
  }

  // ===== Render utama (debounce 250ms, §33) =====
  var BUILD = { home: screenHome, market: screenMarket, news: screenNews, portfolio: screenPortfolio, profile: screenProfile, faq: screenFAQ };
  function captureFocus() {
    var a = document.activeElement;
    if (!a || !a.dataset) return null;
    var keys = Object.keys(a.dataset);
    if (!keys.length) return null;
    var sel = '';
    keys.forEach(function (k) { sel += '[data-' + k + '="' + a.dataset[k] + '"]'; });
    var caret = null;
    try { caret = a.selectionStart; } catch (e) {}
    return { sel: sel, caret: caret };
  }
  function restoreFocus(info) {
    if (!info) return;
    var els;
    try { els = document.querySelectorAll(info.sel); } catch (e) { return; }
    var pick = null;
    for (var i = 0; i < els.length; i++) { if (els[i].offsetParent !== null) { pick = els[i]; break; } }
    if (!pick && els.length) pick = els[0];
    if (!pick) return;
    pick.focus();
    if (info.caret != null) { try { pick.setSelectionRange(info.caret, info.caret); } catch (e) {} }
  }
  function render() {
    var st = Engine.getState();
    var foc = captureFocus(), mBefore = ui.lastModalKey;
    renderTopBar(st);
    renderNav(st);
    ['home', 'market', 'news', 'portfolio', 'profile', 'faq'].forEach(function (n) {
      var el = $('screen-' + n);
      if (n === ui.screen) { el.className = 'screen active'; el.innerHTML = BUILD[n](st); }
      else el.className = 'screen';
    });
    renderDock(st);
    renderModal(st);
    if (modalKey(ui.modal) === mBefore) restoreFocus(foc);
    Engine.getStocks().forEach(function (s) { ui.lastPrices[s.code] = s.price; });
  }
  var requestRender = debounce(render, 250);
  var debSearch = debounce(render, 150);
  var debLot = debounce(render, 100);

  // ===== Toast & announce =====
  function toast(msg, type, action) {
    var root = $('toast-root');
    while (root.children.length >= 4) root.removeChild(root.firstChild);
    var frag = document.createDocumentFragment();
    var div = document.createElement('div');
    div.className = 'toast toast-' + (type || 'amber');
    var span = document.createElement('span');
    span.className = 'grow';
    span.textContent = msg;
    div.appendChild(span);
    if (action) {
      var btn = document.createElement('button');
      btn.className = 'btn btn-sm';
      btn.setAttribute('data-action', action);
      btn.textContent = T('toast.' + action);
      div.appendChild(btn);
    }
    frag.appendChild(div);
    root.appendChild(frag);
    setTimeout(function () { if (div.parentNode) div.parentNode.removeChild(div); }, 4200);
  }
  function handleToast(t) { toast(tpl(T('toast.' + t.id), t.vars), t.type, t.action); }
  function handleAnnounce(id, vars) {
    var v = {};
    Object.keys(vars || {}).forEach(function (k) { v[k] = vars[k]; });
    if (v.side) v.side = T('side.' + v.side);
    var el = $('sr-announce');
    if (el) el.textContent = tpl(T('announce.' + id), v);
  }

  // ===== Navigasi & aksi =====
  function go(screen) {
    ui.screen = screen;
    if (screen === 'market') Engine.actions.viewMarket();
    render();
    window.scrollTo(0, 0);
  }
  function closeModal() {
    if (ui.stack.length) { ui.modal = ui.stack.pop(); render(); return; }
    if (ui.modal && DISMISSABLE[ui.modal.type]) { ui.modal = null; render(); }
  }
  function advanceBoot() {
    var st = Engine.getState();
    if (!st.consent) ui.modal = { type: 'consent' };
    else if (!st.ageVerified) ui.modal = { type: 'age' };
    else if (!st.onboardingDone) ui.modal = { type: 'onboarding' };
    else {
      ui.modal = null;
      if (ui.bootRes && ui.bootRes.offline) {
        toast(tpl(T('toast.offlineProgress'), { delta: fmtSignedRp(ui.bootRes.offline.delta) }), 'frozen');
        ui.bootRes.offline = null;
      }
    }
    render();
  }
  function exportJSON() {
    var json = Engine.privacy.exportData();
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'terminal-sudirman-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast(T('toast.exportDone'), 'amber');
  }
  function act(action, el, ev) {
    var st = Engine.getState();
    var code = el && el.dataset ? el.dataset.code : null;
    switch (action) {
      case 'nav': go(el.dataset.screen); break;
      case 'goto-market': go('market'); break;
      case 'stock':
        ui.mode = el.dataset.mode === 'sell' ? 'sell' : 'buy';
        ui.lots = 1;
        Engine.actions.selectStock(code);
        if (!mq.matches) ui.modal = { type: 'stock', code: code };
        render();
        break;
      case 'star': Engine.actions.toggleWatchlist(code); render(); break;
      case 'news':
        Engine.actions.markNewsRead(el.dataset.id);
        ui.modal = { type: 'news', id: el.dataset.id };
        render();
        break;
      case 'close-modal': closeModal(); break;
      case 'overlay': if (ev && ev.target === el) closeModal(); break;
      case 'mode': ui.mode = el.dataset.mode; render(); break;
      case 'step': ui.lots = Math.max(0, (ui.lots || 0) + parseInt(el.dataset.d, 10)); render(); break;
      case 'quick':
        var qc = ui.modal && ui.modal.type === 'stock' ? ui.modal.code : currentCode(st);
        var pv = Engine.getOrderPreview(ui.mode, qc, 1), q = el.dataset.q;
        ui.lots = q === 'max' ? pv.maxLots : Math.floor(pv.maxLots * parseInt(q, 10) / 100);
        render();
        break;
      case 'exec':
        var res = Engine.actions[ui.mode](code, ui.lots);
        if (res.executed) ui.lots = 1;
        render();
        break;
      case 'claim': Engine.actions.claimMission(el.dataset.kind, el.dataset.id); render(); break;
      case 'ptab': ui.ptab = el.dataset.tab; render(); break;
      case 'faq':
        var i = parseInt(el.dataset.i, 10);
        ui.faqOpen = ui.faqOpen === i ? -1 : i;
        render();
        break;
      case 'legal':
        if (ui.modal) ui.stack.push(ui.modal);
        ui.modal = { type: 'legal', doc: el.dataset.doc };
        render();
        break;
      case 'chip': ui.sector = el.dataset.sector; render(); break;
      case 'ncat': ui.ncat = el.dataset.cat; render(); break;
      case 'reset-filters': ui.query = ''; ui.sector = 'all'; ui.sort = 'default'; render(); break;
      case 'search-clear': ui.query = ''; render(); var si = $('search-input'); if (si) si.focus(); break;
      case 'reset1': ui.modal = { type: 'reset1' }; render(); break;
      case 'reset2': ui.resetWord = ''; ui.modal = { type: 'reset2' }; render(); break;
      case 'reset2-do': if (ui.resetWord === 'RESET') { Engine.actions.reset(); location.reload(); } break;
      case 'clear1': ui.modal = { type: 'clear1' }; render(); break;
      case 'clear-do':
        Engine.privacy.clearData();
        toast(T('toast.dataCleared'), 'down');
        setTimeout(function () { location.reload(); }, 700);
        break;
      case 'export': exportJSON(); break;
      case 'event': Engine.news.triggerEvent(DATA.event.id); render(); break;
      case 'name-edit': ui.editName = true; ui.nameDraft = st.playerName; render(); var ni = $('name-input'); if (ni) ni.focus(); break;
      case 'name-save': Engine.actions.setName(ui.nameDraft); ui.editName = false; render(); break;
      case 'onb-next': if (ui.onbIdx < 2) { ui.onbIdx++; render(); } else { Engine.actions.finishOnboarding(); advanceBoot(); } break;
      case 'onb-skip': Engine.actions.finishOnboarding(); advanceBoot(); break;
      case 'consent-ok': Engine.actions.setConsent(); advanceBoot(); break;
      case 'consent-learn': ui.stack.push(ui.modal); ui.modal = { type: 'legal', doc: 'privacy' }; render(); break;
      case 'age': Engine.actions.setAge(el.dataset.v); advanceBoot(); break;
      case 'corrupt-reset': Engine.actions.reset(); location.reload(); break;
      case 'corrupt-restore':
        if (Engine.actions.restoreBackup()) advanceBoot();
        else { toast(T('toast.restoreFail'), 'down'); render(); }
        break;
      case 'trimLedger': Engine.actions.trimLedger(); render(); break;
      case 'reload': location.reload(); break;
    }
  }

  // ===== Keyboard & focus trap (§31) =====
  function onKeydown(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    if (ui.modal && e.key === 'Tab') {
      var root = $('modal-root'), f = root.querySelectorAll('button,input,select'), list = [];
      for (var i = 0; i < f.length; i++) if (!f[i].disabled && f[i].offsetParent !== null) list.push(f[i]);
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }
    var tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (ui.modal) return;
    if (e.key >= '1' && e.key <= '5') go(NAV[parseInt(e.key, 10) - 1].screen);
    else if (e.key === '/') { e.preventDefault(); go('market'); var si = $('search-input'); if (si) si.focus(); }
  }

  // ===== Boot (§22) =====
  function boot() {
    document.addEventListener('click', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
      if (el) act(el.getAttribute('data-action'), el, e);
    });
    document.addEventListener('input', function (e) {
      var t = e.target, k = t && t.dataset ? t.dataset.input : null;
      if (!k) return;
      if (k === 'search') { ui.query = t.value; debSearch(); }
      else if (k === 'lot') { ui.lots = Math.max(0, Math.floor(Number(t.value) || 0)); debLot(); }
      else if (k === 'name') { ui.nameDraft = t.value; }
      else if (k === 'resetword') { ui.resetWord = (t.value || '').toUpperCase(); debLot(); }
      else if (k === 'sort') { ui.sort = t.value; render(); }
    });
    document.addEventListener('keydown', onKeydown);
    if (mq.addEventListener) mq.addEventListener('change', function () { render(); });
    else if (mq.addListener) mq.addListener(function () { render(); });
    Engine.onChange(requestRender);
    Engine.onToast(handleToast);
    Engine.onAnnounce(handleAnnounce);
    var res;
    try { res = Engine.init(); }
    catch (e) {
      ui.modal = { type: 'error' };
      $('topbar').innerHTML = '<span class="phase-label">' + T('boot.errorTitle') + '</span>';
      $('modal-root').innerHTML = modalHTML(null);
      return;
    }
    ui.bootRes = res;
    if (res.ephemeral) { var b = $('storage-banner'); b.textContent = T('banner.storage'); b.hidden = false; }
    if (res.status === 'corrupt') {
      ui.modal = { type: 'corrupt', backupAvail: !!res.backupAvail };
      handleAnnounce('corrupt', {});
      render();
    } else advanceBoot();
    Engine.flushToasts();
    setInterval(function () { var c = $('clock'); if (c) c.textContent = fmtTime(Date.now()); }, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  return { boot: boot, go: go, render: render, act: act, fmtRp: fmtRp, fmtPct: fmtPct, fmtTime: fmtTime, fmtRelative: fmtRelative, toast: toast };
})();
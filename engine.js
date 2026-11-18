'use strict';
// Terminal Sudirman — engine.js (simulasi, state, save; tanpa akses DOM)
const Engine = (function () {
  var SAVE_KEY = 'terminal-sudirman-save-v1';
  var BACKUP_KEY = 'terminal-sudirman-save-v1-backup';
  var VERSION = 1, TICK_MS = 10000, FEE = DATA.feeRate, INIT = DATA.initialCapital, LOT = 100, MAX_WATCH = 6;
  var nf = new Intl.NumberFormat('id-ID');
  var sv = null, S = null, mk = {}, defs = {};
  DATA.stocks.forEach(function (d) { defs[d.code] = d; });
  var phase = 'closed', ephemeral = false, storageOK = true, tickError = false;
  var changeCbs = [], toastCbs = [], annCbs = [], pendingToasts = [];
  var saveTimer = null, hbTimer = null, newsBag = [];
  var nowFn = function () { return Date.now(); };

  // ===== Utilitas (§23) =====
  function gaussian() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    var g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return Math.max(-3, Math.min(3, g));
  }
  function tickSize(p) { return p < 200 ? 1 : p < 500 ? 2 : p < 2000 ? 5 : p < 5000 ? 10 : 25; }
  function roundToTick(p) { var t = tickSize(p); return Math.round(p / t) * t; }
  function clampTick(p, prevClose) {
    var lo = prevClose * 0.93, hi = prevClose * 1.15;
    p = Math.max(lo, Math.min(hi, p));
    var t = tickSize(p), r = Math.round(p / t) * t;
    if (r < lo) r = Math.ceil(lo / t) * t;
    if (r > hi) r = Math.floor(hi / t) * t;
    return r;
  }
  function seededShuffle(arr, seed) {
    var a = arr.slice(), s = seed >>> 0;
    var rand = function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; }
    return a;
  }
  function wib(ts) {
    var d = new Date(ts + 7 * 3600000);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), hh: d.getUTCHours(), mm: d.getUTCMinutes(), ss: d.getUTCSeconds(), day: d.getUTCDay() };
  }
  function dateSeed(ts) { var w = wib(ts); return w.y * 10000 + w.m * 100 + w.d; }
  function weekKey(ts) { var dow = (wib(ts).day + 6) % 7; return dateSeed(ts - dow * 86400000); }
  function calcPhase(ts) {
    var w = wib(ts);
    if (w.day === 0 || w.day === 6) return 'weekend';
    if (w.hh >= 9 && w.hh < 16) return 'open';
    if (w.hh >= 7 && w.hh < 9) return 'preMarket';
    return 'closed';
  }
  function fmtNum(n) { return nf.format(Math.round(n)); }

  // ===== Storage & save (§17, §28) =====
  function testStorage() { try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); return true; } catch (e) { return false; } }
  function rawGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function rawDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  var MIGRATIONS = {};
  function migrate(save) {
    while (save.version < VERSION) {
      var fn = MIGRATIONS[save.version];
      if (!fn) throw new Error('migrasi tidak tersedia');
      save = fn(save);
    }
    return save;
  }
  function validate(save) {
    if (!save || typeof save !== 'object' || typeof save.version !== 'number') throw new Error('bentuk save salah');
    if (!save.state || typeof save.state.cash !== 'number' || !save.state.market || !save.state.holdings) throw new Error('state tidak lengkap');
    return true;
  }
  function trim(save) {
    var st = save.state;
    if (st.ledger && st.ledger.length > 100) st.ledger = st.ledger.slice(-100);
    if (st.newsRead && st.newsRead.length > 500) st.newsRead = st.newsRead.slice(-500);
    if (st.newsLog && st.newsLog.length > 40) st.newsLog = st.newsLog.slice(-40);
    return save;
  }
  function parseSlot(raw) {
    if (!raw) return null;
    var save = JSON.parse(raw);
    validate(save);
    return trim(migrate(save));
  }
  function backupOk() { try { return !!parseSlot(rawGet(BACKUP_KEY)); } catch (e) { return false; } }
  function defaultState(now) {
    var market = {};
    DATA.stocks.forEach(function (d) {
      var hist = [];
      for (var i = 0; i < 16; i++) hist.push(roundToTick(d.basePrice * (1 + Math.sin(i * 1.7 + (d.basePrice % 7)) * 0.004)));
      hist.push(d.basePrice);
      market[d.code] = { price: d.basePrice, fv: d.basePrice, prevClose: d.basePrice, open: d.basePrice, hi: d.basePrice, lo: d.basePrice, hist: hist };
    });
    return {
      cash: INIT, holdings: {}, watchlist: ['BCAX', 'BRIA', 'BMRI', 'TLKM'], selectedStock: null,
      level: 1, xp: 0, badges: [], realizedPL: 0, dailyMissions: [], weeklyMissions: [],
      missionMetrics: { date: 0, newsReadToday: 0, buyCountToday: 0, marketViewCount: 0, realizedPLToday: 0, orderXPToday: 0 },
      weeklyMetrics: { week: 0, dailyCompleted: 0, badges: 0 }, dailyMissionsCompleted: 0,
      activeEvent: null, newsRead: [], ledger: [], simClock: now, lastTickAt: now,
      market: market, effects: [], decays: [], newsLog: [], nextNewsAt: now + 900000,
      firstBuyDone: false, eventSurvived: false, lastTradeValue: 0, lastTradePhase: null,
      lastOpenDate: 0, gapDate: 0, weekendSentiment: 0, volMult: {}, newsSeq: 0
    };
  }
  function freshSave(now) { return { version: VERSION, savedAt: now, consent: false, ageVerified: null, onboardingDone: false, playerName: 'Trader', state: defaultState(now) }; }
  function load() {
    var now = nowFn();
    if (!storageOK) { sv = freshSave(now); S = sv.state; return { status: 'fresh' }; }
    var raw = rawGet(SAVE_KEY);
    if (raw === null) { sv = freshSave(now); S = sv.state; return { status: 'fresh' }; }
    try { sv = parseSlot(raw); S = sv.state; return { status: 'resume' }; }
    catch (e) { sv = freshSave(now); S = sv.state; return { status: 'corrupt' }; }
  }
  function saveNow() {
    if (!storageOK || !sv) return;
    sv.savedAt = nowFn();
    var raw;
    try { raw = JSON.stringify(sv); } catch (e) { return; }
    try {
      var prev = rawGet(SAVE_KEY);
      localStorage.setItem(SAVE_KEY, raw);
      if (prev) { try { localStorage.setItem(BACKUP_KEY, prev); } catch (e) {} }
    } catch (e) {
      emitToast('saveQuota', {}, 'down', 'trimLedger');
      S.ledger = S.ledger.slice(-20);
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(sv)); emitToast('ledgerTrimmed', {}, 'frozen'); } catch (e2) {}
    }
  }
  function scheduleSave() { if (saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 500); }

  // ===== Kanal event ke UI =====
  function onChange(cb) { changeCbs.push(cb); }
  function onToast(cb) { toastCbs.push(cb); }
  function onAnnounce(cb) { annCbs.push(cb); }
  function notify() { changeCbs.forEach(function (cb) { try { cb(); } catch (e) {} }); }
  function emitToast(id, vars, type, action) {
    var t = { id: id, vars: vars || {}, type: type || 'amber', action: action || null };
    if (toastCbs.length) toastCbs.forEach(function (cb) { cb(t); }); else pendingToasts.push(t);
  }
  function flushToasts() { var p = pendingToasts.slice(); pendingToasts = []; p.forEach(function (t) { toastCbs.forEach(function (cb) { cb(t); }); }); }
  function announce(id, vars) { annCbs.forEach(function (cb) { cb(id, vars || {}); }); }

  // ===== Berita & efek (§13) =====
  function resolveTargets(targets) {
    var codes = [];
    DATA.stocks.forEach(function (d) { if (targets.indexOf(d.code) >= 0 || targets.indexOf(d.sector) >= 0) codes.push(d.code); });
    return codes;
  }
  function newsDef(id) {
    var i;
    for (i = 0; i < DATA.news.length; i++) if (DATA.news[i].id === id) return DATA.news[i];
    for (i = 0; i < DATA.eventNews.length; i++) if (DATA.eventNews[i].id === id) return DATA.eventNews[i];
    return null;
  }
  function refillBag() { newsBag = seededShuffle(DATA.news.map(function (n) { return n.id; }), Math.floor(nowFn() / 60000)); }
  function releaseNews(id, publishedAt, isEvent, skipImpact) {
    var def = newsDef(id);
    if (!def) return;
    var now = nowFn(), t = publishedAt || now;
    var codes = resolveTargets(def.targets), snap = {};
    codes.forEach(function (c) {
      snap[c] = mk[c].price;
      if (!skipImpact && def.impactPct !== 0) mk[c].fv = mk[c].fv * (1 + def.impactPct);
    });
    if (!skipImpact && def.impactPct !== 0) {
      S.effects.push({ newsId: id, codes: codes, impact: def.impactPct, m: 1 + def.impactPct, startedAt: t, expiresAt: t + def.durationSec * 1000, decay: def.decay, pool: !isEvent });
    }
    S.newsSeq++;
    S.newsLog.push({ id: id, publishedAt: t, snapshot: snap, event: !!isEvent });
    if (S.newsLog.length > 40) S.newsLog = S.newsLog.slice(-40);
    if (phase === 'weekend' || (phase === 'preMarket' && wib(now).day === 1)) S.weekendSentiment += def.impactPct;
  }
  function poolActive() { return S.effects.filter(function (e) { return e.pool; }).length; }
  function maybeReleaseNews(now) {
    if (phase !== 'open' && phase !== 'preMarket') return false;
    if (now < S.nextNewsAt) return false;
    S.nextNewsAt = now + (15 + Math.random() * 30) * 60000;
    if (poolActive() >= 3) return false;
    if (!newsBag.length) refillBag();
    var id = newsBag.pop();
    if (S.effects.some(function (e) { return e.newsId === id; })) return false;
    releaseNews(id, now, false, false);
    return true;
  }
  function expireEffects(now) {
    var keep = [];
    S.effects.forEach(function (e) {
      if (now >= e.expiresAt) {
        if (e.decay === 'step') e.codes.forEach(function (c) { mk[c].fv = mk[c].fv / e.m; });
        else e.codes.forEach(function (c) { var total = 0.6 * Math.log(e.m); S.decays.push({ code: c, left: total, perMs: total / 1800000 }); });
      } else keep.push(e);
    });
    S.effects = keep;
  }
  function applyDecays(dt) {
    var keep = [];
    S.decays.forEach(function (d) {
      var take = Math.min(Math.abs(d.left), Math.abs(d.perMs * dt));
      if (d.left < 0) take = -take;
      if (take !== 0) { mk[d.code].fv = mk[d.code].fv * Math.exp(-take); d.left -= take; }
      if (Math.abs(d.left) > 1e-9) keep.push(d);
    });
    S.decays = keep;
  }
  function effFrac(e, now) {
    if (e.decay !== 'linear') return 1;
    var span = e.expiresAt - e.startedAt;
    return span > 0 ? Math.max(0, Math.min(1, (e.expiresAt - now) / span)) : 0;
  }
  function newsImpactFor(code, now) {
    var sum = 0;
    S.effects.forEach(function (e) { if (e.codes.indexOf(code) >= 0) sum += e.impact * effFrac(e, now); });
    return sum;
  }
  function sectorSentiment(now) {
    var m = {};
    S.effects.forEach(function (e) {
      e.codes.forEach(function (c) { var sec = defs[c].sector; m[sec] = (m[sec] || 0) + e.impact * effFrac(e, now); });
    });
    return m;
  }

  // ===== Event multi-fase (§7.3, §13) =====
  function applyEventPhase(idx) {
    var ph = DATA.event.phases[idx], now = nowFn();
    S.activeEvent.phaseIndex = idx;
    S.volMult = {};
    releaseNews(ph.newsId, now, true, true);
    Object.keys(ph.impact).forEach(function (sec) {
      S.volMult[sec] = ph.volatilityMult;
      var codes = resolveTargets([sec]), imp = ph.impact[sec];
      codes.forEach(function (c) { mk[c].fv = mk[c].fv * (1 + imp); });
      S.effects.push({ newsId: ph.newsId, codes: codes, impact: imp, m: 1 + imp, startedAt: now, expiresAt: now + ph.durationSec * 1000, decay: 'linear', pool: false });
    });
    emitToast('eventPhase', { label: ph.label }, 'amber');
  }
  function advanceEvent() {
    if (!S.activeEvent) return;
    var ev = DATA.event;
    var elapsed = (S.simClock - S.activeEvent.startedAt) / 1000;
    var next = S.activeEvent.phaseIndex + 1;
    while (next < ev.phases.length && elapsed >= ev.phases[next].at) { applyEventPhase(next); next++; }
    var last = ev.phases[ev.phases.length - 1];
    if (S.activeEvent.phaseIndex === ev.phases.length - 1 && elapsed >= last.at + last.durationSec) {
      S.volMult = {};
      if (equity() > INIT) S.eventSurvived = true;
      S.activeEvent = null;
      checkBadges();
    }
  }
  function triggerEvent(id) {
    if (sv.ageVerified === 'minor') { emitToast('eventMinor', {}, 'frozen'); return false; }
    if (S.activeEvent || id !== DATA.event.id) return false;
    S.activeEvent = { id: id, phaseIndex: -1, startedAt: S.simClock };
    advanceEvent();
    emitToast('eventStarted', { title: DATA.event.title }, 'amber');
    scheduleSave(); notify();
    return true;
  }

  // ===== Price engine (§11) =====
  function tickCore(dt) {
    var now = nowFn();
    expireEffects(now);
    applyDecays(dt);
    var sent = sectorSentiment(now);
    var ageMult = sv.ageVerified === 'minor' ? 0.5 : 1;
    DATA.stocks.forEach(function (d) {
      var m = mk[d.code];
      var vm = (S.volMult[d.sector] || 1) * ageMult;
      var drift = (m.fv - m.price) * 0.02;
      var noise = gaussian() * d.volatility * vm * m.price;
      var boost = (sent[d.sector] || 0) * m.price * 0.01;
      var news = newsImpactFor(d.code, now) * m.price * 0.008;
      var p = clampTick(m.price + drift + noise + boost + news, m.prevClose);
      m.price = p;
      if (p > m.hi) m.hi = p;
      if (p < m.lo) m.lo = p;
      m.hist.push(p);
      if (m.hist.length > 24) m.hist = m.hist.slice(-24);
    });
    tickError = false;
  }
  function doTick() {
    try {
      tickCore(TICK_MS);
      S.lastTickAt = nowFn();
      S.simClock = nowFn();
      advanceEvent();
      checkBadges();
      refreshMissionProgress();
      scheduleSave();
      notify();
    } catch (e) { tickError = true; notify(); }
  }

  // ===== Fase bursa & Monday gap (§12) =====
  function openTransition(now) {
    var today = dateSeed(now);
    if (S.lastOpenDate === today) return;
    var isMon = wib(now).day === 1;
    DATA.stocks.forEach(function (d) {
      var m = mk[d.code];
      m.prevClose = m.price;
      if (isMon) {
        var weight = newsImpactFor(d.code, now) + S.weekendSentiment * 0.5;
        var gap = Math.max(-0.05, Math.min(0.05, weight * 0.5));
        m.price = clampTick(roundToTick(m.prevClose * (1 + gap)), m.prevClose);
      }
      m.open = m.price; m.hi = m.price; m.lo = m.price;
      m.hist.push(m.price);
      if (m.hist.length > 24) m.hist = m.hist.slice(-24);
    });
    S.lastOpenDate = today;
    if (isMon) S.gapDate = today;
    S.weekendSentiment = 0;
  }
  function heartbeat() {
    var now = nowFn(), p = calcPhase(now), changed = false;
    if (p !== phase) { phase = p; announce(p, {}); changed = true; }
    if (phase !== 'weekend') S.simClock = now;
    if (ensureMissions(now)) changed = true;
    if (phase === 'open') {
      openTransition(now);
      if (now - S.lastTickAt >= TICK_MS) { doTick(); changed = false; }
    }
    if (maybeReleaseNews(now)) changed = true;
    if (S.activeEvent) { var b = S.activeEvent.phaseIndex; advanceEvent(); if (!S.activeEvent || S.activeEvent.phaseIndex !== b) changed = true; }
    var eb = S.effects.length;
    expireEffects(now);
    if (S.effects.length !== eb) changed = true;
    if (changed) { scheduleSave(); notify(); }
  }

  // ===== Misi (§10, §15) =====
  function uniqueSectors() {
    var set = {};
    Object.keys(S.holdings).forEach(function (c) { if (S.holdings[c].lots > 0) set[defs[c].sector] = 1; });
    return Object.keys(set).length;
  }
  function equity() {
    var e = S.cash;
    Object.keys(S.holdings).forEach(function (c) { e += S.holdings[c].lots * LOT * mk[c].price; });
    return e;
  }
  function metricValue(key) {
    if (key === 'uniqueSectors') return uniqueSectors();
    if (key === 'weeklyDaily') return S.weeklyMetrics.dailyCompleted;
    if (key === 'weeklyEquity') return equity();
    if (key === 'weeklyBadges') return S.weeklyMetrics.badges;
    return S.missionMetrics[key] || 0;
  }
  function dailyDef(id) { var r = null; DATA.dailyPool.forEach(function (m) { if (m.id === id) r = m; }); return r; }
  function weeklyDef(id) { var r = null; DATA.weeklyPool.forEach(function (m) { if (m.id === id) r = m; }); return r; }
  function refreshMissionProgress() {
    S.dailyMissions.forEach(function (m) { var d = dailyDef(m.id); if (d) m.progress = Math.min(d.target, metricValue(d.metric)); });
    S.weeklyMissions.forEach(function (m) { var d = weeklyDef(m.id); if (d) m.progress = Math.min(d.target, metricValue(d.metric)); });
  }
  function ensureMissions(now) {
    var changed = false, ds = dateSeed(now);
    if (S.missionMetrics.date !== ds) {
      S.missionMetrics = { date: ds, newsReadToday: 0, buyCountToday: 0, marketViewCount: 0, realizedPLToday: 0, orderXPToday: 0 };
      S.dailyMissions = seededShuffle(DATA.dailyPool, ds).slice(0, 3).map(function (m) { return { id: m.id, progress: 0, claimed: false }; });
      changed = true;
    }
    var wk = weekKey(now);
    if (S.weeklyMetrics.week !== wk) {
      S.weeklyMetrics = { week: wk, dailyCompleted: 0, badges: 0 };
      S.weeklyMissions = DATA.weeklyPool.map(function (m) { return { id: m.id, progress: 0, claimed: false }; });
      changed = true;
    }
    if (changed) refreshMissionProgress();
    return changed;
  }
  function claimMission(kind, id) {
    var list = kind === 'daily' ? S.dailyMissions : S.weeklyMissions;
    var def = kind === 'daily' ? dailyDef(id) : weeklyDef(id);
    var m = null;
    list.forEach(function (x) { if (x.id === id) m = x; });
    if (!m || !def || m.claimed || m.progress < def.target) return false;
    m.claimed = true;
    if (kind === 'daily') { S.dailyMissionsCompleted++; S.weeklyMetrics.dailyCompleted++; }
    addXP(def.xp);
    emitToast('missionClaim', { xp: def.xp }, 'amber');
    announce('mission', { desc: def.desc, xp: def.xp });
    checkBadges(); refreshMissionProgress(); scheduleSave(); notify();
    return true;
  }

  // ===== XP, level, badge (§8, §9, §15) =====
  function levelFor(xp) { var lv = 1; DATA.levels.forEach(function (l, i) { if (xp >= l.xp) lv = i + 1; }); return Math.min(10, lv); }
  function rankTitle(lv) { return DATA.levels[Math.min(10, lv) - 1].title; }
  function addXP(n) {
    if (n <= 0) return;
    var before = S.level;
    S.xp += n;
    S.level = levelFor(S.xp);
    if (S.level > before) {
      emitToast('levelUp', { level: S.level, rank: rankTitle(S.level) }, 'amber');
      announce('levelUp', { level: S.level, rank: rankTitle(S.level) });
    }
  }
  function hasBadge(id) { return S.badges.indexOf(id) >= 0; }
  function unlock(id) {
    if (hasBadge(id)) return;
    var def = null;
    DATA.badges.forEach(function (b) { if (b.id === id) def = b; });
    if (!def) return;
    S.badges.push(id);
    S.weeklyMetrics.badges++;
    addXP(def.xp);
    emitToast('badgeUnlock', { name: def.name, xp: def.xp }, 'amber');
    announce('badge', { name: def.name, xp: def.xp });
  }
  function maxUnrealizedPct() {
    var mx = 0;
    Object.keys(S.holdings).forEach(function (c) {
      var h = S.holdings[c];
      if (h.lots <= 0 || h.avgBuy <= 0) return;
      var pct = (mk[c].price - h.avgBuy) / h.avgBuy;
      if (pct > mx) mx = pct;
    });
    return mx;
  }
  function checkBadges() {
    if (S.firstBuyDone) unlock('first-buy');
    if (S.realizedPL > 0) unlock('first-profit');
    if (S.newsRead.length >= 10) unlock('news-junkie');
    if (uniqueSectors() >= 4) unlock('diversified');
    if (['BCAX', 'BRIA', 'BMRI'].every(function (c) { return S.holdings[c] && S.holdings[c].lots > 0; })) unlock('bank-collector');
    if (S.lastTradeValue > 25000000) unlock('whale-order');
    if (maxUnrealizedPct() >= 0.15) unlock('diamond-hands');
    if (S.lastTradePhase === 'weekend') unlock('weekend-warrior');
    if (S.eventSurvived) unlock('event-survivor');
    if (S.dailyMissionsCompleted >= 15) unlock('mission-master');
    if (equity() >= 120000000) unlock('portfolio-120m');
    if (S.level >= 10 && S.badges.length >= 10) unlock('sudirman-legend');
  }

  // ===== Order (§14) =====
  function ownedLots(code) { return S.holdings[code] ? S.holdings[code].lots : 0; }
  function getOrderPreview(mode, code, lots) {
    var m = mk[code], price = m ? m.price : 0;
    lots = Math.floor(Number(lots) || 0);
    var principal = lots * LOT * price, fee = principal * FEE;
    var maxLots = mode === 'buy' ? Math.floor(S.cash / (price * LOT * (1 + FEE))) : ownedLots(code);
    var res = { valid: true, reason: null, principal: principal, fee: fee, totalDebet: principal + fee, totalKredit: principal - fee, cashAfter: mode === 'buy' ? S.cash - principal - fee : S.cash + principal - fee, maxLots: maxLots, price: price };
    if (!m || lots <= 0 || !isFinite(lots)) { res.valid = false; res.reason = 'INVALID_LOT'; }
    else if (phase === 'preMarket') { res.valid = false; res.reason = 'MARKET_CLOSED'; }
    else if (mode === 'buy' && res.totalDebet > S.cash) { res.valid = false; res.reason = 'INSUFFICIENT_CASH'; }
    else if (mode === 'sell' && lots > maxLots) { res.valid = false; res.reason = 'INSUFFICIENT_LOTS'; }
    return res;
  }
  function execute(mode, code, lots) {
    var pv = getOrderPreview(mode, code, lots);
    if (!pv.valid) {
      var map = { MARKET_CLOSED: 'marketClosed', INSUFFICIENT_CASH: 'insufficientCash', INSUFFICIENT_LOTS: 'insufficientLots' };
      if (map[pv.reason]) emitToast(map[pv.reason], {}, 'down');
      return pv;
    }
    lots = Math.floor(Number(lots));
    var price = pv.price, shares = lots * LOT, realized = 0, h;
    if (mode === 'buy') {
      S.cash -= pv.totalDebet;
      h = S.holdings[code] || { lots: 0, avgBuy: 0 };
      var oldShares = h.lots * LOT;
      h.avgBuy = (oldShares * h.avgBuy + shares * price) / (oldShares + shares);
      h.lots += lots;
      S.holdings[code] = h;
      S.firstBuyDone = true;
      S.missionMetrics.buyCountToday++;
    } else {
      h = S.holdings[code];
      realized = (price - h.avgBuy) * shares - pv.fee;
      S.cash += pv.totalKredit;
      h.lots -= lots;
      if (h.lots <= 0) delete S.holdings[code];
      S.realizedPL += realized;
      if (realized > 0) { S.missionMetrics.realizedPLToday += realized; addXP(Math.floor(realized / 10000)); }
    }
    S.lastTradeValue = pv.principal;
    S.lastTradePhase = phase;
    S.ledger.push({ t: nowFn(), side: mode, code: code, lots: lots, price: price, fee: pv.fee, total: mode === 'buy' ? pv.totalDebet : pv.totalKredit, realized: realized });
    if (S.ledger.length > 100) S.ledger = S.ledger.slice(-100);
    if (S.missionMetrics.orderXPToday < 50) { var gain = Math.min(5, 50 - S.missionMetrics.orderXPToday); S.missionMetrics.orderXPToday += gain; addXP(gain); }
    var total = mode === 'buy' ? pv.totalDebet : pv.totalKredit;
    emitToast(mode === 'buy' ? 'buySuccess' : 'sellSuccess', { lots: lots, code: code, price: fmtNum(price), total: fmtNum(total) }, mode === 'buy' ? 'up' : 'down');
    announce('order', { side: mode, lots: lots, code: code, total: 'Rp' + fmtNum(total) });
    checkBadges(); refreshMissionProgress(); scheduleSave(); notify();
    pv.executed = true;
    pv.realized = realized;
    return pv;
  }

  // ===== Aksi lain =====
  function markNewsRead(id) {
    if (S.newsRead.indexOf(id) >= 0) return false;
    S.newsRead.push(id);
    if (S.newsRead.length > 500) S.newsRead = S.newsRead.slice(-500);
    S.missionMetrics.newsReadToday++;
    addXP(10);
    emitToast('newsReadXP', {}, 'amber');
    checkBadges(); refreshMissionProgress(); scheduleSave(); notify();
    return true;
  }
  function toggleWatchlist(code) {
    var i = S.watchlist.indexOf(code);
    if (i >= 0) { S.watchlist.splice(i, 1); emitToast('watchlistRemoved', { code: code }, 'frozen'); }
    else {
      if (S.watchlist.length >= MAX_WATCH) { emitToast('watchlistFull', {}, 'down'); return false; }
      S.watchlist.push(code);
      emitToast('watchlistAdded', { code: code }, 'amber');
    }
    scheduleSave(); notify();
    return true;
  }
  function selectStock(code) { S.selectedStock = code; scheduleSave(); notify(); }
  function viewMarket() { S.missionMetrics.marketViewCount++; refreshMissionProgress(); scheduleSave(); notify(); }
  function setName(n) { sv.playerName = String(n || '').slice(0, 24) || 'Trader'; emitToast('nameSaved', {}, 'amber'); scheduleSave(); notify(); }
  function setConsent() { sv.consent = true; scheduleSave(); notify(); }
  function setAge(v) { sv.ageVerified = v === 'minor' ? 'minor' : 'adult'; scheduleSave(); notify(); }
  function finishOnboarding() { sv.onboardingDone = true; scheduleSave(); notify(); }
  function resetAll() { rawDel(SAVE_KEY); rawDel(BACKUP_KEY); }
  function trimLedger() { S.ledger = S.ledger.slice(-20); saveNow(); notify(); }
  function restoreBackup() {
    try {
      var b = parseSlot(rawGet(BACKUP_KEY));
      if (!b) return false;
      sv = b; S = sv.state; mk = S.market;
      saveNow(); notify();
      return true;
    } catch (e) { return false; }
  }

  // ===== Init & offline progress (§17.2, §22) =====
  function init() {
    storageOK = testStorage();
    ephemeral = !storageOK;
    var res = load();
    mk = S.market;
    var now = nowFn();
    phase = calcPhase(now);
    ensureMissions(now);
    if (res.status === 'fresh') {
      releaseNews('news-15', now - 1500000, false, false);
      refillBag();
      var seeded = 0;
      while (seeded < 2 && newsBag.length) {
        var id = newsBag.pop();
        if (id !== 'news-15') { releaseNews(id, now - (600000 + seeded * 720000), false, false); seeded++; }
      }
      S.nextNewsAt = now + (15 + Math.random() * 30) * 60000;
      refreshMissionProgress();
      saveNow();
    }
    if (res.status === 'resume') {
      res.offline = null;
      var elapsed = now - S.lastTickAt;
      if (phase === 'open' && elapsed > TICK_MS) {
        openTransition(now);
        var n = Math.min(300, Math.floor(elapsed / TICK_MS));
        var before = equity();
        for (var i = 0; i < n; i++) tickCore(TICK_MS);
        S.lastTickAt = now; S.simClock = now;
        advanceEvent(); checkBadges(); refreshMissionProgress();
        res.offline = { ticks: n, delta: equity() - before };
        saveNow();
      }
    }
    if (res.status === 'corrupt') res.backupAvail = backupOk();
    if (hbTimer) clearInterval(hbTimer);
    hbTimer = setInterval(heartbeat, 1000);
    res.phase = phase;
    res.ephemeral = ephemeral;
    return res;
  }

  // ===== Kontrak publik (§24) =====
  function getState() {
    var eq = equity(), upl = 0;
    Object.keys(S.holdings).forEach(function (c) { var h = S.holdings[c]; upl += (mk[c].price - h.avgBuy) * h.lots * LOT; });
    var xpToNext = S.level >= 10 ? 0 : DATA.levels[S.level].xp - S.xp;
    var evSummary = null;
    if (S.activeEvent) {
      var ph = DATA.event.phases[S.activeEvent.phaseIndex];
      var elapsed = (S.simClock - S.activeEvent.startedAt) / 1000;
      evSummary = { id: S.activeEvent.id, title: DATA.event.title, phaseIndex: S.activeEvent.phaseIndex, label: ph.label, remainingSec: Math.max(0, ph.at + ph.durationSec - elapsed), sectors: Object.keys(ph.impact) };
    }
    var unread = 0;
    S.newsLog.forEach(function (n) { if (S.newsRead.indexOf(n.id) < 0) unread++; });
    return {
      cash: S.cash, holdings: S.holdings, watchlist: S.watchlist, selectedStock: S.selectedStock,
      level: S.level, xp: S.xp, xpToNext: xpToNext, rankTitle: rankTitle(S.level), badges: S.badges,
      dailyMissions: S.dailyMissions, weeklyMissions: S.weeklyMissions,
      equity: eq, realizedPL: S.realizedPL, unrealizedPL: upl,
      sessionPhase: phase, simClock: S.simClock, activeEvent: evSummary, newsUnreadCount: unread,
      playerName: sv.playerName, consent: sv.consent, ageVerified: sv.ageVerified, onboardingDone: sv.onboardingDone,
      ephemeral: ephemeral, tickError: tickError, initialCapital: INIT, ledger: S.ledger
    };
  }
  function getStocks() {
    return DATA.stocks.map(function (d) {
      var m = mk[d.code];
      return { code: d.code, name: d.name, sector: d.sector, icon: d.icon, price: m.price, prevClose: m.prevClose, changePct: m.prevClose ? (m.price - m.prevClose) / m.prevClose : 0, dayHigh: m.hi, dayLow: m.lo, sparkline: m.hist.slice(), isInWatchlist: S.watchlist.indexOf(d.code) >= 0, open: m.open };
    });
  }
  function getNews() {
    var now = nowFn();
    return S.newsLog.slice().reverse().map(function (n) {
      var def = newsDef(n.id);
      if (!def) return null;
      var eff = null;
      S.effects.forEach(function (e) { if (e.newsId === n.id && !eff) eff = e; });
      var meter = null, codes = resolveTargets(def.targets);
      if (codes.length) { var c = codes[0]; meter = { code: c, releasePrice: n.snapshot[c] || mk[c].price, currentPrice: mk[c].price }; }
      return { id: n.id, sentiment: def.sentiment, category: def.category, targets: def.targets, title: def.title, summary: def.summary, body: def.body, publishedAt: n.publishedAt, read: S.newsRead.indexOf(n.id) >= 0, activeEffect: eff ? { remainingSec: Math.max(0, (eff.expiresAt - now) / 1000), durationSec: def.durationSec } : null, meter: meter, isEvent: n.event };
    }).filter(function (x) { return x; });
  }
  function exportData() { return JSON.stringify(sv, null, 2); }

  return {
    init: init, getState: getState, getStocks: getStocks, getNews: getNews, getOrderPreview: getOrderPreview,
    onChange: onChange, onToast: onToast, onAnnounce: onAnnounce, flushToasts: flushToasts,
    actions: {
      buy: function (c, l) { return execute('buy', c, l); },
      sell: function (c, l) { return execute('sell', c, l); },
      markNewsRead: markNewsRead, toggleWatchlist: toggleWatchlist, selectStock: selectStock, viewMarket: viewMarket,
      setName: setName, setConsent: setConsent, setAge: setAge, finishOnboarding: finishOnboarding,
      claimMission: claimMission, reset: resetAll, restoreBackup: restoreBackup, trimLedger: trimLedger
    },
    news: { triggerEvent: triggerEvent },
    missions: { track: refreshMissionProgress },
    privacy: { exportData: exportData, clearData: resetAll },
    utils: { gaussian: gaussian, roundToTick: roundToTick, seededShuffle: seededShuffle, dateSeed: dateSeed, calcPhase: calcPhase, wib: wib },
    __setNow: function (fn) { nowFn = fn; },
    __stop: function () { if (hbTimer) clearInterval(hbTimer); if (saveTimer) clearTimeout(saveTimer); },
    __heartbeat: heartbeat, __tick: doTick
  };
})();
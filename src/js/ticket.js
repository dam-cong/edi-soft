// Customer support center (ticket.html): send a ticket, follow your tickets, look one up by code + phone.
// Needs main.js (SHEET_API_URL, PHONE_REGEX, normalizePhone) and i18n.js (translations, getCurrentLang).
// Everything lives inside initSupportCenter so no top-level name can clash with main.js.

document.addEventListener("DOMContentLoaded", initSupportCenter);

function initSupportCenter() {
  const root = document.getElementById("support-center");
  if (!root) return;

  const $ = (id) => document.getElementById(id);
  const t = () => translations[getCurrentLang()];
  const CODE_RE = /^EDI-\d{4}-\d{4,}$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const STORE_KEY = "edi-my-tickets";
  const STEP_OF = { new: 0, received: 1, in_progress: 2, waiting: 2, done: 3 };
  const STEP_KEYS = ["new", "received", "in_progress", "done"];
  const AUTO_REFRESH_MS = 20000;

  // ---------- API (Google Apps Script web app) ----------
  const request = async (url, options) => {
    if (!SHEET_API_URL) throw new Error("SHEET_API_URL is not set");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    try {
      const res = await fetch(url, { ...options, signal: ctrl.signal });
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  };
  // text/plain keeps the POST a "simple" request: no CORS preflight against Apps Script
  const apiPost = (payload) =>
    request(SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  const apiGet = (params) => request(`${SHEET_API_URL}?${new URLSearchParams(params)}`);

  // ---------- Small DOM helpers ----------
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  // Text that follows the language switch: data-i18n is re-applied by applyLanguage()
  const i18n = (tag, className, key) => {
    const node = el(tag, className, t()[key] || "");
    node.setAttribute("data-i18n", key);
    return node;
  };
  const fmt = (iso) => {
    const d = new Date(iso);
    return iso && !isNaN(d)
      ? d.toLocaleString(getCurrentLang() === "en" ? "en-GB" : "vi-VN", { dateStyle: "medium", timeStyle: "short" })
      : "";
  };
  const normalizeCode = (v) => {
    const raw = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const m = raw.match(/^EDI(\d{4})(\d{4,})$/);
    return m ? `EDI-${m[1]}-${m[2]}` : raw;
  };
  // Coloured chip for a category/priority value (tone comes from CSS via data-tone)
  const toneChip = (kind, value) => {
    const c = i18n("span", "tone-chip", `sf-${kind === "category" ? "cat" : "pri"}-${value}`);
    c.dataset.tone = value;
    return c;
  };
  const badge = (status) => {
    const b = i18n("span", "tr-badge", `ticket-status-${status}`);
    b.dataset.status = status;
    return b;
  };

  // ---------- Tickets remembered on this device ----------
  const loadMine = () => {
    try {
      const list = JSON.parse(localStorage.getItem(STORE_KEY));
      return Array.isArray(list) ? list.filter((x) => x && CODE_RE.test(x.code) && PHONE_REGEX.test(x.phone)) : [];
    } catch {
      return [];
    }
  };
  let mine = loadMine();
  const saveMine = () => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(mine));
    } catch {}
  };
  const remember = (code, phone, subject) => {
    mine = [{ code, phone, subject: subject || "" }, ...mine.filter((x) => x.code !== code)].slice(0, 20);
    saveMine();
  };

  const info = {}; // code -> latest answer from the server
  const openCodes = new Set(); // which cards are expanded
  let lastChecked = null;
  let refreshing = false;
  let lastRefreshAt = 0;
  let refreshFailed = false;

  // ---------- Detail view shared by "My tickets" and the lookup form ----------
  const buildDetail = (data) => {
    const wrap = el("div", "tr-detail");

    if (data.status !== "cancelled") {
      const current = STEP_OF[data.status] ?? 0;
      const steps = el("ol", "tr-steps");
      STEP_KEYS.forEach((key, i) => {
        const li = el("li");
        li.className = [i < current || data.status === "done" ? "is-done" : "", i === current && data.status !== "done" ? "is-current" : ""].join(" ").trim();
        li.append(el("span", "tr-dot"), i18n("span", "", `ticket-status-${key}`));
        steps.append(li);
      });
      wrap.append(steps);
    }

    if (data.category || data.priority) {
      const tones = el("div", "tr-tones");
      if (t()[`sf-cat-${data.category}`]) tones.append(toneChip("category", data.category));
      if (t()[`sf-pri-${data.priority}`]) tones.append(toneChip("priority", data.priority));
      wrap.append(tones);
    }

    const dates = el("dl", "tr-dates");
    [
      ["ticket-label-created", data.createdAt],
      ["ticket-label-updated", data.updatedAt],
      ["ticket-label-completed", data.completedAt],
    ].forEach(([key, iso]) => {
      if (!iso) return;
      const row = el("div");
      row.append(i18n("dt", "", key), el("dd", "", fmt(iso)));
      dates.append(row);
    });
    wrap.append(dates);

    if (data.publicNote) {
      const note = el("div", "tr-note");
      note.append(i18n("h3", "", "ticket-note-title"), el("p", "", data.publicNote));
      wrap.append(note);
    }
    return wrap;
  };

  // ---------- Tabs ----------
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = { create: $("panel-create"), track: $("panel-track") };

  const showTab = (name, focus) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.tab === name;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[tab.dataset.tab].hidden = !on;
      if (on && focus) tab.focus();
    });
    try {
      history.replaceState(null, "", location.pathname + location.search + (name === "track" ? "#track" : ""));
    } catch {}
    if (name === "track") refresh(false);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => showTab(tab.dataset.tab));
    tab.addEventListener("keydown", (e) => {
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next == null) return;
      e.preventDefault();
      showTab(tabs[(next + tabs.length) % tabs.length].dataset.tab, true);
    });
  });

  // ---------- 1. Create a ticket ----------
  const form = $("support-form");
  const success = $("support-success");
  const submitBtn = $("btn-support");
  const submitError = $("support-error");
  const submitLabel = submitBtn.querySelector('[data-i18n="sf-submit"]');

  const fields = {
    name: { input: "sf-name", test: (v) => (v ? "" : "error-name") },
    phone: {
      input: "sf-phone",
      test: (v) => {
        const p = normalizePhone(v);
        return !p ? "error-phone-empty" : PHONE_REGEX.test(p) ? "" : "error-phone-format";
      },
    },
    email: { input: "sf-email", test: (v) => (!v ? "error-email-empty" : EMAIL_RE.test(v) ? "" : "error-email-format") },
    subject: { input: "sf-subject", test: (v) => (v ? "" : "sf-error-subject") },
    description: { input: "sf-description", test: (v) => (v.length >= 10 ? "" : "sf-error-desc") },
    link: { input: "sf-link", test: (v) => (!v || /^https?:\/\/\S+$/i.test(v) ? "" : "sf-error-link") },
  };

  const validate = (name) => {
    const f = fields[name];
    const input = $(f.input);
    const key = f.test(input.value.trim());
    input.classList.toggle("invalid", !!key);
    input.setAttribute("aria-invalid", String(!!key));
    $(`se-${name}`).textContent = key ? t()[key] : "";
    return !key;
  };
  Object.keys(fields).forEach((name) => $(fields[name].input).addEventListener("blur", () => validate(name)));

  const consent = $("sf-consent");
  const validateConsent = () => {
    const ok = consent.checked;
    $("se-consent").textContent = ok ? "" : t()["error-consent"];
    return ok;
  };
  consent.addEventListener("change", validateConsent);

  const counter = $("sf-count");
  const description = $("sf-description");
  const updateCount = () => {
    counter.textContent = `${description.value.length}/${description.maxLength}`;
  };
  description.addEventListener("input", updateCount);

  // "Urgent" -> show the call / Zalo shortcut
  const urgentBox = $("sf-urgent");
  form.addEventListener("change", (e) => {
    if (e.target.name === "priority") urgentBox.hidden = e.target.value !== "urgent";
  });

  const showSuccess = (code, payload, saved) => {
    $("sx-code").textContent = code;
    $("sx-subject").textContent = payload.subject;
    const cat = $("sx-category");
    cat.dataset.tone = payload.category;
    cat.setAttribute("data-i18n", `sf-cat-${payload.category}`);
    cat.textContent = t()[`sf-cat-${payload.category}`] || "";
    const pri = $("sx-priority");
    pri.dataset.tone = payload.priority;
    pri.setAttribute("data-i18n", `sf-pri-${payload.priority}`);
    pri.textContent = t()[`sf-pri-${payload.priority}`] || "";
    $("sx-saved").hidden = !saved;
    $("sx-copy-status").textContent = "";
    success.dataset.code = code;
    form.hidden = true;
    success.hidden = false;
    success.focus();
    success.scrollIntoView({ block: "nearest" });
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitError.textContent = "";

    const results = Object.keys(fields).map(validate);
    results.push(validateConsent());
    if (results.includes(false)) {
      form.querySelector(".invalid, #sf-consent:not(:checked)")?.focus();
      return;
    }

    const value = (id) => $(id).value.trim();
    const payload = {
      action: "ticket_create",
      name: value("sf-name"),
      phone: normalizePhone(value("sf-phone")),
      email: value("sf-email"),
      company: value("sf-company"),
      category: form.elements.category.value,
      priority: form.elements.priority.value,
      subject: value("sf-subject"),
      description: value("sf-description"),
      link: value("sf-link"),
      consent: true,
      lang: getCurrentLang(),
      website: form.elements.website.value, // honeypot: real visitors leave it empty
    };

    submitBtn.disabled = true;
    submitLabel.textContent = t()["sf-submit-loading"];
    try {
      const out = await apiPost(payload);
      if (out.ok && out.code) {
        const saved = $("sf-remember").checked;
        if (saved) {
          remember(out.code, payload.phone, payload.subject);
          renderMine();
        }
        showSuccess(out.code, payload, saved);
      } else {
        submitError.textContent = t()[out.error === "rate_limited" ? "sf-error-limit" : "error-submit"];
      }
    } catch {
      submitError.textContent = t()["error-submit"];
    } finally {
      submitBtn.disabled = false;
      submitLabel.textContent = t()["sf-submit"];
    }
  });

  // Copy the code (clipboard API, with a text-selection fallback for older browsers / file://)
  $("sx-copy").addEventListener("click", async () => {
    const code = success.dataset.code || "";
    let copied = false;
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
    } catch {
      const range = document.createRange();
      range.selectNodeContents($("sx-code"));
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      try {
        copied = document.execCommand("copy");
      } catch {}
    }
    const status = $("sx-copy-status");
    status.textContent = copied ? t()["sx-copied"] : "";
    status.setAttribute("data-i18n", copied ? "sx-copied" : "");
  });

  $("sx-track").addEventListener("click", () => {
    const code = success.dataset.code;
    showTab("track", true);
    const open = document.querySelector(`.mt-item[data-code="${code}"] details`);
    if (open) open.open = true;
    openCodes.add(code);
  });

  $("sx-new").addEventListener("click", () => {
    // keep who you are, clear what the ticket is about
    ["sf-subject", "sf-description", "sf-link"].forEach((id) => {
      $(id).value = "";
    });
    form.querySelectorAll(".invalid").forEach((n) => n.classList.remove("invalid"));
    form.querySelectorAll(".error-msg").forEach((n) => (n.textContent = ""));
    updateCount();
    success.hidden = true;
    form.hidden = false;
    $("sf-subject").focus();
  });

  // ---------- 2. My tickets ----------
  const list = $("mt-list");

  const mineItem = (item) => {
    const r = info[item.code];
    const li = el("li", "mt-item");
    li.dataset.code = item.code;
    const card = el("details", "mt-card");
    card.open = openCodes.has(item.code);
    card.addEventListener("toggle", () => (card.open ? openCodes.add(item.code) : openCodes.delete(item.code)));

    const summary = el("summary", "mt-summary");
    const main = el("div", "mt-main");
    main.append(el("strong", "mt-code", item.code), el("span", "mt-subject", item.subject || r?.subject || ""));
    summary.append(main);
    if (r?.ok) {
      if (r.priority === "urgent") summary.append(Object.assign(toneChip("priority", "urgent"), { className: "tone-chip mt-urgent" }));
      summary.append(badge(r.status));
    } else {
      const pending = r
        ? r.error === "not_found"
          ? "mt-gone"
          : r.error === "rate_limited"
            ? "ticket-error-limit"
            : "mt-error"
        : refreshFailed
          ? "mt-error"
          : "mt-updating";
      summary.append(i18n("span", "mt-pending", pending));
    }
    summary.append(el("span", "mt-chevron"));
    card.append(summary);

    const body = el("div", "mt-body");
    if (r?.ok) body.append(buildDetail(r));
    else if (r?.error === "not_found") body.append(i18n("p", "mt-note", "mt-gone"));
    else if (r?.error === "rate_limited") body.append(i18n("p", "mt-note", "ticket-error-limit"));
    else body.append(i18n("p", "mt-note", refreshFailed ? "mt-error" : "mt-updating"));

    const remove = i18n("button", "btn btn-secondary btn-sm mt-remove", "mt-remove");
    remove.type = "button";
    remove.addEventListener("click", () => {
      mine = mine.filter((x) => x.code !== item.code);
      delete info[item.code];
      saveMine();
      renderMine();
    });
    body.append(remove);
    card.append(body);
    li.append(card);
    return li;
  };

  function renderMine() {
    list.replaceChildren(...mine.map(mineItem));
    $("mt-empty").hidden = mine.length > 0;
    $("mt-actions").hidden = mine.length === 0;
    $("mt-privacy").hidden = mine.length === 0;
    const count = $("tp-count");
    count.textContent = String(mine.length);
    count.hidden = mine.length === 0;
    const stamp = $("mt-checked");
    stamp.hidden = !lastChecked;
    $("mt-checked-time").textContent = lastChecked ? fmt(lastChecked.toISOString()) : "";
    $("mt-refresh").disabled = refreshing;
    $("mt-refresh").classList.toggle("is-loading", refreshing);
  }

  async function refresh(force) {
    if (!mine.length || refreshing) return;
    if (!force && Date.now() - lastRefreshAt < AUTO_REFRESH_MS) return;
    refreshing = true;
    refreshFailed = false;
    renderMine();

    const groups = {};
    mine.forEach((x) => (groups[x.phone] = groups[x.phone] || []).push(x.code));
    try {
      for (const [phone, codes] of Object.entries(groups)) {
        for (let i = 0; i < codes.length; i += 10) {
          const out = await apiGet({ action: "lookup_many", phone, codes: codes.slice(i, i + 10).join(",") });
          if (!out.ok) throw new Error(out.error || "failed");
          out.results.forEach((r) => {
            info[r.code] = r;
          });
        }
      }
      // remember subjects the server knows, for tickets saved without one
      let changed = false;
      mine.forEach((x) => {
        const r = info[x.code];
        if (r?.ok && r.subject && x.subject !== r.subject) {
          x.subject = r.subject;
          changed = true;
        }
      });
      if (changed) saveMine();
      lastChecked = new Date();
      lastRefreshAt = Date.now();
    } catch {
      refreshFailed = true;
    } finally {
      refreshing = false;
      renderMine();
    }
  }

  $("mt-refresh").addEventListener("click", () => refresh(true));
  $("mt-clear").addEventListener("click", () => {
    mine = [];
    saveMine();
    Object.keys(info).forEach((k) => delete info[k]);
    renderMine();
  });

  // ---------- 3. Look up one ticket by code + phone ----------
  const lookupForm = $("ticket-form");
  const lookupResult = $("lk-result");
  const lookupError = $("ticket-error");
  const lookupBtn = $("btn-ticket");
  const lookupLabel = lookupBtn.querySelector('[data-i18n="ticket-submit"]');
  const codeEl = $("ticket-code");
  const phoneEl = $("ticket-phone");
  let shown = null;

  codeEl.addEventListener("blur", () => {
    codeEl.value = normalizeCode(codeEl.value);
  });

  const renderLookup = () => {
    if (!shown) return;
    const head = el("div", "tr-head");
    const id = el("div");
    id.append(i18n("span", "tr-label", "ticket-code-label"), el("strong", "tr-code", shown.code));
    head.append(id, badge(shown.status));
    const back = i18n("button", "btn btn-secondary btn-sm", "ticket-new");
    back.type = "button";
    back.addEventListener("click", () => {
      shown = null;
      lookupResult.hidden = true;
      lookupForm.hidden = false;
      phoneEl.value = "";
      codeEl.focus();
    });
    lookupResult.replaceChildren(head, buildDetail(shown), back);
  };

  lookupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    lookupError.textContent = "";
    const code = normalizeCode(codeEl.value);
    codeEl.value = code;
    const phone = normalizePhone(phoneEl.value.trim());

    if (!CODE_RE.test(code)) {
      lookupError.textContent = t()["ticket-error-code"];
      codeEl.focus();
      return;
    }
    if (!PHONE_REGEX.test(phone)) {
      lookupError.textContent = t()["error-phone-format"];
      phoneEl.focus();
      return;
    }

    lookupBtn.disabled = true;
    lookupLabel.textContent = t()["ticket-submit-loading"];
    try {
      const out = await apiGet({ action: "lookup", code, phone });
      if (out.ok) {
        shown = { ...out, code };
        if ($("lk-save").checked) {
          remember(code, phone, out.subject);
          info[code] = shown;
          renderMine();
        }
        lookupForm.hidden = true;
        lookupResult.hidden = false;
        renderLookup();
        lookupResult.focus();
      } else {
        lookupError.textContent = t()[out.error === "rate_limited" ? "ticket-error-limit" : out.error === "not_found" ? "ticket-error-notfound" : "ticket-error-network"];
      }
    } catch {
      lookupError.textContent = t()["ticket-error-network"];
    } finally {
      lookupBtn.disabled = false;
      lookupLabel.textContent = t()["ticket-submit"];
    }
  });

  // ---------- Language switch: rebuild what was built from data ----------
  $("lang-toggle")?.addEventListener("click", () =>
    setTimeout(() => {
      renderMine();
      renderLookup();
      updateCount();
    }),
  );

  // ---------- Start ----------
  updateCount();
  renderMine();

  // Links from the support team: ?ticket=EDI-YYMM-NNNN opens the tracking tab with the code filled in
  const preset = new URLSearchParams(location.search).get("ticket");
  if (preset) {
    codeEl.value = normalizeCode(preset);
    showTab("track");
    phoneEl.focus({ preventScroll: true });
  } else if (location.hash === "#track") {
    showTab("track");
  }
}

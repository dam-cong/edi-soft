// Main JavaScript logic for EDI Soft Landing Page
// Requires i18n.js to be loaded first (translations, getCurrentLang, applyLanguage)

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initLangToggle();
  initHeaderScroll();
  initMobileMenu();
  initScrollReveal();
  initInteractiveTimeline();
  initBackToTop();
  initContactForm();
  initNavScrollSpy();
  initNavHover();
  initScrollProgress();
  initCardSpotlight();
  initCountUp();
  initStagger();
  initCursorGlow();
  initMockTilt();
  initChatLoop();
  initConsoleHello();
  initMarqueeToggle();
  initAiDemo();
  initProjectFilter();
});

/**
 * 1. Theme Toggle (Dark/Light) with localStorage persistence & system preference detection
 */
function initThemeToggle() {
  const html = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const getPreferredTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return "light";
  };

  const applyTheme = (theme) => html.setAttribute("data-theme", theme);

  // Apply initial theme
  applyTheme(getPreferredTheme());

  // Toggle on click — only an explicit choice is saved, so system changes still apply otherwise
  toggleBtn.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem("theme", next);
  });
}

/**
 * 2. Language Toggle (Vietnamese / English)
 */
function initLangToggle() {
  const toggleBtn = document.getElementById("lang-toggle");
  if (!toggleBtn) return;

  const switchLang = (lang) => {
    applyLanguage(lang);
    const t = translations[lang];
    toggleBtn.setAttribute("aria-label", t["lang-aria"] || "");
    toggleBtn.setAttribute("title", t["lang-title"] || "");
  };

  // Apply saved language on load
  const currentLang = getCurrentLang();
  switchLang(currentLang);
  document.documentElement.classList.remove("i18n-pending");

  // Toggle on click
  toggleBtn.addEventListener("click", () => {
    const html = document.documentElement;
    const newLang = html.getAttribute("lang") === "vi" ? "en" : "vi";
    switchLang(newLang);
  });
}

/**
 * 3. Change header style on scroll
 */
function initHeaderScroll() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll);
  // Initial check
  handleScroll();
}

/**
 * 3. Mobile navigation toggle logic
 */
function initMobileMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileNavPanel = document.getElementById("mobile-nav-panel");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const header = document.getElementById("site-header");

  if (!menuToggle || !mobileNavPanel) return;

  const setOpen = (isOpen) => {
    menuToggle.classList.toggle("open", isOpen);
    mobileNavPanel.classList.toggle("open", isOpen);
    document.documentElement.classList.toggle("menu-open", isOpen);

    // Accessibility updates
    menuToggle.setAttribute("aria-expanded", isOpen);
    mobileNavPanel.setAttribute("aria-hidden", !isOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) mobileNavLinks[0]?.focus({ preventScroll: true });
  };

  const isOpen = () => menuToggle.classList.contains("open");

  menuToggle.addEventListener("click", () => setOpen(!isOpen()));

  // Close menu when clicking on nav links
  mobileNavLinks.forEach((link) =>
    link.addEventListener("click", () => isOpen() && setOpen(false)),
  );

  // Esc closes and hands focus back to the toggle; a click on the dimmed page closes too
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false);
      menuToggle.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (
      isOpen() &&
      !mobileNavPanel.contains(e.target) &&
      !(header && header.contains(e.target))
    )
      setOpen(false);
  });

  // Back to a wide screen: never leave the page locked
  window
    .matchMedia("(min-width: 1025px)")
    .addEventListener("change", (e) => e.matches && isOpen() && setOpen(false));
}

/**
 * 4. Scroll Reveal using IntersectionObserver
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(".scroll-reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            // Once revealed, no need to track it anymore
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    revealElements.forEach((el) => el.classList.add("revealed"));
  }
}

/**
 * 5. Interactive Timeline animation scroll-linked
 */
function initInteractiveTimeline() {
  const steps = [...document.querySelectorAll(".proc-step")];
  if (!steps.length) return;

  // A step is "done" once its node passes the reading line; the last one passed is "current"
  const update = () => {
    const line = window.innerHeight * 0.55;
    let current = -1;
    steps.forEach((step, i) => {
      if (step.querySelector(".proc-node").getBoundingClientRect().top < line)
        current = i;
    });
    steps.forEach((step, i) => {
      step.classList.toggle("done", i < current);
      step.classList.toggle("current", i === current);
    });
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    },
    { passive: true },
  );
  update();
}

/**
 * 6. Back to top button logic
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById("back-to-top");
  if (!backToTopBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/**
 * 7. Contact Form — validate, then send to the Google Apps Script web app (writes the "Thông tin liên hệ" sheet).
 *    Ticket lookup uses the same web app. Setup: docs/ticket-setup.md
 */
// Paste the web app URL (ends with /exec) after deploying the Apps Script
const SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycby4ar1UM634ISMK6lysBgHN2UI4ZNNMDWsfkZTNBEH76oV3YxVmZRK6PIRbWmg6AARw/exec";

const PHONE_REGEX = /^(0|\+?84)(3|5|7|8|9)\d{8}$/; // Vietnamese mobile: 0xxxxxxxxx or +84xxxxxxxxx
const normalizePhone = (v) => v.replace(/[\s.\-()]/g, "");

function initContactForm() {
  const form = document.getElementById("contact-form");
  const successModal = document.getElementById("success-modal");
  const closeModalBtn = document.getElementById("btn-close-modal");
  const submitBtn = document.getElementById("btn-submit-form");
  const submitError = document.getElementById("error-submit");

  if (!form || !successModal || !closeModalBtn) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const t = () => translations[getCurrentLang()];

  // Each rule returns an i18n error key, or '' when the field is valid
  const rules = {
    name: (el) => (el.value.trim() ? "" : "error-name"),
    phone: (el) => {
      const v = normalizePhone(el.value.trim());
      return !v
        ? "error-phone-empty"
        : PHONE_REGEX.test(v)
          ? ""
          : "error-phone-format";
    },
    email: (el) => {
      const v = el.value.trim();
      return !v
        ? "error-email-empty"
        : emailRegex.test(v)
          ? ""
          : "error-email-format";
    },
    consent: (el) => (el.checked ? "" : "error-consent"),
  };

  const validate = (field) => {
    const input = document.getElementById(`form-${field}`);
    const key = rules[field](input);
    input.classList.toggle("invalid", !!key);
    document.getElementById(`error-${field}`).textContent = key ? t()[key] : "";
    return !key;
  };

  Object.keys(rules).forEach((field) => {
    document
      .getElementById(`form-${field}`)
      .addEventListener(field === "consent" ? "change" : "blur", () =>
        validate(field),
      );
  });

  const openModal = () => {
    successModal.classList.add("open");
    successModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeModalBtn.focus();
  };

  // Submit Handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitError.textContent = "";

    // Validate every field so all errors show at once
    if (Object.keys(rules).map(validate).includes(false)) {
      form.querySelector(".invalid").focus();
      return;
    }

    const payload = {
      name: form.elements.name.value.trim(),
      phone: normalizePhone(form.elements.phone.value.trim()),
      email: form.elements.email.value.trim(),
      company: form.elements.company.value.trim(),
      message: form.elements.message.value.trim(),
      consent: form.elements.consent.checked,
      lang: getCurrentLang(),
      website: form.elements.website.value, // honeypot: stays empty for real visitors
    };

    const label = submitBtn.querySelector('[data-i18n="form-submit"]');
    submitBtn.disabled = true;
    label.textContent = t()["form-submit-loading"];

    try {
      if (!SHEET_API_URL) throw new Error("SHEET_API_URL is not set");
      // text/plain keeps this a "simple" request, so the browser sends no CORS preflight to Apps Script
      const res = await fetch(SHEET_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || "failed");
      form.reset();
      openModal();
    } catch {
      submitError.textContent = t()["error-submit"];
    } finally {
      submitBtn.disabled = false;
      label.textContent = t()["form-submit"];
    }
  });

  // Modal closing logic
  const closeModal = () => {
    successModal.classList.remove("open");
    successModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  closeModalBtn.addEventListener("click", closeModal);

  // Close modal when clicking outside modal-content
  successModal.addEventListener("click", (e) => {
    if (e.target === successModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && successModal.classList.contains("open")) {
      closeModal();
    }
  });
}

/**
 * 8. Nav Scroll Spy — highlight nav link when section is in view
 */
function initNavScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".desktop-nav .nav-link");

  if (sections.length === 0 || navLinks.length === 0) return;

  // Sections without their own menu item highlight the item they belong to
  const NAV_PARENT = {
    strengths: "about",
    engagement: "services",
    process: "services",
    team: "portfolio",
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = NAV_PARENT[entry.target.id] || entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${id}`,
            );
          });
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "-80px 0px -40% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * 9. Nav Hover — highlight section when hovering nav link
 */
function initNavHover() {
  const navLinks = document.querySelectorAll(".desktop-nav .nav-link");
  // Only in-page anchors (#about); links to other pages (index.html#about) have no section to highlight
  const sectionOf = (link) => {
    const href = link.getAttribute("href");
    return href.startsWith("#") ? document.querySelector(href) : null;
  };

  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      const target = sectionOf(link);
      if (target) target.classList.add("section-highlight");
    });
    link.addEventListener("mouseleave", () => {
      const target = sectionOf(link);
      if (target) target.classList.remove("section-highlight");
    });
  });
}

/**
 * 11. UI polish: scroll progress bar, card spotlight, count-up numbers
 */
function initScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function initCardSpotlight() {
  document.addEventListener(
    "pointermove",
    (e) => {
      const card =
        e.target.closest &&
        e.target.closest(
          ".glass-card, .service-item, .svc-card, .eng-card, .adv-card, .proj-card",
        );
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    },
    { passive: true },
  );
}

function initCountUp() {
  const els = document.querySelectorAll("[data-count]");
  if (
    !els.length ||
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        io.unobserve(target);
        const end = +target.dataset.count;
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / 1200, 1);
          target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => io.observe(el));
}

/**
 * 12. Hand-made touches: cursor glow, magnetic buttons, mockup tilt, live chat, staggered reveal
 */
const canHover = () => window.matchMedia("(hover: hover)").matches;
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initCursorGlow() {
  if (!canHover() || reducedMotion()) return;
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.appendChild(glow);

  let tx = 0,
    ty = 0,
    x = 0,
    y = 0;
  document.addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
      glow.classList.add("on");
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () =>
    glow.classList.remove("on"),
  );

  const follow = () => {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    glow.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(follow);
  };
  follow();
}

function initMockTilt() {
  const mock = document.querySelector(".mock");
  const hero = document.getElementById("hero");
  if (!mock || !hero || !canHover() || reducedMotion()) return;
  hero.addEventListener("pointermove", (e) => {
    const r = mock.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / r.width;
    const y = (e.clientY - (r.top + r.height / 2)) / r.height;
    mock.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
    mock.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
  });
  hero.addEventListener("pointerleave", () => {
    mock.style.setProperty("--rx", "0deg");
    mock.style.setProperty("--ry", "0deg");
  });
}

function initChatLoop() {
  const chat = document.querySelector(".mock-chat");
  const q = document.querySelector(".mock-q");
  const a = document.querySelector(".mock-a");
  if (!chat || !q || !a || reducedMotion()) return;
  chat.classList.add("chat-live");
  // Idle while off-screen or in a hidden tab, so the typing loop costs nothing
  let vis = true;
  new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(chat);
  const wait = async (ms) => {
    await new Promise((r) => setTimeout(r, ms));
    while (!vis || document.hidden) await new Promise((r) => setTimeout(r, 400));
  };

  (async function loop() {
    for (;;) {
      q.classList.remove("show");
      a.classList.remove("show", "typing");
      a.textContent = "";
      await wait(700);
      q.classList.add("show");
      await wait(800);
      a.classList.add("show", "typing");
      await wait(900);
      const text = translations[getCurrentLang()]["mock-chat-a"] || "";
      for (let i = 1; i <= text.length; i++) {
        a.textContent = text.slice(0, i);
        await wait(34);
      }
      a.classList.remove("typing");
      await wait(4500);
    }
  })();
}

function initStagger() {
  document.documentElement.classList.add("js-ready");
  document.querySelectorAll(".scroll-reveal").forEach((section) => {
    section
      .querySelectorAll(
        ".glass-card:not(.modal-content), .service-item, .svc-card, .eng-card, .adv-card, .proj-card, .about-principle, .feature-item-mini, .faq-item",
      )
      .forEach((el, i) => {
        el.classList.add("stagger");
        el.style.setProperty("--d", `${(i % 6) * 70}ms`);
      });
  });
}

function initConsoleHello() {
  console.log("%cEDI Soft", "font:800 24px sans-serif;color:#2563eb");
  console.log("Odoo ERP · AI Agent · Automation — hiendc.edi@gmail.com");
}

function initMarqueeToggle() {
  const btn = document.getElementById("marquee-toggle");
  const marquee = document.querySelector(".tech-marquee");
  if (!btn || !marquee) return;
  const label = () => {
    const t = translations[getCurrentLang()] || {};
    const paused = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute(
      "aria-label",
      (paused ? t["marquee-play"] : t["marquee-pause"]) || "",
    );
  };
  btn.addEventListener("click", () => {
    const paused = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", paused);
    marquee.classList.toggle("paused", paused);
    label();
  });
  document
    .getElementById("lang-toggle")
    ?.addEventListener("click", () => setTimeout(label));
  label();
}

/**
 * AI demo: messages appear one by one (bot replies "type" first) and the matching capability lights up.
 * Without JS or with reduced motion the full conversation stays visible.
 */
function initAiDemo() {
  const chat = document.querySelector(".ai-chat");
  const demo = document.querySelector(".ai-demo");
  if (!chat || !demo) return;
  const msgs = [...chat.querySelectorAll(".ai-msg")];
  const caps = [...document.querySelectorAll(".ai-cap")];
  const replay = document.getElementById("ai-replay");
  if (reducedMotion()) {
    replay && replay.remove();
    return;
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let run = 0;

  const play = async () => {
    const id = ++run;
    chat.classList.add("is-anim");
    msgs.forEach((m) => m.classList.remove("shown", "typing"));
    caps.forEach((c) => c.classList.remove("is-on"));
    await wait(400);
    for (let i = 0; i < msgs.length; i++) {
      if (id !== run) return;
      const m = msgs[i];
      caps.forEach((c, k) =>
        c.classList.toggle("is-on", i < 2 ? k < 2 : k >= 2),
      );
      if (m.classList.contains("ai-msg-bot")) {
        m.classList.add("shown", "typing");
        await wait(1100);
        m.classList.remove("typing");
      } else {
        m.classList.add("shown");
        await wait(700);
      }
      await wait(500);
    }
    if (id === run) caps.forEach((c) => c.classList.remove("is-on"));
  };

  let started = false;
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting) && !started) {
        started = true;
        io.disconnect();
        play();
      }
    },
    { threshold: 0.45 },
  );
  io.observe(demo);
  replay && replay.addEventListener("click", play);
}

function initProjectFilter() {
  const chips = [...document.querySelectorAll(".proj-chip")];
  const cards = [...document.querySelectorAll(".proj-card")];
  if (!chips.length) return;
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const only = chip.dataset.filter === "featured";
      chips.forEach((c) => c.setAttribute("aria-pressed", c === chip));
      cards.forEach((card) => {
        card.hidden = only && card.dataset.featured !== "true";
      });
    }),
  );
}

/** 13. Mobile float dock: one button that opens the contact shortcuts */
document.addEventListener("DOMContentLoaded", () => {
  const dock = document.querySelector(".float-dock");
  const tg = document.getElementById("dock-toggle");
  if (!dock || !tg) return;
  const set = (o) => { dock.classList.toggle("open", o); tg.setAttribute("aria-expanded", o); };
  tg.addEventListener("click", () => set(!dock.classList.contains("open")));
  document.addEventListener("click", (e) => !dock.contains(e.target) && set(false));
  window.addEventListener("scroll", () => set(false), { passive: true });
});
// Hide the dock while typing so it never covers a field or the on-screen keyboard
document.addEventListener("focusin", (e) => document.querySelector(".float-dock")?.classList.toggle("typing", e.target.matches("input,textarea,select")));
document.addEventListener("focusout", () => document.querySelector(".float-dock")?.classList.remove("typing"));

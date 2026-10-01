// Main JavaScript logic for EDI Soft Landing Page
// Requires i18n.js to be loaded first (translations, getCurrentLang, applyLanguage)

document.addEventListener('DOMContentLoaded', () => {
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
});

/**
 * 1. Theme Toggle (Dark/Light) with localStorage persistence & system preference detection
 */
function initThemeToggle() {
  const html = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const getPreferredTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const applyTheme = (theme) => html.setAttribute('data-theme', theme);

  // Apply initial theme
  applyTheme(getPreferredTheme());

  // Toggle on click — only an explicit choice is saved, so system changes still apply otherwise
  toggleBtn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  // Listen for system preference changes (only if no saved preference)
  const systemQuery = window.matchMedia('(prefers-color-scheme: light)');
  systemQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });
}

/**
 * 2. Language Toggle (Vietnamese / English)
 */
function initLangToggle() {
  const toggleBtn = document.getElementById('lang-toggle');
  if (!toggleBtn) return;

  const switchLang = (lang) => {
    applyLanguage(lang);
    const t = translations[lang];
    toggleBtn.setAttribute('aria-label', t['lang-aria'] || '');
    toggleBtn.setAttribute('title', t['lang-title'] || '');
  };

  // Apply saved language on load
  const currentLang = getCurrentLang();
  switchLang(currentLang);
  document.documentElement.classList.remove('i18n-pending');

  // Toggle on click
  toggleBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const newLang = html.getAttribute('lang') === 'vi' ? 'en' : 'vi';
    switchLang(newLang);
  });
}

/**
 * 3. Change header style on scroll
 */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Initial check
  handleScroll();
}

/**
 * 3. Mobile navigation toggle logic
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNavPanel = document.getElementById('mobile-nav-panel');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuToggle || !mobileNavPanel) return;

  const toggleMenu = () => {
    const isOpen = menuToggle.classList.toggle('open');
    mobileNavPanel.classList.toggle('open');
    
    // Accessibility updates
    menuToggle.setAttribute('aria-expanded', isOpen);
    mobileNavPanel.setAttribute('aria-hidden', !isOpen);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', toggleMenu);

  // Close menu when clicking on nav links
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menuToggle.classList.contains('open')) {
        toggleMenu();
      }
    });
  });
}

/**
 * 4. Scroll Reveal using IntersectionObserver
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Once revealed, no need to track it anymore
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    revealElements.forEach(el => el.classList.add('revealed'));
  }
}

/**
 * 5. Interactive Timeline animation scroll-linked
 */
function initInteractiveTimeline() {
  const steps = document.querySelectorAll('.timeline-step');
  if (steps.length === 0) return;

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -40% 0px', // Trigger when item is in middle area of viewport
      threshold: 0.2
    };

    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentStepNum = parseInt(entry.target.getAttribute('data-step'), 10);
          
          // Activate current step and all previous steps, deactivate subsequent steps
          steps.forEach(step => {
            const stepNum = parseInt(step.getAttribute('data-step'), 10);
            if (stepNum <= currentStepNum) {
              step.classList.add('active');
            } else {
              step.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    steps.forEach(step => timelineObserver.observe(step));
  }
}

/**
 * 6. Back to top button logic
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * 7. Contact Form — validate, then submit to Google Form
 */
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSegSaT3W1BEAazwCOSxqSdRe9sVWh6NFSd6CRXLRG-ceNP78A/formResponse';
const GOOGLE_FORM_FIELDS = {
  name: 'entry.2005620554',
  email: 'entry.1045781291',
  phone: 'entry.1166974658',
  company: 'entry.839337160',
  message: 'entry.1793144384'
};

function initContactForm() {
  const form = document.getElementById('contact-form');
  const successModal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('btn-close-modal');
  const submitBtn = document.getElementById('btn-submit-form');
  const submitError = document.getElementById('error-submit');

  if (!form || !successModal || !closeModalBtn) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(0|\+?84)(3|5|7|8|9)\d{8}$/; // Vietnamese mobile: 0xxxxxxxxx or +84xxxxxxxxx
  const normalizePhone = (v) => v.replace(/[\s.\-()]/g, '');
  const t = () => translations[getCurrentLang()];

  // Each rule returns an i18n error key, or '' when the field is valid
  const rules = {
    name: (el) => el.value.trim() ? '' : 'error-name',
    phone: (el) => {
      const v = normalizePhone(el.value.trim());
      return !v ? 'error-phone-empty' : phoneRegex.test(v) ? '' : 'error-phone-format';
    },
    email: (el) => {
      const v = el.value.trim();
      return !v ? 'error-email-empty' : emailRegex.test(v) ? '' : 'error-email-format';
    },
    consent: (el) => el.checked ? '' : 'error-consent'
  };

  const validate = (field) => {
    const input = document.getElementById(`form-${field}`);
    const key = rules[field](input);
    input.classList.toggle('invalid', !!key);
    document.getElementById(`error-${field}`).textContent = key ? t()[key] : '';
    return !key;
  };

  Object.keys(rules).forEach(field => {
    document.getElementById(`form-${field}`)
      .addEventListener(field === 'consent' ? 'change' : 'blur', () => validate(field));
  });

  const openModal = () => {
    successModal.classList.add('open');
    successModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeModalBtn.focus();
  };

  // Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitError.textContent = '';

    // Validate every field so all errors show at once
    if (Object.keys(rules).map(validate).includes(false)) {
      form.querySelector('.invalid').focus();
      return;
    }

    const data = new URLSearchParams();
    Object.entries(GOOGLE_FORM_FIELDS).forEach(([field, entry]) => {
      const value = form.elements[field].value.trim();
      data.append(entry, field === 'phone' ? normalizePhone(value) : value);
    });

    const label = submitBtn.querySelector('[data-i18n="form-submit"]');
    submitBtn.disabled = true;
    label.textContent = t()['form-submit-loading'];

    try {
      // Google Forms sends no CORS headers: the response is opaque, only network failures are detectable
      await fetch(GOOGLE_FORM_URL, { method: 'POST', mode: 'no-cors', body: data });
      form.reset();
      openModal();
    } catch {
      submitError.textContent = t()['error-submit'];
    } finally {
      submitBtn.disabled = false;
      label.textContent = t()['form-submit'];
    }
  });

  // Modal closing logic
  const closeModal = () => {
    successModal.classList.remove('open');
    successModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  closeModalBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside modal-content
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successModal.classList.contains('open')) {
      closeModal();
    }
  });
}

/**
 * 8. Nav Scroll Spy — highlight nav link when section is in view
 */
function initNavScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  // Sections without their own menu item highlight the item they belong to
  const NAV_PARENT = { strengths: 'about', ai: 'services', engagement: 'services', team: 'portfolio' };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = NAV_PARENT[entry.target.id] || entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '-80px 0px -40% 0px'
  });

  sections.forEach(section => observer.observe(section));
}

/**
 * 9. Nav Hover — highlight section when hovering nav link
 */
function initNavHover() {
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.classList.add('section-highlight');
    });
    link.addEventListener('mouseleave', () => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.classList.remove('section-highlight');
    });
  });
}

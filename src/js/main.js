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

  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // Apply initial theme
  applyTheme(getPreferredTheme());

  // Toggle on click
  toggleBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'light' ? 'dark' : 'light');
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
 * 7. Contact Form Validation & Success Modal
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successModal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('btn-close-modal');
  const submitBtn = document.getElementById('btn-submit-form');

  if (!form || !successModal || !closeModalBtn) return;

  // Validation patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(03|05|07|08|09|01[2|6|8|9])\d{8}$/; // Standard Vietnamese phone format

  // Helper to show/hide errors
  const showError = (fieldId, errorId, message) => {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(errorId);
    if (input && errorSpan) {
      input.classList.add('invalid');
      errorSpan.textContent = message;
    }
  };

  const clearError = (fieldId, errorId) => {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(errorId);
    if (input && errorSpan) {
      input.classList.remove('invalid');
      errorSpan.textContent = '';
    }
  };

  // Live validation on blur
  const nameInput = document.getElementById('form-name');
  const phoneInput = document.getElementById('form-phone');
  const emailInput = document.getElementById('form-email');

  const t = () => translations[getCurrentLang()];

  nameInput.addEventListener('blur', () => {
    if (!nameInput.value.trim()) {
      showError('form-name', 'error-name', t()['error-name']);
    } else {
      clearError('form-name', 'error-name');
    }
  });

  phoneInput.addEventListener('blur', () => {
    const val = phoneInput.value.trim();
    if (!val) {
      showError('form-phone', 'error-phone', t()['error-phone-empty']);
    } else if (!phoneRegex.test(val)) {
      showError('form-phone', 'error-phone', t()['error-phone-format']);
    } else {
      clearError('form-phone', 'error-phone');
    }
  });

  emailInput.addEventListener('blur', () => {
    const val = emailInput.value.trim();
    if (!val) {
      showError('form-email', 'error-email', t()['error-email-empty']);
    } else if (!emailRegex.test(val)) {
      showError('form-email', 'error-email', t()['error-email-format']);
    } else {
      clearError('form-email', 'error-email');
    }
  });

  // Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    const nameVal = nameInput.value.trim();
    const phoneVal = phoneInput.value.trim();
    const emailVal = emailInput.value.trim();

    const t2 = translations[getCurrentLang()];

    if (!nameVal) {
      showError('form-name', 'error-name', t2['error-name']);
      isValid = false;
    } else {
      clearError('form-name', 'error-name');
    }

    if (!phoneVal) {
      showError('form-phone', 'error-phone', t2['error-phone-empty']);
      isValid = false;
    } else if (!phoneRegex.test(phoneVal)) {
      showError('form-phone', 'error-phone', t2['error-phone-format']);
      isValid = false;
    } else {
      clearError('form-phone', 'error-phone');
    }

    if (!emailVal) {
      showError('form-email', 'error-email', t2['error-email-empty']);
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      showError('form-email', 'error-email', t2['error-email-format']);
      isValid = false;
    } else {
      clearError('form-email', 'error-email');
    }

    if (!isValid) {
      // Focus on first invalid input
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Simulate sending data
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span data-i18n="form-submit-loading">' + translations[getCurrentLang()]['form-submit-loading'] + '</span> <span class="spinner"></span>';

    // Add inline spinner CSS dynamically if needed (already styled button transition generally)
    setTimeout(() => {
      // Restore Button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      // Show Success Modal
      successModal.classList.add('open');
      successModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Reset form
      form.reset();
    }, 1500);
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

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
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

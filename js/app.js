/* ==========================================================================
   MAIN APPLICATION & UI LOGIC
   Theme switcher, mobile drawer navigation, smooth scroll spy,
   animated stat counters, and form handlers.
   ========================================================================== */

// --- FAQ Accordion Handler ---
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      faqItems.forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
        if (window.soundEngine) window.soundEngine.playClick();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initSmoothScrollSpy();
  initAcademicTabs();
  initStatCounters();
  initContactForm();
  initFaqAccordion();
});

// --- Theme Switcher (Dark / Light Mode) ---
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem('apex_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('apex_theme', newTheme);
    updateThemeIcon(newTheme);
    if (window.soundEngine) window.soundEngine.playClick();
  });

  function updateThemeIcon(theme) {
    toggleBtn.innerHTML = (theme === 'dark') ? 
      '<i class="fa-solid fa-sun"></i>' : 
      '<i class="fa-solid fa-moon"></i>';
  }
}

// --- Mobile Navigation Menu ---
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');

  if (!menuBtn || !mainNav) return;

  menuBtn.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    const isOpen = mainNav.classList.contains('open');
    menuBtn.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    if (window.soundEngine) window.soundEngine.playClick();
  });

  // Close menu when clicking nav link
  document.querySelectorAll('#main-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });
}

// --- Smooth Scroll & Active Nav Spy ---
function initSmoothScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#main-nav .nav-link');

  window.addEventListener('scroll', () => {
    let scrollY = window.scrollY;

    sections.forEach(sec => {
      const sectionHeight = sec.offsetHeight;
      const sectionTop = sec.offsetTop - 100;
      const sectionId = sec.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

// --- Academic Program Tabs ---
function initAcademicTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      const pane = document.getElementById(`tab-${targetTab}`);
      if (pane) pane.classList.add('active');

      if (window.soundEngine) window.soundEngine.playClick();
    });
  });
}

// --- Animated Counter for Hero Stats ---
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  function runCounters() {
    if (animated) return;
    const heroSec = document.getElementById('hero');
    if (!heroSec) return;

    const rect = heroSec.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      animated = true;

      statNumbers.forEach(numEl => {
        const target = parseFloat(numEl.getAttribute('data-target'));
        let current = 0;
        const isDecimal = target % 1 !== 0;
        const increment = target / 50;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          numEl.textContent = isDecimal ? `${current.toFixed(1)}%` : `${Math.floor(current)}+`;
        }, 30);
      });
    }
  }

  window.addEventListener('scroll', runCounters);
  runCounters();
}

// --- Admissions & Contact Form Handler ---
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('form-toast');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();

    if (!name || !email) return;

    if (toast) {
      toast.className = 'form-toast success';
      toast.textContent = `Thank you, ${name}! Your inquiry has been submitted. Our admissions team will reach out to ${email} within 24 hours.`;
      toast.classList.remove('hidden');

      if (window.soundEngine) window.soundEngine.playCollect();

      form.reset();

      setTimeout(() => {
        toast.classList.add('hidden');
      }, 5000);
    }
  });
}

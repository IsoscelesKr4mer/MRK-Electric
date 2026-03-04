/* MRK Electric — script.js */

(() => {
  'use strict';

  const header   = document.getElementById('site-header');
  const toggle   = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  /* ── Sticky header ───────────────────────────────────── */
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 48);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile nav toggle ───────────────────────────────── */
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  const closeNav = () => {
    navLinks.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
  };

  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));

  document.addEventListener('click', e => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !toggle.contains(e.target)) {
      closeNav();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) closeNav();
  });

  /* ── Smooth scroll (offset for fixed header) ─────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeNav();
      const offset = header.offsetHeight + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Active nav link on scroll ───────────────────────── */
  const sections = document.querySelectorAll('main section[id]');
  const navItems = navLinks.querySelectorAll('a[href^="#"]');

  const setActiveLink = () => {
    const scrollY = window.scrollY + header.offsetHeight + 60;
    let current = '';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop) current = sec.id;
    });
    navItems.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ── Scroll-triggered entrance animations ────────────── */
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
  );

  document.querySelectorAll('.animate-in').forEach(el => {
    if (!el.closest('.hero')) observer.observe(el);
  });

  /* Hero elements animate in on load with cascading delay */
  window.addEventListener('load', () => {
    document.querySelectorAll('.hero .animate-in').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 120 + i * 130);
    });
  });

  /* ── Form handling ───────────────────────────────────── */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn  = form.querySelector('button[type="submit"]');
      const note = form.querySelector('.form-note');
      const data = new FormData(form);

      btn.disabled    = true;
      btn.textContent = 'Sending…';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          btn.textContent = '✓ Message Sent!';
          btn.style.background = '#22c55e';
          btn.style.color = '#fff';
          note.textContent = 'Thanks! We\'ll be in touch within a few hours.';
          note.style.color = '#22c55e';
          form.querySelectorAll('input, select, textarea').forEach(f => f.value = '');
          setTimeout(() => {
            btn.disabled = false;
            btn.textContent = 'Send Request';
            btn.style.background = '';
            btn.style.color = '';
            note.textContent = 'We typically respond within a few hours during business hours.';
            note.style.color = '';
          }, 5000);
        } else {
          throw new Error('Server error');
        }
      } catch {
        btn.disabled    = false;
        btn.textContent = 'Send Request';
        note.textContent = 'Something went wrong. Please call or email us directly.';
        note.style.color = '#ef4444';
        setTimeout(() => {
          note.textContent = 'We typically respond within a few hours during business hours.';
          note.style.color = '';
        }, 5000);
      }
    });
  }

  /* ── tel: click tracking (optional analytics hook) ───── */
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'phone_call_click', { event_category: 'engagement' });
      }
    });
  });

})();

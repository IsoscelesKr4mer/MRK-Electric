/* MRK Electric — script.js  (2026 Redesign) */

(() => {
  'use strict';

  const header     = document.getElementById('site-header');
  const toggle     = document.getElementById('nav-toggle');
  const navLinks   = document.getElementById('nav-links');
  const overlay    = document.getElementById('mobile-overlay');

  /* ─────────────────────────────────────────────────────────
     Sticky header
  ───────────────────────────────────────────────────────── */
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─────────────────────────────────────────────────────────
     Mobile nav
  ───────────────────────────────────────────────────────── */
  const openNav = () => {
    navLinks.classList.add('open');
    overlay.classList.add('visible');
    overlay.removeAttribute('aria-hidden');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    navLinks.classList.remove('open');
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeNav() : openNav();
  });
  overlay.addEventListener('click', closeNav);
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) closeNav();
  });

  /* ─────────────────────────────────────────────────────────
     Smooth scroll
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeNav();
      const offset = header.offsetHeight + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ─────────────────────────────────────────────────────────
     Active nav link
  ───────────────────────────────────────────────────────── */
  const sections = document.querySelectorAll('main section[id]');
  const navItems = navLinks.querySelectorAll('a[href^="#"]');

  const setActiveLink = () => {
    const scrollY = window.scrollY + header.offsetHeight + 80;
    let current = '';
    sections.forEach(sec => { if (scrollY >= sec.offsetTop) current = sec.id; });
    navItems.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ─────────────────────────────────────────────────────────
     Hero animated mesh canvas
  ───────────────────────────────────────────────────────── */
  const canvas = document.getElementById('mesh-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, pts, raf;

    const COLORS = [
      'rgba(142,200,232,',  // sky
      'rgba(226,192,68,',   // gold
      'rgba(27,42,74,',     // navy
    ];

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      buildPoints();
    };

    const buildPoints = () => {
      pts = [];
      const count = Math.floor(W / 180);
      for (let i = 0; i < count; i++) {
        const ci = Math.floor(Math.random() * COLORS.length);
        pts.push({
          x:  Math.random() * W,
          y:  Math.random() * H,
          vx: (Math.random() - .5) * 0.25,
          vy: (Math.random() - .5) * 0.25,
          r:  Math.random() * 260 + 140,
          a:  Math.random() * 0.07 + 0.03,
          c:  COLORS[ci],
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `${p.c}${p.a})`);
        g.addColorStop(1, `${p.c}0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -p.r) p.x = W + p.r;
        if (p.x > W + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = H + p.r;
        if (p.y > H + p.r) p.y = -p.r;
      });
      raf = requestAnimationFrame(draw);
    };

    // Only run when hero is in view
    const heroObs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf) draw();
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
    heroObs.observe(canvas.closest('.hero'));

    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      raf = null;
      resize();
      draw();
    }, { passive: true });
    resize();
    draw();
  }

  /* ─────────────────────────────────────────────────────────
     Hero entrance animations
  ───────────────────────────────────────────────────────── */
  window.addEventListener('load', () => {
    document.querySelectorAll('.hero .animate-hero').forEach(el => {
      el.classList.add('visible');
    });
  });

  /* ─────────────────────────────────────────────────────────
     Scroll-triggered entrance animations (Intersection Observer)
  ───────────────────────────────────────────────────────── */
  const animObs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.10, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.animate-in').forEach(el => {
    if (!el.closest('.hero')) animObs.observe(el);
  });

  /* ─────────────────────────────────────────────────────────
     Animated stat counters
  ───────────────────────────────────────────────────────── */
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el, target, duration = 1400) => {
    const start = performance.now();
    const step = now => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };

  const counterObs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const numEl = entry.target.querySelector('.stat-num');
          const target = parseInt(numEl.dataset.target, 10);
          animateCounter(numEl, target);
          counterObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('.stat-card').forEach(card => counterObs.observe(card));

  /* ─────────────────────────────────────────────────────────
     3D card tilt effect
  ───────────────────────────────────────────────────────── */
  const TILT_MAX = 8; // degrees

  document.querySelectorAll('[data-tilt]').forEach(card => {
    let raf;

    const onMove = e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const px = (e.clientX - cx) / (rect.width  / 2);
        const py = (e.clientY - cy) / (rect.height / 2);
        const rx = -py * TILT_MAX;
        const ry =  px * TILT_MAX;
        card.style.transform =
          `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        card.style.transition = 'transform 0.05s linear';
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(raf);
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.32s';
    };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  });

  /* ─────────────────────────────────────────────────────────
     Magnetic button effect
  ───────────────────────────────────────────────────────── */
  const MAGNET_DIST = 60;
  const MAGNET_STRENGTH = 0.35;

  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    let raf;

    const onMove = e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAGNET_DIST) {
          const mx = dx * MAGNET_STRENGTH;
          const my = dy * MAGNET_STRENGTH;
          btn.style.transform = `translate(${mx}px, ${my}px) scale(1.04)`;
          btn.style.transition = 'transform 0.15s ease-out';
        } else {
          btn.style.transform = '';
          btn.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
        }
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(raf);
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    btn.addEventListener('mouseleave', onLeave);
  });

  /* ─────────────────────────────────────────────────────────
     Custom cursor
  ───────────────────────────────────────────────────────── */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  if (dot && ring && window.matchMedia('(pointer: fine)').matches) {
    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left  = `${mx}px`;
      dot.style.top   = `${my}px`;
    }, { passive: true });

    const lerpRing = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.left = `${rx}px`;
      ring.style.top  = `${ry}px`;
      requestAnimationFrame(lerpRing);
    };
    lerpRing();

    const interactables = 'a, button, [data-tilt], .magnetic-btn, input, select, textarea';
    document.querySelectorAll(interactables).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });
  }

  /* ─────────────────────────────────────────────────────────
     Form handling
  ───────────────────────────────────────────────────────── */
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
          method:  'POST',
          body:    data,
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          btn.textContent = '✓ Message Sent!';
          btn.style.background = 'linear-gradient(135deg,#4ade80,#16a34a)';
          btn.style.color = '#fff';
          note.textContent = 'Thanks! We\'ll be in touch within a few hours.';
          note.style.color = '#4ade80';
          form.querySelectorAll('input, select, textarea').forEach(f => { f.value = ''; });
          setTimeout(() => {
            btn.disabled        = false;
            btn.textContent     = 'Send Request';
            btn.style.background = '';
            btn.style.color      = '';
            note.textContent    = 'We typically respond within a few hours during business hours.';
            note.style.color    = '';
          }, 5000);
        } else {
          throw new Error('Server error');
        }
      } catch {
        btn.disabled    = false;
        btn.textContent = 'Send Request';
        note.textContent = 'Something went wrong. Please call or email us directly.';
        note.style.color = '#f87171';
        setTimeout(() => {
          note.textContent = 'We typically respond within a few hours during business hours.';
          note.style.color = '';
        }, 5000);
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     tel: click analytics
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'phone_call_click', { event_category: 'engagement' });
      }
    });
  });

})();

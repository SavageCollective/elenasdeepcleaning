/* Minimal JS: menu, smooth scrolling with sticky header offset, small UX helpers */
(() => {
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const menuBtn = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-menu]');
  const hero = document.querySelector('#top');

  // Desktop breakpoint matches CSS (@media (min-width: 860px))
  const desktopMQ = window.matchMedia('(min-width: 860px)');
  const isMobileMenu = () => !desktopMQ.matches;

  // Preserve the original label so desktop keeps a normal “home” affordance
  const menuBtnHomeLabel = menuBtn ? menuBtn.getAttribute('aria-label') : '';
  const openMenuLabel = document.documentElement.lang === 'es' ? 'Abrir menú' : 'Open menu';

  // Year
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------------------------------------------------------------------------
  // Above-the-fold declutter: hide sticky CTAs while the hero is in view
  // ---------------------------------------------------------------------------
  const setTopState = (isTop) => {
    body.classList.toggle('is-top', Boolean(isTop));
  };

  // Default state on load
  setTopState(window.scrollY < 12);

  if (hero && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setTopState(entry.isIntersecting && entry.intersectionRatio > 0.55);
      },
      { threshold: [0, 0.55, 1] }
    );

    heroObserver.observe(hero);
  } else {
    window.addEventListener(
      'scroll',
      () => {
        setTopState(window.scrollY < 12);
      },
      { passive: true }
    );
  }

  // ---------------------------------------------------------------------------
  // Mobile menu
  // ---------------------------------------------------------------------------
  const closeMenu = () => {
    body.classList.remove('menu-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  };

  if (menuBtn && nav) {
    // Treat the header logo as the mobile menu button.
    // On desktop, it should behave like a normal “home” link.
    const syncMenuBtnA11y = () => {
      if (!menuBtn) return;

      if (isMobileMenu()) {
        menuBtn.setAttribute('aria-label', openMenuLabel);
        menuBtn.setAttribute('aria-haspopup', 'menu');
        // aria-controls is already in the markup; keep aria-expanded in sync
        menuBtn.setAttribute('aria-expanded', String(body.classList.contains('menu-open')));
      } else {
        if (menuBtnHomeLabel) menuBtn.setAttribute('aria-label', menuBtnHomeLabel);
        menuBtn.removeAttribute('aria-haspopup');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    };

    syncMenuBtnA11y();
    // Re-sync on resize/orientation change
    window.addEventListener('resize', syncMenuBtnA11y, { passive: true });

    menuBtn.addEventListener('click', (e) => {
      // Desktop: let the logo behave like a normal link to the top.
      if (!isMobileMenu()) return;

      // Mobile: open/close the menu, and prevent jumping to #top.
      e.preventDefault();
      const isOpen = body.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when clicking a nav link
    nav.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.tagName === 'A') closeMenu();
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Close when clicking outside
    document.addEventListener(
      'click',
      (e) => {
        if (!body.classList.contains('menu-open')) return;
        const withinHeader = header && header.contains(e.target);
        if (!withinHeader) closeMenu();
      },
      true
    );
  }

  // ---------------------------------------------------------------------------
  // Smooth scroll offset for sticky header
  // ---------------------------------------------------------------------------
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

  const getHeaderOffset = () => {
    if (!header) return 0;
    return header.getBoundingClientRect().height + 8;
  };

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    // Skip smooth-scroll for the mobile menu toggle (header logo)
    if (a.hasAttribute('data-menu-button')) return;

    a.addEventListener('click', (e) => {
      if (a.classList.contains('skip-link')) return;

      const href = a.getAttribute('href');
      if (!href || href === '#') return;

      const el = document.querySelector(href);
      if (!el) return;

      // Let default behavior happen if user is opening in new tab
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();
      const top = window.scrollY + el.getBoundingClientRect().top - getHeaderOffset();

      window.scrollTo({ top, behavior: scrollBehavior });
      history.pushState(null, '', href);
      closeMenu();
    });
  });

  // ---------------------------------------------------------------------------
  // aria-current for active section in the nav (scroll spy)
  // ---------------------------------------------------------------------------
  const navLinks = Array.from(document.querySelectorAll('#primary-nav a[href^="#"]'))
    .map((a) => ({
      el: a,
      hash: a.getAttribute('href')
    }))
    .filter((l) => l.hash && l.hash.length > 1);

  const sections = navLinks
    .map((l) => ({ ...l, target: document.querySelector(l.hash) }))
    .filter((l) => l.target && l.target.id);

  const setCurrent = (id) => {
    navLinks.forEach((l) => {
      if (l.hash === `#${id}`) l.el.setAttribute('aria-current', 'true');
      else l.el.removeAttribute('aria-current');
    });
  };

  const syncFromHash = () => {
    const id = (window.location.hash || '').replace('#', '');
    if (id) setCurrent(id);
  };

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setCurrent(entry.target.id);
        });
      },
      {
        // Consider a section active when it crosses the upper middle of the viewport
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0.01
      }
    );

    sections.forEach((s) => sectionObserver.observe(s.target));
  } else {
    window.addEventListener(
      'scroll',
      () => {
        const fromTop = window.scrollY + getHeaderOffset() + window.innerHeight * 0.25;
        for (const s of sections) {
          const rect = s.target.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const bottom = top + rect.height;
          if (fromTop >= top && fromTop < bottom) {
            setCurrent(s.target.id);
            break;
          }
        }
      },
      { passive: true }
    );
  }

  window.addEventListener('popstate', syncFromHash);
  syncFromHash();

})();

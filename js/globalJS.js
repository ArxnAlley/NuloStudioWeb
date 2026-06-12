/* ============================================================
   NULO STUDIO — GLOBAL JS v2
   Loaded by all pages. Do NOT add page-specific logic here.
   ============================================================
   01  STAR + SHOOTING STAR SYSTEM
   02  NAV SCROLL GLASSMORPHISM
   03  MOBILE NAV DRAWER
   04  NAV DROPDOWN (desktop hover / touch)
   05  SCROLL REVEAL (IntersectionObserver)
   06  FAQ ACCORDION
   07  STICKY CTA VISIBILITY
   08  ASTEROID SPAWNER
   09  LOADING SCREEN (N tracer — index.html only)
   10  ACTIVE NAV LINK
   11  SMOOTH EXTERNAL PHONE FORMAT
   12  COUNT-UP STATS (IntersectionObserver + rAF)
   ============================================================ */


/* ============================================================
   01  STAR + SHOOTING STAR SYSTEM
   ============================================================ */

(function initStars() {

  var canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var W = window.innerWidth;
  var H = window.innerHeight;

  /* Scale canvas bitmap to devicePixelRatio so stars are crisp on Retina/HiDPI.
     Setting canvas.width resets the transform, so ctx.scale is safe to call after. */
  function sizeCanvas() {
    var dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.scale(dpr, dpr);
  }

  sizeCanvas();

  var STAR_COUNT = 220;
  var stars = [];

  function makestar() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.4 + 0.2,
      alpha: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.85 ? 'rgba(126,184,240,' : 'rgba(255,255,255,'
    };
  }

  function initStarField() {
    stars = [];
    for (var i = 0; i < STAR_COUNT; i++) stars.push(makestar());
  }

  initStarField();

  var shooters = [];

  function spawnShooter() {
    shooters.push({
      x:     Math.random() * W * 0.7,
      y:     Math.random() * H * 0.3,
      len:   Math.random() * 120 + 60,
      speed: Math.random() * 6 + 4,
      alpha: 1,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3
    });
  }

  setInterval(spawnShooter, 4800);

  var tick    = 0;
  var scrollY = 0;

  window.addEventListener('scroll', function () { scrollY = window.scrollY; }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    tick += 0.012;

    var pOffset = scrollY * 0.08;

    stars.forEach(function (s) {
      var t = s.alpha * (0.7 + 0.3 * Math.sin(tick * s.speed * 80 + s.phase));
      ctx.beginPath();
      /* Use positive-safe modulo so stars wrap correctly when scrolled (JS % can return negative) */
      var sy = ((s.y - pOffset * (s.r / 1.6)) % H + H) % H;
      ctx.arc(s.x, sy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color + t + ')';
      ctx.fill();
    });

    for (var i = shooters.length - 1; i >= 0; i--) {
      var sh   = shooters[i];
      var tx   = sh.x - Math.cos(sh.angle) * sh.len;
      var ty   = sh.y - Math.sin(sh.angle) * sh.len;
      var grad = ctx.createLinearGradient(tx, ty, sh.x, sh.y);
      grad.addColorStop(0,   'rgba(255,255,255,0)');
      grad.addColorStop(0.7, 'rgba(200,210,255,' + (sh.alpha * 0.4) + ')');
      grad.addColorStop(1,   'rgba(255,255,255,' + sh.alpha + ')');
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(sh.x, sh.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.2;
      ctx.stroke();
      sh.x     += Math.cos(sh.angle) * sh.speed;
      sh.y     += Math.sin(sh.angle) * sh.speed;
      sh.alpha -= 0.014;
      if (sh.alpha <= 0 || sh.x > W || sh.y > H) shooters.splice(i, 1);
    }

    requestAnimationFrame(draw);
  }

  draw();

  /* Debounced resize: prevents thrashing during window drag, regenerates star positions */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      sizeCanvas();
      initStarField();
    }, 150);
  });

}());


/* ============================================================
   02  NAV SCROLL GLASSMORPHISM
   ============================================================ */

(function initNavScroll() {

  var header = document.getElementById('siteHeader');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 8) {
      header.classList.add('isScrolled');
    } else {
      header.classList.remove('isScrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

}());


/* ============================================================
   03  MOBILE NAV DRAWER
   ============================================================ */

(function initMobileNav() {

  var hamburger = document.getElementById('navHamburger');
  var drawer    = document.getElementById('navMobileDrawer');
  var body      = document.body;

  if (!hamburger || !drawer) return;

  function openMenu() {
    hamburger.classList.add('isOpen');
    drawer.classList.add('isOpen');
    body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    hamburger.classList.remove('isOpen');
    drawer.classList.remove('isOpen');
    body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', function () {
    if (hamburger.classList.contains('isOpen')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  /* Close on drawer link click */
  drawer.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Close on outside click */
  document.addEventListener('click', function (e) {
    if (
      drawer.classList.contains('isOpen') &&
      !drawer.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

}());


/* ============================================================
   04  NAV DROPDOWN (desktop hover / touch toggle)
   ============================================================ */

(function initNavDropdown() {

  var parents = document.querySelectorAll('.navDropParent');
  if (!parents.length) return;

  parents.forEach(function (parent) {
    var link = parent.querySelector('a');
    var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* Touch / click fallback */
    link && link.addEventListener('click', function (e) {
      if (canHover && window.innerWidth > 768) {
        return;
      }

      if (parent.classList.contains('isOpen')) {
        parent.classList.remove('isOpen');
      } else {
        /* Close others */
        parents.forEach(function (p) { p.classList.remove('isOpen'); });
        parent.classList.add('isOpen');
        e.preventDefault();
      }
    });

    /* Close when clicking outside */
    document.addEventListener('click', function (e) {
      if (!parent.contains(e.target)) {
        parent.classList.remove('isOpen');
      }
    });
  });

}());


/* ============================================================
   05  SCROLL REVEAL (IntersectionObserver)
   ============================================================ */

(function initScrollReveal() {

  var targets = document.querySelectorAll(
    '.revealUp, .revealFade, .revealLeft, .revealRight, .revealScale'
  );

  if (!targets.length) return;

  /* Fallback for older browsers */
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('isVisible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('isVisible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(function (el) { observer.observe(el); });

}());


/* ============================================================
   06  FAQ ACCORDION
   ============================================================ */

(function initFaqAccordion() {

  var items = document.querySelectorAll('.faqItem');
  if (!items.length) return;

  items.forEach(function (item) {
    var btn = item.querySelector('.faqQuestion');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('isActive');

      /* Close all */
      items.forEach(function (i) { i.classList.remove('isActive'); });

      /* Toggle clicked */
      if (!isOpen) item.classList.add('isActive');
    });
  });

}());


/* ============================================================
   07  STICKY CTA VISIBILITY
   ============================================================ */

(function initStickyCta() {

  var cta = document.querySelector('.stickyCta');
  if (!cta) return;

  var threshold = window.innerHeight * 0.6;

  function onScroll() {
    if (window.scrollY > threshold) {
      cta.classList.add('isVisible');
    } else {
      cta.classList.remove('isVisible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

}());


/* ============================================================
   08  ASTEROID SPAWNER
   ============================================================ */

(function initAsteroids() {

  var layer = document.querySelector('.asteroidLayer');
  if (!layer) return;

  function spawn() {
    var el = document.createElement('div');
    el.className = 'asteroid';
    el.style.top  = (Math.random() * 100) + 'vh';
    el.style.left = '100vw';
    el.style.animationDuration = (6 + Math.random() * 6) + 's';
    layer.appendChild(el);
    setTimeout(function () { el.remove(); }, 12000);
  }

  setInterval(spawn, 3200);

}());


/* ============================================================
   09  LOADING SCREEN — N path tracer (index.html only)
   ============================================================ */

(function initLoader() {

  var screen = document.getElementById('loaderScreen');
  if (!screen) return;

  /* Skip on repeat visits within the same session */
  if (sessionStorage.getItem('nulo_intro_seen')) {
    screen.style.display = 'none';
    document.body.classList.add('siteReady');
    return;
  }

  var path = document.getElementById('loaderNPath');
  var wrap = document.getElementById('loaderNWrap');

  if (!path || !wrap) {
    screen.classList.add('isDone');
    document.body.classList.add('siteReady');
    return;
  }

  /* Activate screen (starts wordmark + progress bar via CSS) */
  screen.classList.add('isActive');

  /* Get path length for dasharray animation */
  var length = path.getTotalLength();

  /* Set up stroke-dasharray */
  path.style.strokeDasharray  = length;
  path.style.strokeDashoffset = length;

  /* Animate the stroke */
  var startTime = null;
  var duration  = 1800; /* ms to trace the N */

  function animateStroke(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    /* ease-in-out cubic */
    var eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    path.style.strokeDashoffset = length * (1 - eased);

    if (progress < 1) {
      requestAnimationFrame(animateStroke);
    } else {
      /* Trace complete — snap to full logo */
      wrap.classList.add('isComplete');

      /* Hide loader after brief pause */
      setTimeout(function () {
        screen.classList.add('isDone');
        document.body.classList.add('siteReady');
        sessionStorage.setItem('nulo_intro_seen', '1');
      }, 700);
    }
  }

  /* Short delay before starting trace (let the screen settle) */
  setTimeout(function () {
    requestAnimationFrame(animateStroke);
  }, 400);

}());


/* ============================================================
   10  ACTIVE NAV LINK
   ============================================================ */

(function initActiveNav() {

  var path  = window.location.pathname;
  var links = document.querySelectorAll('.navLinks a, .navMobileLink');

  links.forEach(function (link) {
    var href = link.getAttribute('href') || '';
    /* Match filename or root */
    var linkPath = href.split('/').pop() || 'index.html';
    var pagePath = path.split('/').pop() || 'index.html';
    if (linkPath === pagePath) {
      link.classList.add('isActive');
    }
  });

}());


/* ============================================================
   11  INLINE FORM FEEDBACK (newsletter / mini forms)
   ============================================================ */

(function initInlineForms() {

  document.querySelectorAll('.inlineForm').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailInput = form.querySelector('input[type="email"]');
      var btn        = form.querySelector('button[type="submit"], .btnPrimary');
      var feedback   = form.querySelector('.formFeedback');

      if (!emailInput || !emailInput.value.trim()) {
        emailInput && emailInput.classList.add('hasError');
        return;
      }

      emailInput.classList.remove('hasError');

      /* Show loading state */
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }

      fetch(form.action || 'https://formspree.io/f/xnjgwqae', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.value,
          _subject: 'Newsletter Signup — Nulo Studio'
        })
      })
      .then(function (res) {
        if (res.ok) {
          if (feedback) {
            feedback.textContent = 'You\'re in. Check your inbox.';
            feedback.style.color = 'var(--clrSuccess)';
            feedback.style.opacity = '1';
          }
          form.reset();
        } else {
          throw new Error('Server error');
        }
      })
      .catch(function () {
        if (feedback) {
          feedback.textContent = 'Something went wrong. Try again.';
          feedback.style.color = 'var(--clrError)';
          feedback.style.opacity = '1';
        }
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Subscribe';
        }
      });
    });
  });

}());


/* ============================================================
   12  COUNT-UP STATS (IntersectionObserver + rAF)
   Animates any element with [data-target] from 0 to its target
   value once it scrolls into view. Reusable: add data-target
   (required), plus optional data-decimals, data-prefix, and
   data-suffix attributes — no JS changes needed for new counters.
   ============================================================ */

(function initCountUp() {

  var els = document.querySelectorAll('[data-target]');
  if (!els.length) return;

  var DURATION = 1800; /* ms */

  function animate(el) {
    var target   = parseFloat(el.getAttribute('data-target')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
    var prefix   = el.getAttribute('data-prefix') || '';
    var suffix   = el.getAttribute('data-suffix') || '';
    var startTime;

    function render(value) {
      el.textContent = prefix + value.toFixed(decimals) + suffix;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / DURATION, 1);
      var eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */

      render(target * eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        render(target);
      }
    }

    requestAnimationFrame(step);
  }

  /* Fallback for older browsers — show final values immediately */
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) {
      var target   = parseFloat(el.getAttribute('data-target')) || 0;
      var decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
      el.textContent = (el.getAttribute('data-prefix') || '') + target.toFixed(decimals) + (el.getAttribute('data-suffix') || '');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.4
  });

  els.forEach(function (el) { observer.observe(el); });

}());

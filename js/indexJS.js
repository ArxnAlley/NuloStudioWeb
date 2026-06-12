/* ============================================================
   NULO STUDIO — INDEX.JS
   Homepage-specific JS.
   Loading screen is handled in globalJS.js (section 09).
   ============================================================ */


/* ============================================================
   HERO ENTRANCE — animate hero elements after loader clears
   ============================================================ */

(function initHeroEntrance() {

  function revealHero() {
    var heroEls = document.querySelectorAll('.heroSection .revealFade');
    heroEls.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('isVisible');
      }, i * 140);
    });
  }

  var loader = document.getElementById('loaderScreen');
  if (!loader || sessionStorage.getItem('nulo_intro_seen')) {
    setTimeout(revealHero, 200);
    return;
  }

  /* Watch for loader dismissal then reveal hero */
  var observer = new MutationObserver(function () {
    if (loader.classList.contains('isDone')) {
      observer.disconnect();
      setTimeout(revealHero, 120);
    }
  });

  observer.observe(loader, { attributes: true, attributeFilter: ['class'] });

}());


/* ============================================================
   CTA TOUCH FALLBACK
   ============================================================ */

(function initHeroCtaTouchFallback() {

  var touchTargets = document.querySelectorAll('.solidCta, .ghostCta');

  touchTargets.forEach(function (el) {

    el.addEventListener('touchstart', function () {

      el.classList.add('isPressed');

    }, { passive: true });

    el.addEventListener('touchend', function () {

      el.classList.remove('isPressed');

    });

    el.addEventListener('touchcancel', function () {

      el.classList.remove('isPressed');

    });

  });

}());


/* ============================================================
   SECTOR TEASER — neighbor dim on hover
   ============================================================ */

(function initSectorHover() {

  var items = document.querySelectorAll('.sectorTeaserItem');
  if (!items.length) return;

  items.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      items.forEach(function (i) {
        if (i !== item) i.style.opacity = '0.5';
      });
    });
    item.addEventListener('mouseleave', function () {
      items.forEach(function (i) { i.style.opacity = ''; });
    });
  });

}());


/* ============================================================
   HOW IT WORKS — step number glow on enter
   ============================================================ */

(function initStepGlow() {

  if (!('IntersectionObserver' in window)) return;

  var steps = document.querySelectorAll('.howItWorksStep');
  if (!steps.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var n = entry.target.querySelector('.howStepNum');
        if (n) { n.style.opacity = '1'; n.style.color = 'var(--clrAccent)'; }
      }
    });
  }, { threshold: 0.4 });

  steps.forEach(function (s) { io.observe(s); });

}());


/* ============================================================
   INDUSTRIES SLIDER
   Adapted from V1 initIndustrySlider — same interaction model,
   updated element IDs and industry nav support.
   ============================================================ */

(function initIndustriesSlider() {

  var slides         = document.querySelectorAll('.industriesSlide');
  var slidesWrap     = document.getElementById('industriesSlides');
  var track          = document.getElementById('industriesTrack');
  var arrowLeft      = document.getElementById('indArrowLeft');
  var arrowRight     = document.getElementById('indArrowRight');
  var dots           = document.querySelectorAll('.industriesDot');
  var navBtns        = document.querySelectorAll('.industryNavBtn');
  var readoutName    = document.getElementById('indReadoutName');
  var readoutIndex   = document.getElementById('indReadoutIndex');
  var tooltip        = document.getElementById('industryTooltip');
  var tooltipImg     = document.getElementById('industryTooltipImg');

  if (!slidesWrap || !slides.length) return;

  /* Mobile renders all cards stacked vertically (CSS) — slider disabled */
  var mqMobile = window.matchMedia('(max-width: 768px)');

  var TOTAL        = slides.length;
  var currentIndex = 0;

  var industryNames = [
    'Home Services',
    'Retail',
    'Food & Beverage',
    'Beauty & Wellness',
    'Health & Fitness',
    'Industrial Services',
    'Professional Services'
  ];

  /* ── Layout helpers ── */

  function slideW() {
    return slides[0] ? slides[0].offsetWidth : 360;
  }

  function gapPx() {
    return parseInt(window.getComputedStyle(slidesWrap).gap) || 32;
  }

  function calcOffset(index) {
    var trackW  = track.offsetWidth;
    var sw      = slideW();
    var g       = gapPx();
    var center  = (trackW / 2) - (sw / 2);
    return -(index * (sw + g)) + center;
  }

  /* ── Go to slide ── */

  function goTo(index, animate) {
    if (index < 0)      index = TOTAL - 1;
    if (index >= TOTAL) index = 0;

    currentIndex = index;

    if (mqMobile.matches) {
      slidesWrap.style.transition = '';
      slidesWrap.style.transform  = '';
      updateStates();
      return;
    }

    if (animate === false) {
      slidesWrap.style.transition = 'none';
    } else {
      slidesWrap.style.transition = 'transform 0.65s cubic-bezier(0.4,0,0.2,1)';
    }

    slidesWrap.style.transform = 'translateX(' + calcOffset(currentIndex) + 'px)';
    updateStates();

    if (animate === false) {
      requestAnimationFrame(function () {
        slidesWrap.style.transition = '';
      });
    }
  }

  /* ── Update active / adjacent classes and UI ── */

  function updateStates() {
    for (var i = 0; i < slides.length; i++) {
      slides[i].classList.remove('isActive', 'isAdjacent');
      if (i === currentIndex) {
        slides[i].classList.add('isActive');
      } else if (Math.abs(i - currentIndex) === 1) {
        slides[i].classList.add('isAdjacent');
      }
    }

    /* Pagination dots */
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.toggle('isActive', d === currentIndex);
      dots[d].setAttribute('aria-selected', d === currentIndex ? 'true' : 'false');
    }

    /* Industry nav buttons */
    for (var n = 0; n < navBtns.length; n++) {
      navBtns[n].classList.toggle('isActive', n === currentIndex);
    }

    /* Data readout */
    if (readoutName)  readoutName.textContent  = industryNames[currentIndex] || '';
    if (readoutIndex) readoutIndex.textContent =
      String(currentIndex + 1).padStart(2, '0') + ' / ' +
      String(TOTAL).padStart(2, '0');
  }

  /* ── Initialise ── */

  goTo(0, false);

  /* ── Arrow buttons ── */

  if (arrowLeft)  arrowLeft.addEventListener('click',  function () { goTo(currentIndex - 1, true); });
  if (arrowRight) arrowRight.addEventListener('click', function () { goTo(currentIndex + 1, true); });

  /* ── Pagination dots ── */

  for (var d = 0; d < dots.length; d++) {
    (function (i) {
      dots[i].addEventListener('click', function () { goTo(i, true); });
    }(d));
  }

  /* ── Industry nav buttons — change sector + scroll to carousel if off-screen ── */

  for (var n = 0; n < navBtns.length; n++) {
    (function (i) {
      navBtns[i].addEventListener('click', function () {
        goTo(i, true);
        /* Only scroll if carousel is not already in the visible area */
        var arena = document.getElementById('industriesArena');
        if (arena) {
          var rect = arena.getBoundingClientRect();
          if (rect.top > window.innerHeight * 0.55) {
            arena.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }(n));
  }

  /* ── Mouse drag ── */

  var dragging       = false;
  var dragStartX     = 0;
  var dragBaseOffset = 0;
  var dragVelocity   = 0;
  var dragLastX      = 0;

  slidesWrap.addEventListener('mousedown', function (e) {
    if (mqMobile.matches) return;
    dragging       = true;
    dragStartX     = e.clientX;
    dragBaseOffset = calcOffset(currentIndex);
    dragVelocity   = 0;
    dragLastX      = e.clientX;
    slidesWrap.classList.add('isDragging');
    slidesWrap.style.transition = 'none';
  });

  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    var delta = e.clientX - dragStartX;
    dragVelocity = e.clientX - dragLastX;
    dragLastX    = e.clientX;
    slidesWrap.style.transform = 'translateX(' + (dragBaseOffset + delta) + 'px)';
  });

  document.addEventListener('mouseup', function (e) {
    if (!dragging) return;
    dragging = false;
    slidesWrap.classList.remove('isDragging');
    var delta = e.clientX - dragStartX;
    if (Math.abs(delta) > 60 || Math.abs(dragVelocity) > 5) {
      goTo(delta < 0 ? currentIndex + 1 : currentIndex - 1, true);
    } else {
      goTo(currentIndex, true);
    }
  });

  /* ── Touch support ── */

  var touchStartX     = 0;
  var touchBaseOffset = 0;

  slidesWrap.addEventListener('touchstart', function (e) {
    if (mqMobile.matches) return;
    touchStartX     = e.touches[0].clientX;
    touchBaseOffset = calcOffset(currentIndex);
    slidesWrap.style.transition = 'none';
  }, { passive: true });

  slidesWrap.addEventListener('touchmove', function (e) {
    if (mqMobile.matches) return;
    var delta = e.touches[0].clientX - touchStartX;
    slidesWrap.style.transform = 'translateX(' + (touchBaseOffset + delta) + 'px)';
  }, { passive: true });

  slidesWrap.addEventListener('touchend', function (e) {
    if (mqMobile.matches) return;
    var delta = e.changedTouches[0].clientX - touchStartX;
    goTo(Math.abs(delta) > 50 ? (delta < 0 ? currentIndex + 1 : currentIndex - 1) : currentIndex, true);
  });

  /* ── Keyboard (only when section is in view) ── */

  document.addEventListener('keydown', function (e) {
    if (mqMobile.matches) return;
    var section = document.getElementById('industries');
    if (!section) return;
    var rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(currentIndex - 1, true); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex + 1, true); }
  });

  /* ── Panel tilt on mouse move (active card only — V1 behaviour) ── */

  for (var s = 0; s < slides.length; s++) {
    (function (slide) {
      var panel = slide.querySelector('.industryPanel');
      if (!panel) return;

      slide.addEventListener('mousemove', function (e) {
        if (!slide.classList.contains('isActive')) return;
        var rect = panel.getBoundingClientRect();
        var cx   = (e.clientX - rect.left) / rect.width  - 0.5;
        var cy   = (e.clientY - rect.top)  / rect.height - 0.5;
        panel.style.transform = 'perspective(900px) rotateY(' + (cx * 7) + 'deg) rotateX(' + (-cy * 5) + 'deg)';
      });

      slide.addEventListener('mouseleave', function () {
        panel.style.transform = '';
      });
    }(slides[s]));
  }

  /* ── Project hover tooltip ── */

  var tooltipHideTimer;

  var projectItems = document.querySelectorAll('.industriesSection .industryProjectItem[data-preview]');

  for (var p = 0; p < projectItems.length; p++) {
    (function (item) {
      item.addEventListener('mouseenter', function (e) {
        if (!tooltip || !tooltipImg) return;
        clearTimeout(tooltipHideTimer);
        tooltipImg.src = item.dataset.preview;
        positionTooltip(e);
        tooltip.classList.add('isVisible');
      });

      item.addEventListener('mousemove', positionTooltip);

      item.addEventListener('mouseleave', function () {
        tooltipHideTimer = setTimeout(function () {
          if (tooltip) tooltip.classList.remove('isVisible');
        }, 80);
      });
    }(projectItems[p]));
  }

  function positionTooltip(e) {
    if (!tooltip) return;
    var tw  = tooltip.offsetWidth  || 200;
    var th  = tooltip.offsetHeight || 130;
    var pad = 14;
    var x   = e.clientX + pad;
    var y   = e.clientY - th / 2;
    if (x + tw > window.innerWidth  - pad) x = e.clientX - tw - pad;
    if (y < pad)                           y = pad;
    if (y + th > window.innerHeight - pad) y = window.innerHeight - th - pad;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
  }

  /* ── Recalculate on resize ── */

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { goTo(currentIndex, false); }, 150);
  });

}());


/* ============================================================
   NEWSLETTER ORBIT — rocket animation + form submission
   ============================================================ */

(function initNewsletterOrbit() {

  var form       = document.getElementById('nlForm');
  var input      = document.getElementById('nlInput');
  var field      = document.getElementById('nlField');
  var rocketWrap = document.getElementById('nlRocketWrap');
  var cta        = document.getElementById('nlCta');
  var successEl  = document.getElementById('nlSuccess');

  if (!form || !input || !field) return;

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function hasDotCom(v) {
    return v.trim().toLowerCase().includes('.com');
  }

  function getRestingLeft() {
    /* Rocket rests on the right side, just before the CTA button */
    var ctaW = cta ? cta.offsetWidth : 112;
    var rocketW = rocketWrap ? rocketWrap.offsetWidth : 20;
    return field.offsetWidth - ctaW - rocketW - 18;
  }

  function activate() {
    field.classList.add('isActive');
    if (rocketWrap) rocketWrap.style.left = '14px';
  }

  function deactivate() {
    field.classList.remove('isActive');
    if (rocketWrap) rocketWrap.style.left = getRestingLeft() + 'px';
  }

  deactivate();

  /* React to email input changes */
  input.addEventListener('input', function () {
    if (hasDotCom(this.value)) {
      activate();
    } else {
      deactivate();
    }
  });

  /* Form submission */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!isValidEmail(input.value)) return;

    /* Blast rocket off the right edge */
    if (rocketWrap) {
      rocketWrap.style.transition = 'left 0.38s cubic-bezier(0.55,0,1,0.45)';
      rocketWrap.style.left = (field.offsetWidth + 30) + 'px';
    }

    fetch(form.action, {
      method:  'POST',
      body:    new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (res.ok) {
        setTimeout(function () {
          form.hidden = true;
          if (successEl) successEl.hidden = false;
        }, 420);
      } else {
        throw new Error('server');
      }
    })
    .catch(function () {
      /* Snap rocket back on error */
      if (rocketWrap) {
        rocketWrap.style.transition = '';
        rocketWrap.style.left = getRestingLeft() + 'px';
      }
      deactivate();
    });
  });

  /* Recalculate rocket target on resize */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (field.classList.contains('isActive') && rocketWrap) {
        rocketWrap.style.left = '14px';
      } else if (rocketWrap) {
        rocketWrap.style.left = getRestingLeft() + 'px';
      }
    }, 150);
  });

}());


/* ============================================================
   HERO CTA — navigate to project builder page
   ============================================================ */

(function initHeroCtaNav() {

  var btn = document.getElementById('requestCtaBtn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    window.location.href = 'projectBuilder.html';
  });

}());


/* ============================================================
   HOMEPAGE PROJECT BUILDER ENTRY FORM
   Collects 4 fields, saves to localStorage, navigates to builder
   ============================================================ */

(function initPbEntry() {

  var form  = document.getElementById('pbEntryForm');
  var errEl = document.getElementById('pbEntryError');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Validate required fields */
    var valid = true;
    var required = form.querySelectorAll('[required]');

    for (var i = 0; i < required.length; i++) {
      var el = required[i];
      var empty = !el.value.trim();
      if (!empty && el.type === 'email') {
        empty = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      }
      if (empty) {
        el.style.borderColor = 'rgba(248,113,113,0.6)';
        valid = false;
      } else {
        el.style.borderColor = '';
      }
    }

    if (!valid) {
      if (errEl) {
        errEl.textContent = 'Please fill in all required fields.';
        errEl.classList.add('isVisible');
      }
      return;
    }

    if (errEl) errEl.classList.remove('isVisible');

    /* Save data to localStorage for pre-population on builder page */
    var data = {};
    var fd = new FormData(form);
    fd.forEach(function (val, key) { data[key] = val; });

    try {
      localStorage.setItem('nulo_pb_data', JSON.stringify(data));
    } catch (err) {}

    /* Navigate to project builder */
    window.location.href = 'projectBuilder.html';
  });

}());


/* ============================================================
   SCHEDULE A CALL MODAL — nav CTA + "Schedule a Call" triggers
   ============================================================ */

(function initLaunchModal() {

  var modal        = document.getElementById('launchModal');
  var backdrop     = document.getElementById('launchModalBackdrop');
  var closeBtn     = document.getElementById('launchModalClose');
  var navTrigger   = document.getElementById('navCtaLaunch');
  var mobileTrigger = document.getElementById('mobileCtaLaunch');
  var form         = document.getElementById('launchModalForm');
  var submitBtn    = document.getElementById('launchModalSubmit');
  var success      = document.getElementById('launchModalSuccess');

  if (!modal) return;

  /* Focusable elements inside the modal */
  function getFocusable() {
    return Array.prototype.slice.call(
      modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
  }

  function openModal() {
    modal.classList.add('isOpen');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modalOpen');
    /* Focus first field */
    var focusable = getFocusable();
    if (focusable.length) { setTimeout(function () { focusable[1] && focusable[1].focus(); }, 60); }
  }

  function closeModal() {
    modal.classList.remove('isOpen');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modalOpen');
  }

  /* Triggers */
  if (navTrigger)    navTrigger.addEventListener('click', openModal);
  if (mobileTrigger) mobileTrigger.addEventListener('click', openModal);

  /* "Schedule a Call" buttons throughout the page open the same modal */
  var discoveryTriggers = document.querySelectorAll('.discoveryCallTrigger');
  for (var dt = 0; dt < discoveryTriggers.length; dt++) {
    discoveryTriggers[dt].addEventListener('click', openModal);
  }

  /* Close */
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (backdrop)  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('isOpen')) return;
    if (e.key === 'Escape') { closeModal(); return; }
    /* Focus trap */
    if (e.key === 'Tab') {
      var focusable = getFocusable();
      if (!focusable.length) return;
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* Form submission */
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    submitBtn.classList.add('isLoading');
    submitBtn.disabled = true;

    fetch(form.action, {
      method:  'POST',
      body:    new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (res.ok) {
        if (success) { success.hidden = false; }
        submitBtn.style.display = 'none';
        form.querySelectorAll('input, textarea, select').forEach(function (el) {
          el.disabled = true;
        });
        /* Redirect to homepage after a short pause so the user reads the confirmation */
        setTimeout(function () {
          closeModal();
          window.location.href = 'index.html';
        }, 3000);
      } else {
        throw new Error('server');
      }
    })
    .catch(function () {
      submitBtn.classList.remove('isLoading');
      submitBtn.disabled = false;
    });
  });

}());



/* ============================================================
   NULO STUDIO — PROJECT BUILDER JS
   Multi-step guided onboarding experience
   ============================================================ */

(function initProjectBuilder() {

  'use strict';

  /* ── Config ── */
  var STORAGE_KEY   = 'nulo_pb_data';
  var FORMSPREE_URL = 'https://formspree.io/f/xnjgwqae';

  var STEPS = ['contact', 'business', 'challenges', 'goals', 'package', 'preference', 'review'];
  var STEP_LABELS = ['Contact', 'Business', 'Challenges', 'Goals', 'Package', 'Preference', 'Review'];

  var currentStep = 0;


  /* ── LocalStorage helpers ── */

  function loadData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) { return {}; }
  }

  function saveData(updates) {
    var data = loadData();
    var keys = Object.keys(updates);
    for (var i = 0; i < keys.length; i++) {
      data[keys[i]] = updates[keys[i]];
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
    return data;
  }

  function clearData() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }


  /* ── Progress indicator ── */

  function buildProgress() {
    var wrap = document.getElementById('pbProgress');
    if (!wrap) return;

    for (var i = 0; i < STEP_LABELS.length; i++) {
      var el = document.createElement('div');
      el.className = 'pbProgressStep';
      el.setAttribute('aria-label', 'Step ' + (i + 1) + ': ' + STEP_LABELS[i]);
      el.innerHTML =
        '<span class="pbProgressDot">' + (i + 1) + '</span>' +
        '<span class="pbProgressLabel">' + STEP_LABELS[i] + '</span>';
      wrap.appendChild(el);
    }
  }

  function updateProgress(index) {
    var dots = document.querySelectorAll('.pbProgressStep');
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.remove('isActive', 'isComplete');
      if (i < index)  dots[i].classList.add('isComplete');
      if (i === index) dots[i].classList.add('isActive');
    }
  }


  /* ── Show step ── */

  function showStep(index) {
    /* Hide all steps */
    var allSteps = document.querySelectorAll('.pbStep');
    for (var i = 0; i < allSteps.length; i++) {
      allSteps[i].hidden = true;
    }

    /* Show target step */
    var target = document.querySelector('[data-step="' + STEPS[index] + '"]');
    if (target) target.hidden = false;

    /* Update nav button visibility */
    var prevBtn   = document.getElementById('pbPrev');
    var nextBtn   = document.getElementById('pbNext');
    var submitBtn = document.getElementById('pbSubmit');
    var navWrap   = document.getElementById('pbNavButtons');

    if (navWrap) navWrap.hidden = false;

    if (prevBtn)   prevBtn.hidden   = (index === 0);
    if (nextBtn)   nextBtn.hidden   = (index >= STEPS.length - 1);
    if (submitBtn) submitBtn.hidden = (index !== STEPS.length - 1);

    /* Update progress dots */
    updateProgress(index);

    /* Populate review summary if on review step */
    if (STEPS[index] === 'review') {
      buildReview();
      /* Unlock body scroll so the full review + submit is always reachable */
      document.body.classList.add('pbScrollable');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      document.body.classList.remove('pbScrollable');
    }

    /* Smooth scroll to step card on narrow layouts only */
    var card = document.querySelector('.pbStepCard');
    if (card && window.matchMedia('(max-width: 768px)').matches) {
      setTimeout(function () {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }

    currentStep = index;
  }


  /* ── Collect fields from a step ── */

  function collectStep(stepName) {
    var step = document.querySelector('[data-step="' + stepName + '"]');
    if (!step) return {};

    var data = {};

    /* Text, email, tel, url, textarea */
    var inputs = step.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), textarea');
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      if (el.name) data[el.name] = el.value.trim();
    }

    /* Checkboxes — group by name into array */
    var checkboxes = step.querySelectorAll('input[type="checkbox"]');
    var groups = {};
    for (var j = 0; j < checkboxes.length; j++) {
      var cb = checkboxes[j];
      if (!cb.name) continue;
      if (!groups[cb.name]) groups[cb.name] = [];
      if (cb.checked) groups[cb.name].push(cb.value);
    }
    var gKeys = Object.keys(groups);
    for (var k = 0; k < gKeys.length; k++) {
      data[gKeys[k]] = groups[gKeys[k]];
    }

    /* Radio */
    var radios = step.querySelectorAll('input[type="radio"]:checked');
    for (var r = 0; r < radios.length; r++) {
      if (radios[r].name) data[radios[r].name] = radios[r].value;
    }

    return data;
  }


  /* ── Populate a step's fields from stored data ── */

  function populateStep(stepName) {
    var data = loadData();
    var step = document.querySelector('[data-step="' + stepName + '"]');
    if (!step) return;

    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var val = data[key];

      /* Text/email/tel/url/textarea */
      var el = step.querySelector('[name="' + key + '"]');
      if (el && el.type !== 'checkbox' && el.type !== 'radio') {
        el.value = val || '';
        continue;
      }

      /* Checkboxes */
      if (Array.isArray(val)) {
        var cbs = step.querySelectorAll('input[type="checkbox"][name="' + key + '"]');
        for (var c = 0; c < cbs.length; c++) {
          cbs[c].checked = val.indexOf(cbs[c].value) !== -1;
        }
        continue;
      }

      /* Radio */
      if (typeof val === 'string') {
        var rbs = step.querySelectorAll('input[type="radio"][name="' + key + '"]');
        for (var rb = 0; rb < rbs.length; rb++) {
          rbs[rb].checked = rbs[rb].value === val;
        }
      }
    }
  }


  /* ── Validate a step ── */

  function validateStep(stepName) {
    /* Preference step: require a contact method selection */
    if (stepName === 'preference') {
      var prefStep = document.querySelector('[data-step="preference"]');
      var prefErr  = prefStep ? prefStep.querySelector('.pbError') : null;
      var selected = document.querySelector('input[name="contact_preference"]:checked');
      if (!selected) {
        if (prefErr) {
          prefErr.textContent = 'Please choose how you\'d like us to follow up.';
          prefErr.classList.add('isVisible');
        }
        return false;
      }
      if (prefErr) prefErr.classList.remove('isVisible');
      return true;
    }

    var step = document.querySelector('[data-step="' + stepName + '"]');
    if (!step) return true;

    var valid = true;
    var errEl = step.querySelector('.pbError');

    /* Clear previous field errors */
    var allInputs = step.querySelectorAll('input, textarea');
    for (var i = 0; i < allInputs.length; i++) {
      allInputs[i].style.borderColor = '';
    }

    /* Check required fields */
    var required = step.querySelectorAll('[required]');
    for (var r = 0; r < required.length; r++) {
      var el = required[r];
      var empty = !el.value.trim();

      /* Email format check */
      if (!empty && el.type === 'email') {
        empty = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      }

      if (empty) {
        el.style.borderColor = 'rgba(248,113,113,0.6)';
        valid = false;
      }
    }

    if (errEl) {
      if (!valid) {
        errEl.textContent = 'Please fill in all required fields to continue.';
        errEl.classList.add('isVisible');
      } else {
        errEl.classList.remove('isVisible');
      }
    }

    return valid;
  }


  /* ── Build review summary ── */

  function buildReview() {
    var container = document.getElementById('pbReviewData');
    if (!container) return;

    var data = loadData();

    var schema = [
      {
        title: 'Contact Information',
        fields: [
          { key: 'full_name',     label: 'Full Name' },
          { key: 'business_name', label: 'Business Name' },
          { key: 'email',         label: 'Email Address' },
          { key: 'phone',         label: 'Phone Number' }
        ]
      },
      {
        title: 'Business Information',
        fields: [
          { key: 'website',        label: 'Website' },
          { key: 'google_profile', label: 'Google Business Profile' },
          { key: 'service_area',   label: 'Service Area' },
          { key: 'about_business', label: 'About Your Business' }
        ]
      },
      {
        title: 'Current Challenges',
        fields: [{ key: 'challenges', label: 'Selected Challenges', type: 'tags' }]
      },
      {
        title: 'Project Goals',
        fields: [
          { key: 'project_goals',    label: 'Goals' },
          { key: 'specific_details', label: 'Specific Details' }
        ]
      },
      {
        title: 'Package Interest',
        fields: [{ key: 'package', label: 'Selected Package' }]
      },
      {
        title: 'How We\'ll Follow Up',
        fields: [
          { key: 'contact_preference', label: 'Contact Preference' },
          { key: 'callback_date',      label: 'Preferred Callback Date' },
          { key: 'callback_time',      label: 'Preferred Callback Time' }
        ]
      }
    ];

    var html = '';

    for (var s = 0; s < schema.length; s++) {
      var section = schema[s];
      var sectionHTML = '';

      for (var f = 0; f < section.fields.length; f++) {
        var field = section.fields[f];
        var val   = data[field.key];

        if (!val || (Array.isArray(val) && !val.length)) continue;

        sectionHTML += '<div class="pbReviewField">';
        sectionHTML += '<p class="pbReviewLabel">' + field.label + '</p>';

        if (field.type === 'tags' && Array.isArray(val)) {
          sectionHTML += '<div class="pbReviewTags">';
          for (var t = 0; t < val.length; t++) {
            sectionHTML += '<span class="pbReviewTag">' + val[t] + '</span>';
          }
          sectionHTML += '</div>';
        } else {
          var display = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');
          sectionHTML += '<p class="pbReviewValue">' + display + '</p>';
        }

        sectionHTML += '</div>';
      }

      if (!sectionHTML) continue;

      html += '<div class="pbReviewSection">';
      html += '<p class="pbReviewSectionTitle">' + section.title + '</p>';
      html += sectionHTML;
      html += '</div>';
    }

    container.innerHTML = html || '<p style="color:rgba(255,255,255,0.4);font-size:14px">Complete the previous steps to review your information here.</p>';
  }


  /* ── Submit ── */

  function submitForm() {
    var submitBtn = document.getElementById('pbSubmit');
    var errEl     = document.querySelector('[data-step="review"] .pbError');

    if (submitBtn) {
      submitBtn.classList.add('isLoading');
      submitBtn.disabled = true;
    }

    var data = loadData();

    /* Build FormData */
    var fd = new FormData();
    fd.append('_subject', 'Project Request — Nulo Studio');

    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var val = data[key];
      if (Array.isArray(val)) {
        for (var j = 0; j < val.length; j++) {
          fd.append(key, val[j]);
        }
      } else if (val) {
        fd.append(key, val);
      }
    }

    fetch(FORMSPREE_URL, {
      method:  'POST',
      body:    fd,
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (res.ok) {
        clearData();
        showSuccess();
      } else {
        throw new Error('server');
      }
    })
    .catch(function () {
      if (submitBtn) {
        submitBtn.classList.remove('isLoading');
        submitBtn.disabled = false;
      }
      if (errEl) {
        errEl.textContent = 'Something went wrong. Please try again.';
        errEl.classList.add('isVisible');
      }
    });
  }


  /* ── Show success ── */

  function showSuccess() {
    var allSteps = document.querySelectorAll('.pbStep');
    for (var i = 0; i < allSteps.length; i++) {
      allSteps[i].hidden = true;
    }

    var navWrap = document.getElementById('pbNavButtons');
    if (navWrap) navWrap.hidden = true;

    var success = document.querySelector('[data-step="success"]');
    if (success) success.hidden = false;

    /* Mark all progress steps complete */
    var dots = document.querySelectorAll('.pbProgressStep');
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.remove('isActive');
      dots[d].classList.add('isComplete');
    }

    /* Tailor the follow-up line to the chosen contact preference */
    var data    = loadData();
    var prefMsg = document.getElementById('pbSuccessPreferenceMsg');
    if (prefMsg && data.contact_preference) {
      var pref = data.contact_preference;
      if (pref === 'Book a Discovery Call') {
        prefMsg.textContent = 'If a discovery call was booked, we’ll see you then.';
      } else if (pref === 'Request a Callback') {
        prefMsg.textContent = 'We’ll reach out at your preferred callback time.';
      } else if (pref === 'Email Me') {
        prefMsg.textContent = 'We’ll send your project details and next steps by email.';
      } else if (pref === 'Text Me') {
        prefMsg.textContent = 'We’ll send your project details and next steps by text.';
      }
    }

    var card = document.querySelector('.pbStepCard');
    if (card) { card.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

    /* Countdown display and redirect after ~50 seconds */
    var countEl = document.getElementById('pbRedirectCount');
    var seconds = 50;

    var timer = setInterval(function () {
      seconds -= 1;
      if (countEl) countEl.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(timer);
        window.location.href = 'index.html';
      }
    }, 1000);
  }


  /* ── Navigation ── */

  function goNext() {
    var stepName = STEPS[currentStep];
    if (!validateStep(stepName)) return;

    saveData(collectStep(stepName));

    if (currentStep < STEPS.length - 1) {
      var next = currentStep + 1;
      showStep(next);
      populateStep(STEPS[next]);
    }
  }

  function goPrev() {
    if (currentStep === 0) return;
    saveData(collectStep(STEPS[currentStep]));
    var prev = currentStep - 1;
    showStep(prev);
    populateStep(STEPS[prev]);
  }


  /* ── Init ── */

  function init() {
    /* Only run on project builder page */
    if (!document.querySelector('.pbPage')) return;

    buildProgress();

    /* Bind navigation buttons */
    var nextBtn   = document.getElementById('pbNext');
    var prevBtn   = document.getElementById('pbPrev');
    var submitBtn = document.getElementById('pbSubmit');

    if (nextBtn)   nextBtn.addEventListener('click', goNext);
    if (prevBtn)   prevBtn.addEventListener('click', goPrev);
    if (submitBtn) submitBtn.addEventListener('click', submitForm);

    /* Keyboard: Enter advances from text fields */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return;
      var step = document.querySelector('[data-step="' + STEPS[currentStep] + '"]');
      if (step && step.contains(document.activeElement)) {
        e.preventDefault();
        goNext();
      }
    });

    /* Preference step: show/hide Cal embed and callback fields on radio change */
    var prefRadios = document.querySelectorAll('input[name="contact_preference"]');
    var calEmbed   = document.getElementById('pbCalEmbed');
    var cbFields   = document.getElementById('pbCallbackFields');
    for (var pi = 0; pi < prefRadios.length; pi++) {
      prefRadios[pi].addEventListener('change', function () {
        var val = this.value;
        if (calEmbed)  calEmbed.hidden  = (val !== 'Book a Discovery Call');
        if (cbFields)  cbFields.hidden  = (val !== 'Request a Callback');
      });
    }

    /* Pre-populate step 1 from homepage localStorage */
    populateStep(STEPS[0]);

    /* Start on step 0 */
    showStep(0);
  }

  init();

}());

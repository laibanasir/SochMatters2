/* Soch Matters site scripts
   - mobile menu
   - contact + demo forms (sent to sochmattersofficial@gmail.com)
   - multi-step booking flow (sent to sochmattersofficial@gmail.com)

   Works on GitHub Pages (static hosting). Emails are delivered through
   FormSubmit (https://formsubmit.co). The first submission ever sent to the
   inbox triggers a one-time activation email: click "Activate" in it once. */

/* ---------- Mobile menu ---------- */
document.addEventListener('click', function (e) {
  var b = e.target.closest('button');
  if (b && /menu/i.test(b.getAttribute('aria-label') || '')) {
    var m = document.getElementById('sm-mobile');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
  }
});

(function () {
  'use strict';

  var TO_EMAIL = 'sochmattersofficial@gmail.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + TO_EMAIL;

  /* ---------- Shared sender ---------- */
  function send(fields) {
    fields._template = 'table';
    fields._captcha = 'false';
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(fields)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        var ok = res.ok && (data.success === true || data.success === 'true');
        return { ok: ok, message: (data && data.message) || '' };
      });
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function setStatus(el, kind, html) {
    if (!el) return;
    el.style.color = kind === 'ok' ? 'var(--primary)' : 'var(--destructive)';
    el.style.fontWeight = '600';
    el.innerHTML = html;
  }

  var FAIL_HTML = 'Sorry, we could not send that just now. Please try again, or email us directly at ' +
    '<a href="mailto:' + TO_EMAIL + '" style="text-decoration:underline">' + TO_EMAIL + '</a>.';

  /* ---------- Contact + Demo forms ---------- */
  function initForms() {
    var forms = document.querySelectorAll('form[data-sm-form]');
    Array.prototype.forEach.call(forms, function (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var status = form.querySelector('[data-sm-status]');
        var btn = form.querySelector('button[type="submit"]');

        if (!form.checkValidity()) { form.reportValidity(); return; }

        var honey = form.querySelector('[name="_honey"]');
        if (honey && honey.value) { return; } /* bot */

        var fields = {
          _subject: form.getAttribute('data-subject') || 'New message from sochmatters.org',
          _honey: ''
        };
        Array.prototype.forEach.call(form.elements, function (el) {
          if (!el.name || el.name.charAt(0) === '_' || el.type === 'submit') return;
          var val = (el.value || '').trim();
          if (!val) return;
          if (el.name === 'email') { fields.email = val; return; } /* used as reply-to */
          var lab = el.id ? form.querySelector('label[for="' + el.id + '"]') : null;
          fields[(lab ? lab.textContent : el.name).trim()] = val;
        });
        fields['Sent from page'] = location.href;

        var original = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        setStatus(status, 'ok', '');

        send(fields).then(function (r) {
          if (r.ok) {
            form.reset();
            setStatus(status, 'ok', 'Thank you. Your message has been sent and our team will get back to you by email.');
          } else {
            setStatus(status, 'err', FAIL_HTML);
          }
        }).catch(function () {
          setStatus(status, 'err', FAIL_HTML);
        }).then(function () {
          if (btn) { btn.disabled = false; btn.textContent = original; }
        });
      });
    });
  }

  /* ---------- Booking flow ---------- */
  var SERVICES = [
    { id: 'discovery', name: 'Free Discovery Session', mins: '10 minutes', price: 0, label: 'Free', kind: 'care',
      desc: 'A short introductory conversation to understand your needs and help determine the appropriate next step.' },
    { id: 'therapy', name: 'Therapy Session', mins: '30 minutes', price: 2500, label: 'PKR 2,500', kind: 'care',
      desc: 'A focused professional therapy session.' },
    { id: 'therapy-ext', name: 'Extended Therapy Session', mins: '50 minutes', price: 4000, label: 'PKR 4,000', kind: 'care',
      desc: 'An extended therapy session for deeper, ongoing work.' },
    { id: 'counselling', name: 'Counselling Session', mins: '30 minutes', price: 2000, label: 'PKR 2,000', kind: 'care',
      desc: 'A focused professional counselling session.' },
    { id: 'counselling-ext', name: 'Extended Counselling Session', mins: '50 minutes', price: 3500, label: 'PKR 3,500', kind: 'care',
      desc: 'An extended counselling session for deeper, ongoing work.' },
    { id: 'consult', name: 'Specialist Consultation', mins: '60 minutes', price: 6000, label: 'PKR 6,000', kind: 'consult',
      desc: 'One-on-one consultation with a specialist in your area of need.' }
  ];

  var CARE_PREFS = [
    { id: 'match', name: 'Best available match', desc: 'We pair you with the professional who fits your needs and the time you picked.' },
    { id: 'female', name: 'Female professional', desc: 'Subject to availability at your chosen time.' },
    { id: 'male', name: 'Male professional', desc: 'Subject to availability at your chosen time.' }
  ];

  var CONSULT_AREAS = [
    { id: 'business', name: 'Business', desc: 'Strategy, entrepreneurship, marketing, sales, HR, operations and planning.' },
    { id: 'financial', name: 'Financial', desc: 'Financial planning, accounting, tax guidance, business finance and literacy.' },
    { id: 'medical', name: 'Medical & Healthcare', desc: 'Medical consultation, second opinions, healthcare guidance and navigation.' },
    { id: 'career', name: 'Career & Education', desc: 'Career counselling and planning, education and university guidance.' },
    { id: 'personal', name: 'Personal & Professional', desc: 'Life guidance, leadership, personal development and professional coaching.' }
  ];

  var PAYMENTS = [
    { id: 'bank', name: 'Bank transfer', desc: 'We email you the account details.' },
    { id: 'jazzcash', name: 'JazzCash', desc: 'We email you the account details.' },
    { id: 'easypaisa', name: 'Easypaisa', desc: 'We email you the account details.' }
  ];

  var STEPS = ['Service', 'Specialist', 'Date', 'Time', 'Details', 'Payment', 'Done'];
  var PKT = 'Asia/Karachi';

  function initBooking() {
    var root = document.getElementById('sm-booking');
    if (!root) return;

    var state = freshState();

    function freshState() {
      return { step: 0, service: null, pref: null, date: null, time: null, payment: null,
        details: { name: '', email: '', phone: '', notes: '', consent: false },
        error: '', sending: false, ref: '' };
    }

    function byId(list, id) {
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return null;
    }
    var svc = function () { return byId(SERVICES, state.service); };
    var isFree = function () { var s = svc(); return s && s.price === 0; };
    var prefList = function () { var s = svc(); return s && s.kind === 'consult' ? CONSULT_AREAS : CARE_PREFS; };

    /* ----- date + time helpers (slots are in Pakistan time) ----- */
    var pktDay = new Intl.DateTimeFormat('en-CA', { timeZone: PKT, year: 'numeric', month: '2-digit', day: '2-digit' });
    function upcomingDays() {
      var out = [], seen = {};
      for (var i = 0; i < 20 && out.length < 14; i++) {
        var d = new Date(Date.now() + i * 86400000);
        var key = pktDay.format(d);
        if (seen[key]) continue;
        seen[key] = 1;
        out.push({
          key: key,
          wd: new Intl.DateTimeFormat('en-GB', { timeZone: PKT, weekday: 'short' }).format(d),
          dm: new Intl.DateTimeFormat('en-GB', { timeZone: PKT, day: 'numeric', month: 'short' }).format(d)
        });
      }
      return out;
    }
    function slotInstant(dateKey, hour) {
      return new Date(dateKey + 'T' + (hour < 10 ? '0' : '') + hour + ':00:00+05:00');
    }
    var HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    function fmtTime(d, tz) {
      var o = { hour: 'numeric', minute: '2-digit', hour12: true };
      if (tz) o.timeZone = tz;
      return new Intl.DateTimeFormat('en-US', o).format(d);
    }
    function longDate(key) {
      var d = new Date(key + 'T12:00:00+05:00');
      return new Intl.DateTimeFormat('en-GB', { timeZone: PKT, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    }
    var localTz = (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } })();

    /* ----- rendering ----- */
    function stepper() {
      var html = '<ol class="bk-steps" aria-label="Booking progress">';
      for (var i = 0; i < STEPS.length; i++) {
        var cls = i === state.step ? 'is-active' : (i < state.step ? 'is-done' : '');
        var dot = i < state.step ? '&#10003;' : (i + 1);
        html += '<li class="' + cls + '"' + (i === state.step ? ' aria-current="step"' : '') + '><span class="bk-dot">' + dot +
          '</span><span>' + STEPS[i] + '</span>' + (i < STEPS.length - 1 ? '<span class="bk-line"></span>' : '') + '</li>';
      }
      return html + '</ol>';
    }

    function option(action, id, selected, top, title, desc, bottom, disabled) {
      return '<button type="button" class="bk-opt" data-act="' + action + '" data-id="' + esc(id) + '" aria-pressed="' + (selected ? 'true' : 'false') + '"' +
        (disabled ? ' disabled' : '') + '>' +
        (top ? '<span class="bk-kicker">' + esc(top) + '</span>' : '') +
        '<span class="bk-title">' + esc(title) + '</span>' +
        (desc ? '<span class="bk-desc">' + esc(desc) + '</span>' : '') +
        (bottom ? '<span class="bk-price">' + esc(bottom) + '</span>' : '') + '</button>';
    }

    function slotLabel(hour) {
      var d = slotInstant(state.date, hour);
      var pkt = fmtTime(d, PKT) + ' PKT';
      var loc = fmtTime(d);
      return loc === fmtTime(d, PKT) ? pkt : loc + ' your time (' + pkt + ')';
    }

    function summary() {
      var s = svc();
      if (!s) return '';
      var rows = [['Service', s.name + ' (' + s.mins + ')'], ['Price', s.label]];
      if (state.pref) rows.push([s.kind === 'consult' ? 'Area' : 'Specialist', byId(prefList(), state.pref).name]);
      if (state.date) rows.push(['Date', longDate(state.date)]);
      if (state.time != null) rows.push(['Time', slotLabel(state.time)]);
      var h = '<dl class="bk-sum">';
      rows.forEach(function (r) { h += '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; });
      return h + '</dl>';
    }

    function field(id, label, type, key, val, ac) {
      return '<div class="bk-field"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '" data-field="' + key + '" value="' + esc(val) + '" autocomplete="' + ac + '" maxlength="255"></div>';
    }

    function panel() {
      var s = svc(), h = '';
      if (state.step === 0) {
        h += '<h2 class="bk-h">Select a service</h2><p class="bk-sub">Not sure yet? Start with the free discovery session.</p><div class="bk-grid cols2">';
        SERVICES.forEach(function (x) { h += option('service', x.id, state.service === x.id, x.mins, x.name, x.desc, x.label); });
        h += '</div>';
      } else if (state.step === 1) {
        var consult = s.kind === 'consult';
        h += '<h2 class="bk-h">' + (consult ? 'Choose your area of consultation' : 'Choose your specialist') + '</h2>' +
          '<p class="bk-sub">' + (consult ? 'We will match you with a qualified specialist in this area.' : 'Tell us your preference. You can change your professional or reschedule later.') + '</p><div class="bk-grid cols2">';
        prefList().forEach(function (x) { h += option('pref', x.id, state.pref === x.id, '', x.name, x.desc, ''); });
        h += '</div>';
      } else if (state.step === 2) {
        h += '<h2 class="bk-h">Pick a date</h2><p class="bk-sub">Sessions run between 10:00 AM and 8:00 PM Pakistan time (PKT).</p><div class="bk-grid bk-dates">';
        upcomingDays().forEach(function (d) {
          h += '<button type="button" class="bk-opt bk-date" data-act="date" data-id="' + d.key + '" aria-pressed="' + (state.date === d.key ? 'true' : 'false') + '">' +
            '<span class="bk-kicker">' + d.wd + '</span><span class="bk-title">' + d.dm + '</span></button>';
        });
        h += '</div>';
      } else if (state.step === 3) {
        h += '<h2 class="bk-h">Pick a time</h2><p class="bk-sub">' + esc(longDate(state.date)) + '. Times shown in your local timezone' + (localTz ? ' (' + esc(localTz) + ')' : '') + '.</p><div class="bk-grid bk-times">';
        var any = false;
        HOURS.forEach(function (hr) {
          var d = slotInstant(state.date, hr);
          var past = d.getTime() < Date.now() + 3600000;
          if (!past) any = true;
          var loc = fmtTime(d), pkt = fmtTime(d, PKT);
          h += option('time', String(hr), state.time === hr, '', loc, '', loc !== pkt ? pkt + ' PKT' : '', past);
        });
        h += '</div>';
        if (!any) h += '<p class="bk-sub" style="margin-top:1rem">No slots left on this day. Please go back and choose another date.</p>';
      } else if (state.step === 4) {
        var dt = state.details;
        h += '<h2 class="bk-h">Your details</h2><p class="bk-sub">We use these only to confirm and manage your booking.</p>' +
          '<div class="bk-form">' +
          field('bk-name', 'Full name', 'text', 'name', dt.name, 'name') +
          field('bk-email', 'Email', 'email', 'email', dt.email, 'email') +
          field('bk-phone', 'Phone / WhatsApp', 'tel', 'phone', dt.phone, 'tel') +
          '<div class="bk-field bk-wide"><label for="bk-notes">Anything you would like us to know (optional)</label>' +
          '<textarea id="bk-notes" data-field="notes" rows="4" maxlength="800">' + esc(dt.notes) + '</textarea></div>' +
          '<label class="bk-check bk-wide"><input type="checkbox" id="bk-consent" data-field="consent"' + (dt.consent ? ' checked' : '') + '>' +
          '<span>I have read the <a href="terms.html" target="_blank" rel="noopener">Terms</a> and <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>, and I understand Soch Matters is not an emergency service.</span></label>' +
          '</div>' + summary();
      } else if (state.step === 5) {
        h += '<h2 class="bk-h">Payment</h2><p class="bk-sub">You will not be charged now. Choose how you would like to pay and we will email you the details once your slot is confirmed.</p><div class="bk-grid bk-pay">';
        PAYMENTS.forEach(function (x) { h += option('pay', x.id, state.payment === x.id, '', x.name, x.desc, ''); });
        h += '</div>' + summary();
      } else {
        var d2 = state.details;
        h += '<div class="bk-done"><div class="bk-tick" aria-hidden="true">&#10003;</div>' +
          '<h2 class="bk-h">Booking request received</h2>' +
          '<p class="bk-sub">Thank you, ' + esc(d2.name.trim().split(' ')[0]) + '. We have your request and will confirm your slot by email at <strong>' + esc(d2.email) + '</strong>. Your slot is confirmed once you hear from us.</p>' +
          '<p class="bk-ref">Reference: <strong>' + esc(state.ref) + '</strong></p></div>' + summary() +
          '<div class="bk-nav" style="justify-content:center;gap:.75rem;flex-wrap:wrap"><button type="button" class="bk-btn primary" data-act="again">Book another session</button>' +
          '<a class="bk-btn ghost" href="index.html" style="text-decoration:none">Back to home</a></div>';
      }
      return h;
    }

    function canContinue() {
      if (state.step === 0) return !!state.service;
      if (state.step === 1) return !!state.pref;
      if (state.step === 2) return !!state.date;
      if (state.step === 3) return state.time != null;
      if (state.step === 5) return !!state.payment;
      return true;
    }

    function nav() {
      if (state.step === 6) return '';
      var last = (state.step === 4 && isFree()) || state.step === 5;
      var label = state.sending ? 'Sending…' : (last ? 'Confirm booking' : 'Continue');
      return '<div class="bk-nav"><button type="button" class="bk-btn ghost" data-act="back"' + (state.step === 0 || state.sending ? ' disabled' : '') + '>&larr; Back</button>' +
        '<button type="button" class="bk-btn primary" data-act="next" id="bk-next"' + (!canContinue() || state.sending ? ' disabled' : '') + '>' + label + (last || state.sending ? '' : ' &rarr;') + '</button></div>' +
        '<p class="bk-err" id="bk-err" role="alert">' + (state.error || '') + '</p>';
    }

    function render(focusHeading) {
      root.innerHTML = stepper() + '<div class="bk-card">' + panel() + nav() + '</div>';
      if (focusHeading) {
        var hd = root.querySelector('.bk-h');
        if (hd) { hd.setAttribute('tabindex', '-1'); hd.focus({ preventScroll: true }); }
        var top = root.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: top < 0 ? 0 : top, behavior: 'smooth' });
      }
    }

    /* ----- actions ----- */
    function go(n) { state.step = n; state.error = ''; render(true); }

    function validateDetails() {
      var d = state.details;
      if (d.name.trim().length < 2) return 'Please enter your full name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return 'Please enter a valid email address.';
      if (d.phone.replace(/\D/g, '').length < 7) return 'Please enter a valid phone or WhatsApp number.';
      if (!d.consent) return 'Please tick the box to confirm you have read the Terms and Privacy Policy.';
      return '';
    }

    function submit() {
      var s = svc(), d = state.details, dateObj = slotInstant(state.date, state.time);
      state.ref = 'SM-' + state.date.replace(/-/g, '').slice(2) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      var localStr = '';
      try {
        localStr = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(dateObj) + (localTz ? ' (' + localTz + ')' : '');
      } catch (e) {}
      var fields = {
        _subject: 'New booking request: ' + s.name + ' (' + d.name.trim() + ')',
        _honey: '',
        'Reference': state.ref,
        'Service': s.name + ' (' + s.mins + ')',
        'Price': s.label,
        'Specialist / area': byId(prefList(), state.pref).name,
        'Date (PKT)': longDate(state.date),
        'Time (PKT)': fmtTime(dateObj, PKT),
        "Client's local time": localStr,
        'Name': d.name.trim(),
        'email': d.email.trim(),
        'Phone / WhatsApp': d.phone.trim(),
        'Payment method': isFree() ? 'Not required (free session)' : byId(PAYMENTS, state.payment).name,
        'Notes': d.notes.trim() || '-',
        'Sent from page': location.href
      };
      state.sending = true; state.error = ''; render(false);
      send(fields).then(function (r) {
        state.sending = false;
        if (r.ok) { state.step = 6; state.error = ''; render(true); }
        else { state.error = FAIL_HTML; render(false); }
      }).catch(function () {
        state.sending = false; state.error = FAIL_HTML; render(false);
      });
    }

    root.addEventListener('click', function (e) {
      var el = e.target.closest('[data-act]');
      if (!el || el.disabled) return;
      var act = el.getAttribute('data-act'), id = el.getAttribute('data-id');

      if (act === 'service') { if (state.service !== id) { state.service = id; state.pref = null; state.payment = null; } render(false); }
      else if (act === 'pref') { state.pref = id; render(false); }
      else if (act === 'date') { if (state.date !== id) { state.date = id; state.time = null; } render(false); }
      else if (act === 'time') { state.time = parseInt(id, 10); render(false); }
      else if (act === 'pay') { state.payment = id; render(false); }
      else if (act === 'back') { if (state.step > 0) go(state.step - 1); }
      else if (act === 'again') { state = freshState(); render(true); }
      else if (act === 'next') {
        if (!canContinue()) return;
        if (state.step === 4) {
          var err = validateDetails();
          if (err) { state.error = err; var box = root.querySelector('#bk-err'); if (box) box.textContent = err; return; }
          if (isFree()) { submit(); return; }
        }
        if (state.step === 5) { submit(); return; }
        go(state.step + 1);
      }
    });

    root.addEventListener('input', function (e) {
      var key = e.target.getAttribute && e.target.getAttribute('data-field');
      if (!key) return;
      state.details[key] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    });

    render(false);
  }

  function boot() { initForms(); initBooking(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

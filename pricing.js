/* Clean & Green — pricing calculator
   All prices live in the CATALOG block below. Edit there; nothing else needs to change. */
(function () {
  'use strict';

  // ---------- CATALOG (edit prices here) ----------
  var CARPET = [
    ['room', 'Standard room', 79], ['hall', 'Hallway', 59], ['stairs', 'Staircase', 89],
    ['closet', 'Large walk-in closet', 49], ['pet', 'Pet treatment / area', 59],
    ['deodorizer', 'Deodorizer / area', 39], ['traffic', 'Heavy traffic treatment / area', 39],
    ['protector', 'Stain protector / area', 29]
  ];
  var UPHOLSTERY = [
    ['loveseat', 'Loveseat', 145], ['sofa', 'Sofa', 195], ['sectional', 'Sectional', 275],
    ['ottoman', 'Ottoman', 50], ['armchair', 'Armchair', 65], ['dining', 'Dining chair', 25]
  ];
  var RUGS = [['synthetic', 'Synthetic rug', 1.25], ['wool', 'Wool rug', 1.5]];
  var DUCTS = [
    ['none', 'No duct cleaning'],
    ['small', 'Small home · up to 1,500 sq. ft. · $449'],
    ['medium', 'Medium home · 1,501–2,500 sq. ft. · $549'],
    ['large', 'Large home · 2,501–3,500 sq. ft. · $699'],
    ['custom', 'Over 3,500 sq. ft. · custom quote']
  ];
  var DUCT_PRICES = { small: 449, medium: 549, large: 699 };
  var DUCT_NAMES = { small: 'small home', medium: 'medium home', large: 'large home', custom: 'over 3,500 sq. ft.' };
  var CARPET_MINIMUM = 200;
  var DRYER_STANDALONE = 179;
  var DRYER_WITH_DUCTS = 129;   // = $50 off
  var BUNDLE_PERCENT = 0.15;    // carpet + air duct bundle
  var DRYER_BUNDLE_SAVINGS = DRYER_STANDALONE - DRYER_WITH_DUCTS;
  // -------------------------------------------------

  var state = { counts: {}, sqft: {}, duct: 'none', dryer: false };

  var fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  function money(n) { return fmt.format(n); }
  function $(id) { return document.getElementById(id); }

  // ---------- Build the form ----------
  function stepperRow(r) {
    var row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML =
      '<div><span class="item-name"></span><span class="item-price"></span></div>' +
      '<div class="stepper">' +
      '<button type="button" data-d="-1">−</button><output>0</output><button type="button" data-d="1">+</button></div>';
    row.querySelector('.item-name').textContent = r[1];
    row.querySelector('.item-price').textContent = money(r[2]);
    var buttons = row.querySelectorAll('button');
    buttons[0].setAttribute('aria-label', 'Remove one ' + r[1]);
    buttons[1].setAttribute('aria-label', 'Add one ' + r[1]);
    var out = row.querySelector('output');
    function bump(d) {
      state.counts[r[0]] = Math.min(99, Math.max(0, (state.counts[r[0]] || 0) + d));
      out.textContent = state.counts[r[0]];
      update();
    }
    buttons[0].addEventListener('click', function () { bump(-1); });
    buttons[1].addEventListener('click', function () { bump(1); });
    row._reset = function () { out.textContent = '0'; };
    return row;
  }

  function rugRow(r) {
    var row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML =
      '<div><span class="item-name"></span><span class="item-price"></span></div>' +
      '<div class="stepper">' +
      '<button type="button">−</button>' +
      '<label class="sqft-label">Sq. ft.<input class="sqft-input" type="number" min="0" max="10000" step="1" value="0"></label>' +
      '<button type="button">+</button></div>';
    row.querySelector('.item-name').textContent = r[1];
    row.querySelector('.item-price').textContent = money(r[2]) + ' / sq. ft.';
    var input = row.querySelector('input');
    var buttons = row.querySelectorAll('button');
    input.setAttribute('aria-label', r[1] + ' square feet');
    buttons[0].setAttribute('aria-label', 'Remove 25 square feet of ' + r[1]);
    buttons[1].setAttribute('aria-label', 'Add 25 square feet of ' + r[1]);
    function setSq(v) {
      state.sqft[r[0]] = Math.min(10000, Math.max(0, Number(v) || 0));
      input.value = state.sqft[r[0]];
      update();
    }
    buttons[0].addEventListener('click', function () { setSq((state.sqft[r[0]] || 0) - 25); });
    buttons[1].addEventListener('click', function () { setSq((state.sqft[r[0]] || 0) + 25); });
    input.addEventListener('change', function () { setSq(input.value); });
    row._reset = function () { input.value = '0'; };
    return row;
  }

  var rows = [];
  function fill(id, list, maker) {
    var host = $(id);
    list.forEach(function (r) { var el = maker(r); rows.push(el); host.appendChild(el); });
  }
  fill('carpet-rows', CARPET, stepperRow);
  fill('uph-rows', UPHOLSTERY, stepperRow);
  fill('rug-rows', RUGS, rugRow);

  var ductHost = $('duct-options');
  DUCTS.forEach(function (d) {
    var label = document.createElement('label');
    var input = document.createElement('input');
    input.type = 'radio'; input.name = 'duct'; input.value = d[0]; input.checked = d[0] === 'none';
    input.addEventListener('change', function () { state.duct = d[0]; update(); });
    var span = document.createElement('span');
    span.textContent = d[1];
    label.appendChild(input); label.appendChild(span);
    ductHost.appendChild(label);
  });

  $('dryer-toggle').addEventListener('change', function (e) { state.dryer = e.target.checked; update(); });

  // ---------- Calculation ----------
  var lastCopyText = '';

  function update() {
    var lines = [], summary = [];
    var subtotal = 0, carpetSubtotal = 0, carpetSelected = false;

    CARPET.forEach(function (r) {
      var n = state.counts[r[0]] || 0;
      if (n > 0) { carpetSelected = true; carpetSubtotal += n * r[2]; }
    });
    [CARPET, UPHOLSTERY].forEach(function (group) {
      group.forEach(function (r) {
        var n = state.counts[r[0]] || 0;
        if (n > 0) {
          subtotal += n * r[2];
          lines.push([r[1] + ' × ' + n, money(n * r[2])]);
          summary.push(r[1] + ' × ' + n + ': ' + money(n * r[2]));
        }
      });
    });
    RUGS.forEach(function (r) {
      var n = state.sqft[r[0]] || 0;
      if (n > 0) {
        subtotal += n * r[2];
        lines.push([r[1] + ' × ' + n + ' sq. ft.', money(n * r[2])]);
        summary.push(r[1] + ' × ' + n + ' sq. ft.: ' + money(n * r[2]));
      }
    });

    var minAdj = carpetSelected ? Math.max(0, CARPET_MINIMUM - carpetSubtotal) : 0;
    if (minAdj > 0) {
      lines.push(['Carpet minimum adjustment', money(minAdj)]);
      summary.push('Carpet minimum adjustment: ' + money(minAdj));
    }

    var ductPrice = DUCT_PRICES[state.duct] || 0;
    if (state.duct !== 'none') {
      if (ductPrice > 0) {
        lines.push(['Air duct cleaning (' + DUCT_NAMES[state.duct] + ')', money(ductPrice)]);
        summary.push('Air duct cleaning (' + DUCT_NAMES[state.duct] + '): ' + money(ductPrice));
      } else {
        lines.push(['Air duct cleaning (' + DUCT_NAMES[state.duct] + ')', 'By quote']);
        summary.push('Air duct cleaning (' + DUCT_NAMES[state.duct] + '): custom in-home quote required');
      }
    }

    // Only ONE bundle applies at a time: whichever saves more.
    var hasDuct = ductPrice > 0;
    var carpetBase = carpetSelected ? carpetSubtotal + minAdj : 0;
    var discCarpetDuct = (hasDuct && carpetSelected) ? Math.round(BUNDLE_PERCENT * (carpetBase + ductPrice) * 100) / 100 : 0;
    var discDryer = (hasDuct && state.dryer) ? DRYER_BUNDLE_SAVINGS : 0;
    var bundleType = 'none';
    if (discCarpetDuct > 0 && discCarpetDuct >= discDryer) bundleType = 'carpet';
    else if (discDryer > 0) bundleType = 'dryer';

    var dryerPrice = state.dryer ? (bundleType === 'dryer' ? DRYER_WITH_DUCTS : DRYER_STANDALONE) : 0;
    if (state.dryer) {
      var lab = bundleType === 'dryer' ? 'Dryer vent cleaning (air duct bundle)' : 'Dryer vent cleaning';
      lines.push([lab, money(dryerPrice)]);
      summary.push(lab + ': ' + money(dryerPrice));
    }
    var bundleDiscount = bundleType === 'carpet' ? discCarpetDuct : 0;
    if (bundleDiscount > 0) {
      lines.push(['Bundle discount (15% carpet + duct)', '−' + money(bundleDiscount)]);
      summary.push('Bundle discount (15% carpet + duct): -' + money(bundleDiscount));
    }

    var total = subtotal + minAdj + ductPrice + dryerPrice - bundleDiscount;

    var status = [];
    if (minAdj > 0) status.push('The $200 carpet minimum is included in the estimated total.');
    if (state.duct === 'custom') status.push('The custom air duct quote is not included in the estimate. Bundle savings are confirmed with your quote.');
    if (bundleType === 'carpet') status.push('Your 15% carpet + duct bundle discount is applied.');
    if (bundleType === 'dryer') status.push('Your $50 dryer vent bundle savings is applied.');
    if (bundleType !== 'none') status.push('Only one bundle applies at a time, so you get the bigger savings.');
    var statusText = status.join(' ');

    // Render
    var host = $('estimate-lines');
    host.textContent = '';
    if (!lines.length) {
      var p = document.createElement('p');
      p.className = 'estimate-empty';
      p.textContent = 'No services selected yet.';
      host.appendChild(p);
    }
    lines.forEach(function (ln) {
      var div = document.createElement('div');
      div.className = 'estimate-line';
      var a = document.createElement('span'); a.textContent = ln[0];
      var b = document.createElement('strong'); b.textContent = ln[1];
      div.appendChild(a); div.appendChild(b);
      host.appendChild(div);
    });
    $('estimate-total').textContent = money(total);
    $('estimate-status').textContent = statusText;

    lastCopyText = 'Clean & Green preliminary estimate\n' + summary.join('\n') +
      '\nEstimated priced total: ' + money(total) + '\n' + statusText + '\nFinal price subject to confirmation.';
  }

  // ---------- Copy / reset ----------
  var statusEl = $('copy-status');
  var fallback = $('copy-fallback');
  function done(msg, showBox) {
    statusEl.textContent = msg;
    fallback.hidden = !showBox;
    if (showBox) { fallback.value = lastCopyText; fallback.focus(); fallback.select(); }
  }
  $('copy-estimate').addEventListener('click', function () {
    var ok = 'Estimate copied! Paste it into the “Service Details” section of the booking form.';
    var fail = 'Copy was blocked here. Select the text below and copy it.';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastCopyText).then(function () { done(ok, false); }, function () { done(fail, true); });
      } else { done(fail, true); }
    } catch (e) { done(fail, true); }
  });

  $('reset-estimate').addEventListener('click', function () {
    state = { counts: {}, sqft: {}, duct: 'none', dryer: false };
    rows.forEach(function (r) { r._reset(); });
    ductHost.querySelector('input[value="none"]').checked = true;
    $('dryer-toggle').checked = false;
    statusEl.textContent = '';
    fallback.hidden = true;
    update();
  });

  update();
})();

/* =================================================================
   GRACE BIBLE BAPTIST CHURCH — main.js
   1. Hero slideshow (index.html only)
   2. Smart Get Directions (iOS → Apple Maps / else Google Maps)
   3. Accordion toggle (about.html)
   4. Mobile menu toggle (all pages)
   ================================================================= */

/* -----------------------------------------------------------------
   1. HERO SLIDESHOW
   Only runs if #hero-slideshow exists on the page (index.html).
   Respects prefers-reduced-motion.
   ----------------------------------------------------------------- */
(function () {
  var container = document.getElementById('hero-slideshow');
  if (!container) return;                        // not on home page

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;                    // CSS keeps slide 1 visible

  var slides      = container.querySelectorAll('.hero-slide');
  var dotsWrap    = document.getElementById('slideshow-dots');
  var total       = slides.length;
  var current     = 0;
  var INTERVAL_MS = 5000;

  if (!total) return;

  /* Build dot buttons */
  slides.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.className   = 'slideshow-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', function () { goTo(i); });
    if (dotsWrap) dotsWrap.appendChild(dot);
  });

  function getDots() {
    return dotsWrap ? dotsWrap.querySelectorAll('.slideshow-dot') : [];
  }

  function goTo(index) {
    var dots = getDots();
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = ((index % total) + total) % total;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  var timer = setInterval(function () { goTo(current + 1); }, INTERVAL_MS);

  /* Pause on hover for accessibility */
  container.addEventListener('mouseenter', function () { clearInterval(timer); });
  container.addEventListener('mouseleave', function () {
    timer = setInterval(function () { goTo(current + 1); }, INTERVAL_MS);
  });
}());

/* -----------------------------------------------------------------
   2. GET DIRECTIONS
   iOS/iPadOS  → Apple Maps
   Everything else → Google Maps
   Usage: onclick="getDirections('7201 Klondike Rd, Pensacola, FL 32526')"
   ----------------------------------------------------------------- */
function getDirections(address) {
  var encoded     = encodeURIComponent(address);
  var isIOS       = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var isMacTouch  = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  var url = (isIOS || isMacTouch)
    ? 'https://maps.apple.com/?q=' + encoded
    : 'https://www.google.com/maps/search/?api=1&query=' + encoded;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* -----------------------------------------------------------------
   3. ACCORDION
   Usage: <button class="accordion-trigger" aria-expanded="false"
                  aria-controls="panel-id" onclick="toggleAccordion(this)">
   ----------------------------------------------------------------- */
function toggleAccordion(trigger) {
  var isOpen  = trigger.getAttribute('aria-expanded') === 'true';
  var bodyId  = trigger.getAttribute('aria-controls');
  var body    = document.getElementById(bodyId);
  var group   = trigger.closest('.accordion');

  /* Close siblings */
  if (group) {
    group.querySelectorAll('.accordion-trigger').forEach(function (t) {
      if (t !== trigger) {
        t.setAttribute('aria-expanded', 'false');
        var sib = document.getElementById(t.getAttribute('aria-controls'));
        if (sib) sib.classList.remove('open');
      }
    });
  }

  /* Toggle this item */
  trigger.setAttribute('aria-expanded', String(!isOpen));
  if (body) body.classList.toggle('open', !isOpen);
}

/* -----------------------------------------------------------------
   4. MOBILE MENU TOGGLE
   ----------------------------------------------------------------- */
function toggleMobileMenu() {
  var btn  = document.getElementById('hamburger-btn');
  var menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  var isOpen = menu.classList.contains('open');
  menu.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
}

/* Close mobile menu when user clicks outside */
document.addEventListener('click', function (e) {
  var btn  = document.getElementById('hamburger-btn');
  var menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  if (menu.classList.contains('open') &&
      !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
});

/* -----------------------------------------------------------------
   5. SERMON FEED LOADER
   Fetches the Cloudflare Worker feed and injects the latest 6
   Facebook video iframes into the existing sermon card slots.
   Fails gracefully — if the fetch fails, existing placeholders
   remain exactly as-is.
   ----------------------------------------------------------------- */
(function () {
  var FEED_URL = 'https://gbbc-sermons-feed.tkellz30.workers.dev/sermons.json';

  function loadSermonsFromFeed() {
    var grid = document.querySelector('[data-sermons-grid]');
    if (!grid) return; // not on home page

    var slots = grid.querySelectorAll('[data-sermon-video]');
    if (!slots.length) return;

    fetch(FEED_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Feed responded ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var items = (data && Array.isArray(data.items)) ? data.items : [];
        // Take the first 6 (feed should already be newest-first)
        var latest = items.slice(0, 6);

        latest.forEach(function (item, i) {
          if (!slots[i]) return;
          if (!item.permalink_url) return;

          var encoded = encodeURIComponent(item.permalink_url);
          var src = 'https://www.facebook.com/plugins/video.php'
                  + '?href=' + encoded
                  + '&show_text=false&width=560&t=0';

          // Replace only the iframe inside the video-embed wrapper
          slots[i].innerHTML =
            '<iframe'
            + ' src="' + src + '"'
            + ' scrolling="no"'
            + ' frameborder="0"'
            + ' allowfullscreen="true"'
            + ' allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"'
            + ' title="Sermon video ' + (i + 1) + '"'
            + '></iframe>';
        });
      })
      .catch(function (err) {
        // Silent failure — existing hardcoded iframes stay in place
        console.warn('Sermon feed could not be loaded:', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSermonsFromFeed);
  } else {
    loadSermonsFromFeed(); // already parsed
  }
}());

/* =================================================================
   GRACE BIBLE BAPTIST CHURCH — main.js
   1. Hero slideshow (index.html only)
   2. Smart Get Directions (iOS → Apple Maps / else Google Maps)
   3. Accordion toggle (about.html)
   4. Mobile menu toggle (all pages)
   5. Sermon feed loader — auto-injects iframes + card text
   ================================================================= */

/* -----------------------------------------------------------------
   1. HERO SLIDESHOW
   Mobile-robust: works on iOS Safari, Android Chrome/Firefox,
   Samsung Internet, and all desktop browsers.
   - start()/stop() helpers prevent duplicate intervals.
   - Hover-pause only on true pointer devices (not touch-only).
   - Restarts on visibilitychange, pageshow (bfcache), and a
     one-time pointerdown/touchstart "kick" for mobile.
   - Respects prefers-reduced-motion.
   ----------------------------------------------------------------- */
(function () {
  function initSlideshow() {
    var container = document.getElementById('hero-slideshow');
    if (!container) return;

    /* Respect reduced-motion: keep slide 1 visible, no interval */
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var slides      = container.querySelectorAll('.hero-slide');
    var dotsWrap    = document.getElementById('slideshow-dots');
    var total       = slides.length;
    var current     = 0;
    var INTERVAL_MS = 5000;
    var timer       = null;  /* single source of truth for the interval */

    if (!total) return;

    /* ── Hard-reset: one active slide, no ambiguous state ── */
    slides.forEach(function (s) { s.classList.remove('active'); });
    slides[0].classList.add('active');

    /* ── Build dot buttons ── */
    if (dotsWrap) dotsWrap.innerHTML = '';
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'slideshow-dot' + (i === 0 ? ' active' : '');
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

    /* ── Timer helpers: only one interval ever runs ── */
    function stop() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop(); /* clear any existing before creating a new one */
      timer = setInterval(function () { goTo(current + 1); }, INTERVAL_MS);
    }

    /* ── Start the slideshow ── */
    start();

    /* ── Hover-pause for real pointer devices (desktop/laptop).
          window.matchMedia('(hover: hover)') is false on pure
          touch screens so mobile never gets stuck in a paused state. ── */
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      container.addEventListener('mouseenter', stop);
      container.addEventListener('mouseleave', start);
    }

    /* ── Lifecycle: restart when user returns to the page.
          Covers: tab switch, app switch, iOS bfcache restore. ── */
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        start();
      } else {
        stop();
      }
    });

    /* pageshow fires on initial load AND on bfcache restore (iOS Safari).
       persisted=true means it was served from bfcache. */
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) start();
    });

    /* pagehide: stop timer cleanly so it doesn't run in background */
    window.addEventListener('pagehide', stop);

    /* ── One-time touch/pointer "kick" for mobile browsers.
          Some mobile browsers defer repaints until user interaction.
          A single pointerdown (covers touch + mouse + stylus) forces
          the browser to resume the rendering loop. Passive so it
          never blocks scroll or tap. ── */
    function oneTimeKick() {
      start();
      window.removeEventListener('pointerdown', oneTimeKick);
      window.removeEventListener('touchstart',  oneTimeKick);
    }
    window.addEventListener('pointerdown', oneTimeKick, { passive: true });
    /* touchstart fallback for very old browsers that lack PointerEvent */
    window.addEventListener('touchstart',  oneTimeKick, { passive: true });
  }

  /* Run after DOM is fully parsed */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlideshow);
  } else {
    initSlideshow();
  }
}());

/* -----------------------------------------------------------------
   2. GET DIRECTIONS
   iOS/iPadOS → Apple Maps  |  Everything else → Google Maps
   ----------------------------------------------------------------- */
function getDirections(address) {
  var encoded    = encodeURIComponent(address);
  var isIOS      = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var isMacTouch = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  var url = (isIOS || isMacTouch)
    ? 'https://maps.apple.com/?q=' + encoded
    : 'https://www.google.com/maps/search/?api=1&query=' + encoded;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* -----------------------------------------------------------------
   3. ACCORDION
   ----------------------------------------------------------------- */
function toggleAccordion(trigger) {
  var isOpen = trigger.getAttribute('aria-expanded') === 'true';
  var bodyId = trigger.getAttribute('aria-controls');
  var body   = document.getElementById(bodyId);
  var group  = trigger.closest('.accordion');

  if (group) {
    group.querySelectorAll('.accordion-trigger').forEach(function (t) {
      if (t !== trigger) {
        t.setAttribute('aria-expanded', 'false');
        var sib = document.getElementById(t.getAttribute('aria-controls'));
        if (sib) sib.classList.remove('open');
      }
    });
  }

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
   5. SERMON FEED LOADER  [TASKS 3 + 4]
   Fetches feed, injects iframes, and updates card text from feed.

   TASK 3: Derives a friendly time-of-day label ("Sunday Morning" or
           "Wednesday Night") from item.created_time using Pensacola
           local time (America/Chicago). No exact times shown.

   TASK 4: Parses item.description for title, one-sentence summary,
           and the main Bible verse. NO hallucination — only outputs
           what is explicitly present in the description text.
           Safe fallbacks used for everything that cannot be detected.

   Fails gracefully — if fetch fails, existing hardcoded iframes
   and text remain exactly as-is.
   ----------------------------------------------------------------- */
(function () {
  var FEED_URL = 'https://gbbc-sermons-feed.tkellz30.workers.dev/sermons.json';

  /* ── TASK 3: Time-of-day label ─────────────────────────────── */
  function getServiceLabel(createdTime) {
    if (!createdTime) return 'Service';
    try {
      var dt    = new Date(createdTime);
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        weekday: 'long',
        hour:    'numeric',
        hour12:  false
      }).formatToParts(dt);
      var weekday = '';
      var hour    = -1;
      parts.forEach(function (p) {
        if (p.type === 'weekday') weekday = p.value;
        if (p.type === 'hour')    hour    = parseInt(p.value, 10);
      });
      if (weekday === 'Sunday'    && hour >= 6  && hour < 13) return 'Sunday Morning';
      if (weekday === 'Wednesday' && hour >= 16 && hour < 23) return 'Wednesday Night';
      return 'Service';
    } catch (e) {
      return 'Service';
    }
  }

  /* ── Date formatter → "Mar 2, 2026" ────────────────────────── */
  function formatDate(createdTime) {
    if (!createdTime) return '';
    try {
      return new Date(createdTime).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        timeZone: 'America/Chicago'
      });
    } catch (e) { return ''; }
  }

  /* ── TASK 4: Parse description for title / summary / verse ─────
     Strict rules: ONLY output what is clearly in the text.
     1) Title: explicit "Title:" / "Sermon:" prefix, else first
        line if <= 80 chars.
     2) Verse: explicit label (Scripture/Verse/Text/Passage/Reading),
        else a bare book+chapter reference pattern.
     3) Summary: first meaningful sentence from the body, 20-200 chars.
     All fallbacks are safe and never invented.
  ─────────────────────────────────────────────────────────────── */
  function parseDescription(desc) {
    var result = { title: null, summary: null, verse: null };
    if (!desc || typeof desc !== 'string') return result;

    var raw   = desc.trim();
    var lines = raw.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);

    /* Title */
    var titleMatch = raw.match(/(?:^|\n)\s*(?:title|sermon(?:\s+title)?)\s*[:\-]\s*(.+)/i);
    if (titleMatch) {
      result.title = titleMatch[1].trim();
    } else if (lines.length > 0 && lines[0].length <= 80) {
      result.title = lines[0];
    }

    /* Verse — labelled first, bare reference as fallback */
    var labelledVerse = raw.match(
      /(?:scripture|bible\s+verse|verse|text|passage|reading)\s*[:\-]\s*([^\n]{3,80})/i
    );
    if (labelledVerse) {
      result.verse = labelledVerse[1].trim();
    } else {
      /* Matches patterns like "John 3:16", "1 Corinthians 13:4-8", "Genesis 16" */
      var bareRef = raw.match(
        /\b((?:[1-3]\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(\d+)(?::(\d+(?:-\d+)?))?(?=[\s,.\n!?]|$)/
      );
      if (bareRef) result.verse = bareRef[0].trim();
    }

    /* Summary — first sentence from body, after stripping title + verse lines */
    var bodyLines = (result.title && lines[0] === result.title) ? lines.slice(1) : lines;
    var bodyText  = bodyLines
      .join(' ')
      .replace(/(?:scripture|bible\s+verse|verse|text|passage|reading)\s*[:\-][^\n]*/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (bodyText) {
      var firstSentence = bodyText.split(/(?<=[.!?])\s+/)[0].trim();
      if (firstSentence.length >= 20 && firstSentence.length <= 200) {
        result.summary = firstSentence + (/[.!?]$/.test(firstSentence) ? '' : '.');
      }
    }

    return result;
  }

  /* ── Main loader ─────────────────────────────────────────────── */
  function loadSermonsFromFeed() {
    var grid       = document.querySelector('[data-sermons-grid]');
    if (!grid) return;

    var videoSlots = grid.querySelectorAll('[data-sermon-video]');
    var cards      = grid.querySelectorAll('.sermon-card');
    if (!videoSlots.length) return;

    fetch(FEED_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Feed HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var items  = (data && Array.isArray(data.items)) ? data.items : [];
        var latest = items.slice(0, 6); // newest-first per feed

        latest.forEach(function (item, i) {
          if (!videoSlots[i] || !item.permalink_url) return;

          /* Inject iframe */
          var encoded = encodeURIComponent(item.permalink_url);
          var src     = 'https://www.facebook.com/plugins/video.php'
                      + '?href=' + encoded
                      + '&show_text=false&width=560&t=0';
          videoSlots[i].innerHTML =
              '<iframe'
            + ' src="' + src + '"'
            + ' scrolling="no" frameborder="0"'
            + ' allowfullscreen="true"'
            + ' allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"'
            + ' title="Sermon video ' + (i + 1) + '"'
            + '></iframe>';

          /* Update card text (Tasks 3 + 4) */
          var card = cards[i];
          if (!card) return;

          var parsed  = parseDescription(item.description || '');
          var label   = getServiceLabel(item.created_time  || '');
          var dateStr = formatDate(item.created_time        || '');

          var seriesEl = card.querySelector('.sermon-series');
          var titleEl  = card.querySelector('.sermon-title');
          var descEl   = card.querySelector('.sermon-desc');
          var metaSpan = card.querySelector('.sermon-meta > span');
          var watchBtn = card.querySelector('.sermon-watch-btn');

          /* Task 3 */
          if (seriesEl) seriesEl.textContent = label;

          /* Task 4 */
          if (titleEl)  titleEl.textContent  = parsed.title   || 'Sermon Message';
          if (descEl)   descEl.textContent   = parsed.summary || 'Watch this message on Facebook for details.';
          if (metaSpan) {
            metaSpan.textContent = dateStr
              + (parsed.verse ? ' \u00b7 ' + parsed.verse : '');
          }

          /* Point Watch button to the specific video */
          if (watchBtn) {
            watchBtn.href = item.permalink_url;
            watchBtn.setAttribute('target', '_blank');
            watchBtn.setAttribute('rel', 'noopener noreferrer');
          }
        });
      })
      .catch(function (err) {
        /* Silent graceful failure — hardcoded fallback content stays */
        console.warn('Sermon feed could not be loaded:', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSermonsFromFeed);
  } else {
    loadSermonsFromFeed();
  }
}());

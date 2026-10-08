/*
 * Euphoria interactions (GSAP).
 *
 * Recreates every animation of the original design: page-load and scroll
 * reveals, split-text titles, parallax, card hovers, FAQ, menus, the About
 * journey and timelines, the Home V2/V3 feature switchers, Lottie icons, the
 * video lightbox and background-video controls.
 *
 * Elements opt in through attributes and classes already in the markup:
 *   [page-load-1..7]   fade up on page load, staggered 0.2s
 *   [hero-title]       letters fade up on page load
 *   [reveal-anim-1..6] fade up when scrolled into view, delayed 0–1s
 *   [reveal-2s]        fade in when scrolled into view
 *   [section-title]    letters fade up when scrolled into view
 *   [text-color-reveal], [text-scroll-reveal]  letter colour/opacity tied to scroll
 *
 * Bundled from src/scripts/main.ts. Before this runs, src/components/global/InteractionPreload.astro hides the
 * animated elements; adding `w-mod-ix3` to <html> at the end reveals them.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

export function initInteractions() {

  var root = document.documentElement;
  var $ = function (selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Breakpoints of the original design: desktop ≥ 992px, tablet 768–991px, mobile < 768px.
  var DESKTOP = '(min-width: 992px)';
  var TABLET_UP = '(min-width: 768px)';
  var EASE = 'sine.out';
  var FADE_UP = { opacity: 0, y: 60 };

  /**
   * Split an element into letters exactly like the original: words and letters both
   * become relative inline-block spans, so line breaks stay where they were.
   */
  function splitChars(el) {
    var split = new SplitText(el, { type: 'words, chars', tag: 'span', wordsClass: 'split-word', charsClass: 'split-letter' });
    split.words.concat(split.chars).forEach(function (c) { c.style.position = 'relative'; c.style.display = 'inline-block'; });
    return split.chars;
  }

  /** Paused timeline that plays on mouseenter and reverses on mouseleave. */
  function hover(selector, build, options) {
    options = options || {};
    $(selector).forEach(function (card) {
      if (options.filter && !options.filter(card)) return;
      var tl = gsap.timeline({ paused: true });
      build(tl, card);
      card.addEventListener('mouseenter', function () { if (!options.when || window.matchMedia(options.when).matches) tl.play(); });
      card.addEventListener('mouseleave', function () { tl.reverse(); });
    });
  }

  /** Run a callback when an element's centre band is entered from either direction. */
  function onStep(trigger, callback) {
    ScrollTrigger.create({ trigger: trigger, start: 'top center', end: 'bottom center', onEnter: callback, onEnterBack: callback });
  }

  // ------------------------------------------------------------------ page load
  function pageLoad() {
    if (reduceMotion) return; // elements simply show in their final state
    var tl = gsap.timeline();
    for (var i = 1; i <= 7; i++) {
      var items = $('[page-load-' + i + ']');
      if (items.length) tl.fromTo(items, FADE_UP, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, (i - 1) * 0.2);
    }
    $('[hero-title]').forEach(function (title) {
      gsap.fromTo(splitChars(title), FADE_UP, { opacity: 1, y: 0, duration: 0.6, ease: EASE, stagger: 0.01 });
    });
  }

  // ------------------------------------------------------------------ scroll reveals
  function scrollReveals() {
    if (reduceMotion) return;
    var delays = { 'reveal-anim-1': 0, 'reveal-anim-2': 0.2, 'reveal-anim-3': 0.4, 'reveal-anim-4': 0.6, 'reveal-anim-5': 0.8, 'reveal-anim-6': 1 };
    Object.keys(delays).forEach(function (attr) {
      $('[' + attr + ']').forEach(function (el) {
        gsap.fromTo(el, FADE_UP, {
          opacity: 1, y: 0, duration: 0.6, delay: delays[attr], ease: EASE,
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
        });
      });
    });
    $('[reveal-2s]').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0 }, {
        opacity: 1, duration: 0.6, delay: 0.2, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
      });
    });
    $('[section-title]').forEach(function (title) {
      gsap.fromTo(splitChars(title), FADE_UP, {
        opacity: 1, y: 0, duration: 0.6, ease: EASE, stagger: 0.01,
        scrollTrigger: { trigger: title, start: 'top bottom', toggleActions: 'play none none none' },
      });
    });
  }

  // ------------------------------------------------------------------ scroll-scrubbed text
  function scrubbedText() {
    $('[text-color-reveal]').forEach(function (el) {
      var chars = splitChars(el);
      if (reduceMotion) return gsap.set(chars, { color: '#212529' });
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 45%', scrub: 0.5 } })
        .fromTo(chars, { color: '#868e96' }, { color: '#212529', ease: 'none', duration: 0.5, stagger: 1 });
    });
    $('[text-scroll-reveal]').forEach(function (el) {
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top bottom', end: '10% top', scrub: 0.8 } })
        .fromTo(splitChars(el), { opacity: 0.5 }, { opacity: 1, ease: 'none', duration: 1, stagger: 1 });
    });
  }

  // ------------------------------------------------------------------ parallax images (tablet and up)
  function parallax(mm) {
    mm.add(TABLET_UP + ' and (prefers-reduced-motion: no-preference)', function () {
      [['.hero-image-wrapper', '.hero-image'], ['.video-banner', '.video-banner-image']].forEach(function (pair) {
        $(pair[0]).forEach(function (wrapper) {
          var image = wrapper.querySelectorAll(pair[1]);
          if (!image.length) return;
          gsap.fromTo(image, { yPercent: -6, scale: 1.15 }, {
            yPercent: 6, scale: 1.15, ease: 'none',
            scrollTrigger: { trigger: wrapper, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
          });
        });
      });
    });
  }

  // ------------------------------------------------------------------ card hovers
  function cardHovers() {
    if (reduceMotion) return;
    var d = { duration: 0.4, ease: EASE };
    var grow = function (tl, scope, selector, duration) {
      var targets = scope.querySelectorAll(selector);
      if (targets.length) tl.fromTo(targets, { scale: 1 }, { scale: 1.1, duration: duration || 0.4, ease: EASE }, 0);
    };
    hover('.icon-card, .growth-mini-card, .contact-info-card', function (tl, card) {
      tl.to(card, Object.assign({ backgroundColor: '#fff1e8' }, d), 0);
      grow(tl, card, '.icon-card-icon');
      grow(tl, card, '.contact-info-icon');
    });
    hover('.blog-card', function (tl, card) {
      grow(tl, card, '.blog-card-image', 0.6);
      // Overlay cards (Home V3, About V3): the read-time badge turns white.
      if (card.querySelector('.blog-card-badge')) tl.to(card.querySelectorAll('.section-eyebrow.is-tag'), Object.assign({ backgroundColor: '#ffffff' }, d), 0);
    });
    hover('.case-study-card', function (tl, card) {
      grow(tl, card, '.case-study-card-image', 0.6);
      tl.to(card.querySelectorAll('.blog-card-title'), Object.assign({ color: '#ff6b1e' }, d), 0);
    });
    hover('.office-card', function (tl, card) { grow(tl, card, '.office-card-image', 0.6); });
    hover('.benefit-card, .value-card, .story-card', function (tl, card) {
      tl.fromTo(card, { backgroundColor: getComputedStyle(card).backgroundColor }, Object.assign({ backgroundColor: '#ff6b1e' }, d), 0);
      tl.to(card.querySelectorAll('.icon-box'), Object.assign({ backgroundColor: '#ffffff' }, d), 0);
      tl.to(card.querySelectorAll('*'), Object.assign({ color: '#ffffff' }, d), 0);
    });
    hover('.team-card', function (tl, card) {
      var image = card.querySelectorAll('.team-card-image');
      var socials = card.querySelectorAll('.team-card-socials');
      if (image.length) tl.fromTo(image, { height: '23.1875rem' }, { height: '21.6875rem', duration: 0.45, ease: 'power2.inOut' }, 0);
      if (socials.length) tl.fromTo(socials, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.inOut' }, 0.1);
    });
    hover('.plan-card', function (tl, card) {
      var gradient = card.querySelectorAll('.plan-card-gradient');
      if (gradient.length) tl.fromTo(gradient, { opacity: 0 }, Object.assign({ opacity: 1 }, d), 0);
    });
    hover('.integration-card', function (tl, card) {
      tl.to(card, Object.assign({ backgroundColor: '#fff1e8' }, d), 0);
      grow(tl, card, '.integration-card-logo');
      tl.to(card.querySelectorAll('.heading-style-6'), { color: '#ff6b1e', duration: 0.3, ease: EASE }, 0);
    });
    hover('.stat-card-white', function (tl, card) {
      var gradient = card.querySelectorAll('.stat-card-gradient');
      if (gradient.length) tl.fromTo(gradient, { opacity: 0 }, Object.assign({ opacity: 1 }, d), 0);
      tl.to(card.querySelectorAll('*'), Object.assign({ color: '#ffffff' }, d), 0);
    });
  }

  // ------------------------------------------------------------------ navbar: mega menu, mobile menu
  function navbar() {
    // Desktop: the Pages mega menu opens on hover.
    hover('.navbar-dropdown', function (tl, dropdown) {
      var menu = dropdown.querySelectorAll('.mega-menu');
      tl.set(menu, { display: 'block' }, 0)
        .fromTo(menu, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.35, ease: EASE }, 0)
        .fromTo(dropdown.querySelectorAll('.navbar-dropdown-icon'), { rotation: 0 }, { rotation: 180, duration: 0.35, ease: EASE }, 0)
        .to(dropdown.querySelectorAll('.navbar-dropdown-toggle'), { color: '#212529', duration: 0.2, ease: EASE }, 0);
    }, { when: DESKTOP });
    var notDesktop = function () { return !window.matchMedia(DESKTOP).matches; };
    // Tablet/mobile: the Pages toggle expands the menu inline.
    $('.navbar-dropdown-toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        if (!notDesktop()) return;
        $('.mega-menu').forEach(function (m) { m.classList.toggle('is-open'); });
        toggle.querySelectorAll('.navbar-dropdown-icon').forEach(function (icon) { icon.classList.toggle('is-inverse'); });
      });
    });
    // Tablet/mobile: hamburger and close buttons open/close the menu panel.
    $('.menu-toggle').forEach(function (toggle) {
      var activate = function () {
        if (!notDesktop()) return;
        $('.navbar-menu').forEach(function (menu) { menu.classList.toggle('is-open'); });
      };
      toggle.addEventListener('click', activate);
      toggle.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    });
  }

  // ------------------------------------------------------------------ FAQ accordion
  function faq() {
    $('.faq-item').forEach(function (item) {
      var answer = item.querySelectorAll('.faq-answer');
      var text = item.querySelectorAll('.faq-answer-text');
      var bar = item.querySelectorAll('.faq-icon-bar.is-vertical');
      var tl = gsap.timeline({ paused: true })
        .fromTo(answer, { height: '0px' }, { height: 'auto', duration: 0.5, ease: EASE }, 0)
        .fromTo(text, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.4, ease: EASE }, 0.1)
        .fromTo(bar, { scaleY: 1, rotation: 0 }, { scaleY: 0, rotation: 90, duration: 0.35, ease: EASE }, 0);
      var open = false;
      item.addEventListener('click', function () {
        open = !open;
        if (reduceMotion) tl.progress(open ? 1 : 0);
        else if (open) tl.play(); else tl.reverse();
      });
    });
  }

  // ------------------------------------------------------------------ About V1: journey (desktop)
  function journey(mm) {
    var section = document.querySelector('.section-gap.is-journey');
    if (!section) return;
    mm.add(DESKTOP, function () {
      var milestones = $('.milestone', section);
      var part = function (selector) { return milestones.map(function (m) { return m.querySelector(selector); }); };
      var cards = part('.milestone-card');
      var images = part(':scope > .milestone-image');
      var dots = part('.milestone-dot');
      var lines = part('.milestone-line').filter(Boolean);
      // Each invisible [data-journey-step] marker opens its milestone and lights the dots up to it.
      $('[data-journey-step]', section).forEach(function (step) {
        var n = Number(step.getAttribute('data-journey-step')) - 1;
        onStep(step, function () {
          milestones.forEach(function (m, i) {
            m.classList.toggle('is-open', i === n);
            if (cards[i]) cards[i].classList.toggle('is-open', i === n);
            if (images[i]) images[i].classList.toggle('is-hidden', i === n);
            if (dots[i]) dots[i].classList.toggle('is-active', i <= n);
          });
        });
      });
      // Progress lines fill one after another while the section scrolls.
      var tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
      lines.forEach(function (line, i) { tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power1.out' }, i); });
    });
  }

  // ------------------------------------------------------------------ About V1: mission cards (desktop)
  function missionCards() {
    var cards = $('.mission-card');
    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        if (!window.matchMedia(DESKTOP).matches) return;
        cards.forEach(function (c) { c.classList.toggle('is-open', c === card); });
        $('.mission-card-image').forEach(function (img) { img.classList.toggle('is-open', card.contains(img)); });
      });
    });
  }

  // ------------------------------------------------------------------ About V2: vertical timeline
  function verticalTimeline() {
    $('.vt-row').forEach(function (row) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top center', end: 'bottom top', toggleActions: 'play none none reverse' } });
      tl.fromTo(row.querySelectorAll('.vt-dot-fill'), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.inOut' }, 0)
        .fromTo(row.querySelectorAll('.vt-image'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.inOut' }, 0.1)
        .fromTo(row.querySelectorAll('.vt-body'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.inOut' }, 0.2);
    });
    // The centre line grows with scroll.
    var track = document.querySelector('[data-wf-target*="12a629ea-05d9-88c2-d8a0-0ef2c41d62c2"]');
    var line = document.querySelector('[data-wf-target*="f307f4ed-37e1-f58f-90e8-ab347f0413a7"]');
    if (track && line) {
      gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'power1.out', scrollTrigger: { trigger: track, start: 'top center', end: 'bottom center', scrub: 0.5 } });
    }
  }

  // ------------------------------------------------------------------ Home V2: growth accordion + image switcher
  function growthAccordion() {
    var items = $('.growth-acc-item');
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        items.forEach(function (other) {
          var isThis = other === item;
          other.classList.toggle('is-open', isThis);
          other.querySelectorAll('.growth-acc-head').forEach(function (h) { h.classList.toggle('is-open', isThis); });
          gsap.to(other.querySelectorAll('.growth-acc-body'), {
            height: isThis ? 'auto' : '0px', opacity: isThis ? 1 : 0, duration: reduceMotion ? 0 : 0.45, ease: 'power2.inOut', overwrite: 'auto',
          });
        });
      });
    });
    $('[data-acc]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var n = trigger.getAttribute('data-acc');
        var d = reduceMotion ? 0 : 1;
        gsap.to('.growth-v2-image', { opacity: 0, duration: 0.4 * d, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('[data-acc-img="' + n + '"]', { opacity: 1, duration: 0.5 * d, delay: 0.1 * d, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }

  // ------------------------------------------------------------------ Home V3: feature steps + stat cards
  function featureSteps() {
    $('[data-feature-step]').forEach(function (step) {
      var n = step.getAttribute('data-feature-step');
      onStep(step, function () {
        var d = reduceMotion ? 0 : 1;
        gsap.to('.growth-image', { opacity: 0, duration: 0.5 * d, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('[data-feature-img="' + n + '"]', { opacity: 1, duration: 0.6 * d, delay: 0.05 * d, ease: 'power2.out', overwrite: 'auto' });
      });
    });
    // Stat-card switching only runs on Home V3 (the page with the feature steps).
    if (!document.querySelector('[data-feature-step]')) return;
    var cards = $('.stat-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var d = { duration: reduceMotion ? 0 : 0.5, ease: 'power2.inOut', overwrite: 'auto' };
        cards.forEach(function (c) { c.classList.toggle('is-dark', c === card); });
        gsap.to($('.stat-card-image').filter(function (el) { return !card.contains(el); }), Object.assign({ opacity: 0 }, d));
        gsap.to($('.stat-card-text').filter(function (el) { return !card.contains(el); }), Object.assign({ opacity: 0, height: '0px' }, d));
        gsap.to(card.querySelectorAll('.stat-card-image'), Object.assign({ opacity: 1 }, d));
        gsap.to(card.querySelectorAll('.stat-card-text'), Object.assign({ opacity: 1, height: 'auto' }, d));
      });
    });
  }

  // ------------------------------------------------------------------ Home V3: video expands to full screen (desktop)
  function videoExpand(mm) {
    $('[data-video-expand]').forEach(function (section) {
      var frame = section.querySelector('.video-cta-frame');
      var content = section.querySelector('.video-cta-content');
      if (!frame) return;
      mm.add(DESKTOP + ' and (prefers-reduced-motion: no-preference)', function () {
        var startHeight = function () { return Math.min(588, window.innerHeight * 0.72) + 'px'; };
        gsap.set(content, { autoAlpha: 0, y: 40 });
        gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true } })
          .fromTo(frame, { width: '70%', height: startHeight, borderRadius: '1000px' }, { width: '100%', height: '100vh', borderRadius: '0px', ease: 'power1.inOut', duration: 0.75 }, 0)
          .to(content, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.2 }, 0.8);
        return function () { gsap.set([frame, content], { clearProps: 'all' }); };
      });
    });
  }

  // ------------------------------------------------------------------ Lottie icons
  function lottieIcons() {
    var nodes = $('[data-animation-type="lottie"]');
    if (!nodes.length) return;
    // lottie-web is loaded only on pages that use it.
    import('lottie-web/build/player/lottie_svg').then(function (module) {
      var lottie = module.default;
      nodes.forEach(function (node) {
        var data = node.dataset;
        var anim = lottie.loadAnimation({
          container: node,
          renderer: data.renderer || 'svg',
          loop: data.loop === '1',
          autoplay: false,
          path: data.src,
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true, hideOnTransparent: true },
        });
        anim.setDirection(data.direction === '-1' ? -1 : 1);
        if (data.autoplay !== '1' || reduceMotion) return;
        // Play only while on screen.
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { if (entry.isIntersecting) anim.play(); else anim.pause(); });
        }).observe(node);
      });
    });
  }

  // ------------------------------------------------------------------ video lightbox
  function lightbox() {
    var make = function (names, tag) {
      var el = document.createElement(tag || 'div');
      el.className = names.split(' ').map(function (n) { return 'w-lightbox-' + n; }).join(' ');
      return el;
    };
    var opener = null;
    var backdrop = null;
    function close() {
      if (!backdrop) return;
      var el = backdrop;
      backdrop = null;
      gsap.to(el, { opacity: 0, duration: 0.3, onComplete: function () { el.remove(); } });
      root.classList.remove('w-lightbox-noscroll');
      if (opener) opener.focus();
    }
    function open(link) {
      var json = link.querySelector('script.w-json');
      if (!json) return;
      var item = JSON.parse(json.textContent).items[0];
      if (!item) return;
      opener = link;
      var figure = make('figure', 'figure');
      var placeholder = make('img image', 'img');
      placeholder.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + item.width + '" height="' + item.height + '"/>');
      placeholder.alt = '';
      figure.appendChild(placeholder);
      var holder = document.createElement('div');
      holder.innerHTML = item.html;
      var embed = holder.firstElementChild;
      if (embed) { embed.classList.add('w-lightbox-embed'); figure.appendChild(embed); }
      var frame = make('frame');
      frame.appendChild(figure);
      var view = make('view');
      view.id = 'w-lightbox-view';
      view.tabIndex = 0;
      view.style.opacity = '1';
      view.appendChild(frame);
      var closeButton = make('control close');
      closeButton.setAttribute('role', 'button');
      closeButton.setAttribute('aria-label', 'close lightbox');
      closeButton.tabIndex = 0;
      var content = make('content');
      content.append(view, closeButton);
      var container = make('container');
      container.append(content, make('strip'));
      backdrop = make('backdrop');
      backdrop.setAttribute('role', 'dialog');
      backdrop.setAttribute('aria-modal', 'true');
      backdrop.appendChild(container);
      document.body.appendChild(backdrop);
      root.classList.add('w-lightbox-noscroll');
      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      closeButton.focus();
      closeButton.addEventListener('click', close);
      closeButton.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close(); } });
      container.addEventListener('click', function (e) { if (e.target === container || e.target === content || e.target === view) close(); });
      backdrop.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }
    $('.w-lightbox').forEach(function (link) {
      link.addEventListener('click', function (e) { e.preventDefault(); open(link); });
    });
  }

  // ------------------------------------------------------------------ background video play/pause buttons
  function videoControls() {
    $('[data-w-bg-video-control]').forEach(function (button) {
      var video = document.getElementById(button.getAttribute('aria-controls'));
      if (!video) return;
      var icons = button.querySelectorAll('.video-control-icon');
      var sync = function () {
        if (icons[0]) icons[0].hidden = video.paused;
        if (icons[1]) icons[1].hidden = !video.paused;
      };
      button.addEventListener('click', function () { if (video.paused) video.play(); else video.pause(); });
      video.addEventListener('play', sync);
      video.addEventListener('pause', sync);
      if (reduceMotion) video.pause();
      sync();
    });
  }

  // ------------------------------------------------------------------ init
  var mm = gsap.matchMedia();
  pageLoad();
  scrollReveals();
  scrubbedText();
  parallax(mm);
  cardHovers();
  navbar();
  faq();
  journey(mm);
  missionCards();
  verticalTimeline();
  growthAccordion();
  featureSteps();
  videoExpand(mm);
  lottieIcons();
  lightbox();
  videoControls();
  // Initial states are set: release the elements hidden by InteractionPreload.
  root.classList.add('w-mod-ix3');
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
}

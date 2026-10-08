/* Sliders, office slider, blog accordion, filter pills, marquees, timeline highlight and mobile-menu scroll lock. Bundled from src/scripts/main.ts. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initTemplateInteractions() {
  var $ = gsap.utils.toArray;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* ---------- FAQ: lists with data-faq-open="first" start with the first item open ---------- */
  $('.faq-list[data-faq-open="first"]').forEach(function (list) {
    var first = list.querySelector(".faq-item");
    if (first) gsap.delayedCall(0.4, function () { first.click(); });
  });
  /* ---------- Timeline: highlight the year whose card is in view (ScrollTrigger) ---------- */
  {
    var yearLinks = $('.timeline-year[href^="#"]');
    yearLinks.forEach(function (link) {
      var card = document.getElementById(link.getAttribute("href").slice(1));
      if (!card) return;
      ScrollTrigger.create({
        trigger: card, start: "top 50%", end: "bottom 40%",
        onToggle: function (self) {
          if (self.isActive) yearLinks.forEach(function (l) { l.classList.toggle("is-active", l === link); });
        }
      });
    });
  }
  /* ---------- Mobile menu: lock page scroll while .navbar-menu.is-open ---------- */
  $(".navbar-menu").forEach(function (menu) {
    function sync() { gsap.set(document.documentElement, { overflow: menu.classList.contains("is-open") ? "hidden" : "" }); }
    $(".menu-toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function () { gsap.delayedCall(0.05, sync); });
    });
    $("a[href]", menu).forEach(function (a) {
      a.addEventListener("click", function () {
        if (a.getAttribute("href") === "#") return;
        menu.classList.remove("is-open");
        sync();
      });
    });
  });
  /* ---------- Scroll sliders: .scroll-track + two .slider-arrow inside the same .section-stack ---------- */
  $(".scroll-track").forEach(function (track) {
    var wrap = track.closest(".section-stack") || track.parentElement;
    var arrows = wrap ? $(".slider-arrow", wrap) : [];
    if (arrows.length < 2) return;
    function step() {
      var first = track.firstElementChild;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first ? first.getBoundingClientRect().width + gap : track.clientWidth;
    }
    // Where the track is heading; lets quick repeated clicks advance one card each.
    var destination = null;
    function go(dir) {
      var max = track.scrollWidth - track.clientWidth;
      var from = destination === null ? track.scrollLeft : destination;
      destination = gsap.utils.clamp(0, max, from + dir * step());
      // The CSS uses `scroll-behavior: smooth` for touch/trackpad scrolling. Switch it
      // (and snapping) off while GSAP drives scrollLeft, otherwise the browser's own
      // smooth scroll fights every frame and the slide starts late.
      gsap.set(track, { scrollSnapType: "none", scrollBehavior: "auto" });
      gsap.to(track, {
        scrollLeft: destination, duration: 0.5, ease: "power3.out", overwrite: true,
        onComplete: function () {
          destination = null;
          gsap.set(track, { clearProps: "scrollSnapType,scrollBehavior" });
        }
      });
    }
    arrows[0].addEventListener("click", function (e) { e.preventDefault(); go(-1); });
    arrows[1].addEventListener("click", function (e) { e.preventDefault(); go(1); });
  });
  /* ---------- Office slider: [data-office-slider] > slides; .slider-arrow (aria-label Previous/Next) ---------- */
  $("[data-office-slider]").forEach(function (slider) {
    var slides = $(slider.children);
    if (slides.length < 2) return;
    var index = 0, transition = null;
    gsap.set(slides.slice(1), { display: "none" });
    function go(next) {
      next = gsap.utils.wrap(0, slides.length, next);
      if (next === index) return;
      // A click during a transition finishes it instantly and starts the next one,
      // so the arrows always respond straight away.
      if (transition) transition.progress(1);
      var current = slides[index], target = slides[next];
      index = next;
      transition = gsap.timeline({ onComplete: function () { transition = null; } })
        .to(current, { autoAlpha: 0, y: -12, duration: 0.15, ease: "power2.in" })
        .set(current, { display: "none", clearProps: "opacity,visibility,transform" })
        .set(target, { display: "" })
        .fromTo(target, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" });
    }
    $(".slider-arrow", slider).forEach(function (arrow) {
      var prev = (arrow.getAttribute("aria-label") || "").toLowerCase().indexOf("prev") > -1;
      arrow.addEventListener("click", function (e) { e.preventDefault(); go(index + (prev ? -1 : 1)); });
    });
  });
  /* ---------- Featured accordion (Blog): .featured-grid > .featured-card, one open, hover opens another ---------- */
  $(".featured-grid").forEach(function (grid) {
    var cards = $(".featured-card", grid);
    if (cards.length < 2) return;
    var desktop = window.matchMedia("(min-width: 992px)");
    var OPEN = 707, CLOSED = 263;
    function setCard(card, open, instant) {
      var panel = card.querySelector(".featured-card-panel");
      var img = card.querySelector(".featured-card-image");
      card.classList.toggle("is-open", open);
      if (!desktop.matches) {
        gsap.set(card, { clearProps: "flexGrow" });
        if (panel) gsap.set(panel, { clearProps: "opacity,visibility,transform" });
        if (img) gsap.set(img, { clearProps: "transform" });
        return;
      }
      gsap.to(card, { flexGrow: open ? OPEN : CLOSED, duration: instant ? 0 : 0.8, ease: "power3.inOut", overwrite: "auto" });
      if (panel) gsap.to(panel, { autoAlpha: open ? 1 : 0, y: open ? 0 : 16, duration: instant ? 0 : (open ? 0.5 : 0.25), delay: open && !instant ? 0.35 : 0, ease: "power2.out", overwrite: "auto" });
      if (img) gsap.to(img, { scale: open ? 1 : 1.04, duration: instant ? 0 : 0.8, ease: "power3.inOut", overwrite: "auto" });
    }
    function openCard(target, instant) { cards.forEach(function (c) { setCard(c, c === target, instant); }); }
    cards.forEach(function (card) {
      function enter() { if (desktop.matches && !card.classList.contains("is-open")) openCard(card, false); }
      card.addEventListener("mouseenter", enter);
      card.addEventListener("focusin", enter);
    });
    openCard(cards[0], true);
    desktop.addEventListener("change", function () { openCard(grid.querySelector(".featured-card.is-open") || cards[0], true); });
  });
  /* ---------- Filter pills: [data-filter] pills show/hide [data-category] items in the same section ---------- */
  function applyFilter(pill, animate) {
    var scope = pill.closest("section") || document;
    var value = pill.getAttribute("data-filter");
    $("[data-filter]", scope).forEach(function (p) {
      p.classList.toggle("is-active", p === pill);
      p.setAttribute("aria-pressed", p === pill ? "true" : "false");
    });
    $("[data-category]", scope).forEach(function (card) {
      var item = card.closest(".w-dyn-item") || card;
      var show = value === "all" || card.getAttribute("data-category") === value;
      if (!show) { gsap.set(item, { display: "none" }); return; }
      gsap.set(item, { display: "" });
      if (!animate) return;
      gsap.fromTo(item, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", overwrite: true });
      if (item.classList.contains("faq-list") && !item.hasAttribute("data-faq-opened")) {
        item.setAttribute("data-faq-opened", "");
        var first = item.querySelector(".faq-item");
        if (first) gsap.delayedCall(0.15, function () { first.click(); });
      }
    });
  }
  $("[data-filter]").forEach(function (pill) {
    pill.addEventListener("click", function (e) { e.preventDefault(); applyFilter(pill, true); });
  });
  $("[data-filter].is-active").forEach(function (pill) {
    var list = (pill.closest("section") || document).querySelector(".faq-list[data-faq-open]");
    if (list) list.setAttribute("data-faq-opened", "");
    applyFilter(pill, false);
  });
  /* ---------- Marquee loops: data-marquee="left|right" data-marquee-speed="px per second" ---------- */
  if (!reduceMotion) {
    $("[data-marquee]").forEach(function (wrap) {
      var dir = wrap.getAttribute("data-marquee") === "right" ? 1 : -1;
      var speed = parseFloat(wrap.getAttribute("data-marquee-speed")) || 40;
      var gap = parseFloat(getComputedStyle(wrap).columnGap) || 0;
      var track = document.createElement("div");
      track.className = "marquee-loop-track";
      while (wrap.firstChild) track.appendChild(wrap.firstChild);
      wrap.appendChild(track);
      gsap.set(wrap, { display: "flex", overflow: "hidden", columnGap: gap });
      gsap.set(track, { display: "flex", alignItems: "center", flexGrow: 0, flexShrink: 0, flexBasis: "auto", columnGap: gap });
      var loop = null;
      function build() {
        var w = track.offsetWidth + gap;
        if (w <= gap) return;
        var copies = Math.ceil((wrap.clientWidth * 2) / w);
        while (wrap.children.length < copies + 1) {
          var clone = track.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          wrap.appendChild(clone);
        }
        var progress = loop ? loop.progress() : 0;
        var timeScale = loop ? loop.timeScale() : 1;
        if (loop) loop.kill();
        loop = gsap.fromTo(wrap.children,
          { x: dir < 0 ? 0 : -w },
          { x: dir < 0 ? -w : 0, duration: w / speed, ease: "none", repeat: -1 });
        loop.progress(progress).timeScale(timeScale);
      }
      build();
      ScrollTrigger.addEventListener("refresh", build);
      wrap.addEventListener("mouseenter", function () { if (loop) gsap.to(loop, { timeScale: 0, duration: 0.4, overwrite: true }); });
      wrap.addEventListener("mouseleave", function () { if (loop) gsap.to(loop, { timeScale: 1, duration: 0.4, overwrite: true }); });
    });
  }
}

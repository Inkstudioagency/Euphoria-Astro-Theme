/* Lenis smooth scrolling (same settings as the original template). */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function initSmoothScroll() {
  const lenis = new Lenis({
    smoothWheel: true,
    lerp: 0.1,
    wheelMultiplier: 1,
    infinite: false
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

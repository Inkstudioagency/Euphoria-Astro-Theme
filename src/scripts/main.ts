/**
 * Client-side entry point, bundled by Astro and loaded on every page from BaseLayout.astro.
 * GSAP, Lenis and lottie-web come from npm (see package.json).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { initInteractions } from './interactions.js';
import { initTemplateInteractions } from './template-interactions.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initCounters } from './counter.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

initInteractions();
initTemplateInteractions();
initSmoothScroll();
initCounters();

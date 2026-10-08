/* Count-up numbers: elements with [data-counter] animate from 0 when scrolled into view. */
import { gsap } from 'gsap';

export function initCounters() {
  document.querySelectorAll("[data-counter]").forEach((counter) => {
    const textEl = counter.firstElementChild || counter;
    const original = textEl.textContent.trim();
    const match = original.match(/^([^0-9.-]*)([0-9.,-]+)(.*)$/);
    if (!match) return;
    const prefix = match[1];
    const number = match[2].replace(/,/g, "");
    const suffix = match[3];
    const target = parseFloat(number);
    if (Number.isNaN(target)) return;
    const hasDecimal = number.includes(".");
    const hasComma = original.includes(",");
    const value = { current: 0 };
    gsap.fromTo(
      value,
      { current: 0 },
      {
        current: target,
        duration: 1.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: counter,
          start: "top 88%",
          once: true
        },
        onUpdate: () => {
          let formattedValue = hasDecimal
            ? value.current.toFixed(1)
            : Math.floor(value.current);
          if (hasComma && !hasDecimal) {
            formattedValue = Number(formattedValue).toLocaleString();
          }
          textEl.textContent =
            prefix + formattedValue + suffix;
        }
      }
    );
  });
}

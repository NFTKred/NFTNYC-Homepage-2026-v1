import { useEffect } from 'react';

const SELECTORS = '.fade-in, .scroll-fade-up, .scroll-fade-scale, .scroll-fade';

export default function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(SELECTORS).forEach((el) => {
      if (!el.classList.contains('is-visible')) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);
}

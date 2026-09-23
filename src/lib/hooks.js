import { useEffect, useRef, useState } from 'react';

/** Respeita a preferência de "reduzir movimento" do sistema. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const listener = (event) => setReduced(event.matches);
    query.addEventListener?.('change', listener);
    return () => query.removeEventListener?.('change', listener);
  }, []);

  return reduced;
}

/**
 * Detecta quando o elemento entra na tela (uma única vez).
 * Usado pelas animações de revelação no scroll.
 */
export function useInView({ threshold = 0.14, rootMargin = '0px 0px -8% 0px', once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

/** Aplica a classe `is-visible` quando o elemento aparece na tela. */
export function useReveal(options) {
  const [ref, inView] = useInView(options);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (inView) element.classList.add('is-visible');
  }, [inView, ref]);

  return ref;
}

/** Conta de 0 até `target` quando o elemento entra na tela. */
export function useCountUp(target, { duration = 1400, decimals = 0, prefix = '', suffix = '' } = {}) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const [value, setValue] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!inView) return undefined;
    if (reduced) {
      setValue(target);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutExpo: começa rápido e desacelera no final
      const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration, reduced]);

  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return [ref, `${prefix}${formatted}${suffix}`];
}

/** Move levemente o elemento conforme o scroll (parallax suave). */
export function useParallax({ strength = 40, axis = 'y' } = {}) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const element = ref.current;
    if (!element) return undefined;

    let frame = null;
    const update = () => {
      frame = null;
      const rect = element.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      const offset = Math.max(-1.4, Math.min(1.4, progress)) * strength;
      element.style.transform =
        axis === 'y' ? `translate3d(0, ${offset.toFixed(2)}px, 0)` : `translate3d(${offset.toFixed(2)}px, 0, 0)`;
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength, axis, reduced]);

  return ref;
}

/** Posição do scroll, para efeitos no cabeçalho e indicador de progresso. */
export function useScrollY() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let frame = null;
    const update = () => {
      frame = null;
      setScrollY(window.scrollY);
    };
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return scrollY;
}

/** Dispara uma animação curta sempre que `trigger` muda (ex.: item adicionado). */
export function usePulse(trigger, duration = 600) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!trigger) return undefined;
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), duration);
    return () => window.clearTimeout(timer);
  }, [trigger, duration]);

  return active;
}

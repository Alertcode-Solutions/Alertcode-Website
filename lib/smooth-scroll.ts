import Lenis from "@studio-freight/lenis";

export type SmoothScrollController = {
  destroy: () => void;
};

export function initSmoothScroll(): SmoothScrollController {
  const lenis = new Lenis({
    smoothWheel: true,
    lerp: 0.16,
    wheelMultiplier: 1.45,
  });

  let frameId = 0;

  const raf = (time: number): void => {
    lenis.raf(time);
    frameId = window.requestAnimationFrame(raf);
  };

  frameId = window.requestAnimationFrame(raf);

  return {
    destroy: () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
    },
  };
}

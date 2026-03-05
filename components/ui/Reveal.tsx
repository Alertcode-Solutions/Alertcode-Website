"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
};

export default function Reveal({ children, className }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [canAnimateInView, setCanAnimateInView] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");

    const update = () => {
      setIsSmallScreen(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const hasHashNavigation = window.location.hash.length > 0;
    const supportsIntersectionObserver = "IntersectionObserver" in window;
    setCanAnimateInView(supportsIntersectionObserver && !hasHashNavigation);
  }, []);

  const useTranslate = !prefersReducedMotion && !isSmallScreen;

  if (!canAnimateInView) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={useTranslate ? { opacity: 0, y: 20 } : { opacity: 0 }}
      whileInView={useTranslate ? { opacity: 1, y: 0 } : { opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

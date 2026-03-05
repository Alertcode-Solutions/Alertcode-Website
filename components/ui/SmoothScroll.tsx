"use client";

import { useEffect } from "react";
import { initSmoothScroll } from "@/lib/smooth-scroll";

export default function SmoothScroll() {
  useEffect(() => {
    const controller = initSmoothScroll();

    return () => {
      controller.destroy();
    };
  }, []);

  return null;
}
import type { Metadata } from "next";
import CapabilitiesSection from "@/components/sections/CapabilitiesSection";
import CommunitySection from "@/components/sections/CommunitySection";
import FinalCTASection from "@/components/sections/FinalCTASection";
import HeroSection from "@/components/sections/HeroSection";
import PhilosophySection from "@/components/sections/PhilosophySection";
import ProcessSection from "@/components/sections/ProcessSection";

export const metadata: Metadata = {
  title: "Engineering Intelligent Digital Infrastructure",
  description:
    "Alertcode engineers AI systems, blockchain architectures, and modern digital platforms built for scale.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Alertcode | Engineering Intelligent Digital Infrastructure",
    description:
      "Alertcode engineers AI systems, blockchain architectures, and modern digital platforms built for scale.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alertcode | Engineering Intelligent Digital Infrastructure",
    description:
      "Alertcode engineers AI systems, blockchain architectures, and modern digital platforms built for scale.",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <PhilosophySection />
      <CapabilitiesSection />
      <ProcessSection />
      <CommunitySection />
      <FinalCTASection />
    </>
  );
}

import type { HTMLAttributes } from "react";

type SectionProps = HTMLAttributes<HTMLElement>;

export default function Section({ className = "", children, ...props }: SectionProps) {
  const classes = ["w-full py-[clamp(72px,9vw,var(--section-padding))]", className].filter(Boolean).join(" ");

  return (
    <section className={classes} {...props}>
      {children}
    </section>
  );
}

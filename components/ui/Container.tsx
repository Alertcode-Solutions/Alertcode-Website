import type { HTMLAttributes } from "react";

type ContainerProps = HTMLAttributes<HTMLDivElement>;

export default function Container({ className = "", children, ...props }: ContainerProps) {
  const classes = ["mx-auto w-full max-w-[1280px] px-4 sm:px-5 lg:px-[var(--container-padding)]", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
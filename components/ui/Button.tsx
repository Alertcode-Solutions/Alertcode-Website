import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-primary text-foreground hover:opacity-90 focus-visible:ring-primary/70",
  outline:
    "border border-border bg-transparent text-foreground hover:border-foreground/30 hover:bg-white/[0.02] focus-visible:ring-foreground/35",
};

export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium leading-none transition-colors transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

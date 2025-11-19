"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "md" | "sm";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const variants: Record<typeof variant, string> = {
      primary:
        "bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white shadow-sm",
      secondary:
        "bg-[var(--surface-muted)] hover:bg-[var(--border)] text-[var(--foreground)]",
      ghost:
        "bg-transparent text-[var(--primary)] hover:bg-[var(--surface-muted)]",
      danger:
        "bg-[var(--accent)] hover:bg-[#b03761] text-white focus-visible:outline-[var(--accent)]",
      outline:
        "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
    } as const;

    const sizes: Record<typeof size, string> = {
      md: "h-11 px-5 text-sm font-semibold",
      sm: "h-9 px-4 text-sm font-semibold",
    } as const;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading && (
          <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-white" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";


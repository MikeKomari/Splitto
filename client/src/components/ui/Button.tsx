import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "bg-surface text-text border border-border-strong/60 hover:bg-surface-raised",
  ghost: "text-primary hover:bg-primary-subtle",
  danger: "bg-danger text-white hover:opacity-90",
  dark: "bg-night text-star-white hover:opacity-90 dark:bg-star-white dark:text-night",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-[13px] gap-1.5 rounded-md",
  md: "h-11 px-4 text-[15px] gap-2 rounded-md",
  lg: "h-14 px-6 text-[16px] gap-2 rounded-lg",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", loading, block, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "pressable inline-flex items-center justify-center font-semibold select-none",
        "disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer",
        variants[variant],
        sizes[size],
        block && "w-full",
        className
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export function IconButton({
  label,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "pressable inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md cursor-pointer",
        "hover:bg-surface-raised disabled:opacity-40",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

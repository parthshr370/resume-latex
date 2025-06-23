import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ShimmerButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

/** A clean button component that matches the design system */
export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  className,
  children,
  isLoading,
  disabled,
  type = "button",
  onClick,
  ...rest
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "relative rounded-lg px-6 py-3 font-semibold text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        "bg-primary hover:bg-primary/90 active:bg-primary/80 transition-colors duration-200",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        "shadow-sm border border-primary/20",
        className
      )}
      disabled={isLoading || disabled}
      {...rest}
    >
      <span className="flex items-center justify-center gap-2">
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {children}
      </span>
    </button>
  );
}; 
import React from "react";
import { cn } from "@/lib/utils";

interface BlueprintSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function BlueprintSection({
  title,
  description,
  children,
  className,
  ...props
}: BlueprintSectionProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)} {...props}>
      <div className="mb-4">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

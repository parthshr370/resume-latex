import React from "react";
import { cn } from "@/lib/utils";

interface BlueprintSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  children: React.ReactNode;
  isFileInput?: boolean;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BlueprintSection({
  title,
  description,
  children,
  className,
  isFileInput,
  onFileChange,
  ...props
}: BlueprintSectionProps) {
  return (
    <div className={cn("border-2 border-foreground bg-card p-6 shadow-sm", className)} {...props}>
      <div className="mb-4">
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div>{children}</div>
      {isFileInput && (
        <input type="file" id="pdf-upload" className="hidden" accept=".pdf" onChange={onFileChange} />
      )}
    </div>
  );
}

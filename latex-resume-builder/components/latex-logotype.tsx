import { cn } from "@/lib/utils"

export const LatexLogotype = ({ className }: { className?: string }) => {
  return (
    <span className={cn("font-latex tracking-wider text-foreground", className)}>
      L<span style={{ textTransform: "uppercase", fontSize: "0.8em", verticalAlign: "0.2em" }}>a</span>T
      <span style={{ textTransform: "uppercase", fontSize: "0.9em", verticalAlign: "-0.1em" }}>e</span>X
    </span>
  )
}

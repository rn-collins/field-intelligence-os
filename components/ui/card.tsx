import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({
  as: Component = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Component
      className={cn(
        "bg-surface border-border rounded-lg border shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("border-border border-b px-5 py-4", className)}>{children}</div>;
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("border-border bg-surface-sunken border-t px-5 py-3", className)}>
      {children}
    </div>
  );
}

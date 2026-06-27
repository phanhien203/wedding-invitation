import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import Container from "@/components/ui/Container";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export default function Section({
  title,
  subtitle,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-16 sm:py-24", className)} {...props}>
      <Container>
        {(title || subtitle) && (
          <div className="mb-10 text-center">
            {subtitle && (
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gold">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-semibold text-ink sm:text-4xl">
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

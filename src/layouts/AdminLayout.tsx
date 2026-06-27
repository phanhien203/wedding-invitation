import { ReactNode } from "react";
import Container from "@/components/ui/Container";

interface AdminLayoutProps {
  title?: string;
  children: ReactNode;
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-sage-100 bg-cream/60">
        <Container className="flex h-16 items-center justify-between">
          <span className="font-serif text-lg font-semibold">
            Wedding Admin
          </span>
          {title && <span className="text-sm text-ink/60">{title}</span>}
        </Container>
      </header>
      <main className="py-8">
        <Container>{children}</Container>
      </main>
    </div>
  );
}

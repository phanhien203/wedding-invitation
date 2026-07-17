import { Facebook, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import type { Person } from "@/types";

interface FooterSectionProps {
  brideName: string;
  groomName: string;
  bride: Person;
  groom: Person;
}

function ContactBlock({ person, label }: { person: Person; label: string }) {
  if (!person.phone && !person.facebook) return null;

  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-[0.15em] text-gold sm:text-xs sm:tracking-[0.25em]">
        {label}
      </p>
      <p className="mt-1 font-serif text-base font-semibold text-sage-700 sm:text-lg">
        {person.name}
      </p>
      <div className="mt-2 flex flex-col items-center gap-1.5 text-xs sm:text-sm">
        {person.phone && (
          <a
            href={`tel:${person.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 text-ink/70 transition hover:text-sage-700 sm:gap-2"
          >
            <Phone size={13} className="shrink-0 sm:h-[15px] sm:w-[15px]" />
            {person.phone}
          </a>
        )}
        {person.facebook && (
          <a
            href={person.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-ink/70 transition hover:text-sage-700 sm:gap-2"
          >
            <Facebook size={13} className="shrink-0 sm:h-[15px] sm:w-[15px]" />
            Facebook
          </a>
        )}
      </div>
    </div>
  );
}

export default function FooterSection({
  brideName,
  groomName,
  bride,
  groom,
}: FooterSectionProps) {
  const year = new Date().getFullYear();
  const hasContact = [groom, bride].some((p) => p.phone || p.facebook);

  return (
    <footer className="border-t border-sage-100 bg-white py-10">
      <Container className="flex flex-col items-center gap-6 text-center">
        {hasContact && (
          <div className="w-full max-w-lg border-y border-sage-100 py-6">
            <p className="mb-1.5 text-xs uppercase tracking-[0.2em] text-gold">
              Contact
            </p>
            <h2 className="mb-5 font-serif text-xl font-semibold text-ink">
              Thông tin liên hệ
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <ContactBlock person={groom} label="Chú rể" />
              <ContactBlock person={bride} label="Cô dâu" />
            </div>
          </div>
        )}

        <p className="text-xs text-ink/40">
          © {year} {brideName} &amp; {groomName}. With love.
        </p>
      </Container>
    </footer>
  );
}

import { Facebook, Phone } from "lucide-react";
import MusicPlayer from "@/components/common/MusicPlayer";
import Container from "@/components/ui/Container";
import type { Person } from "@/types";

interface FooterSectionProps {
  musicSrc: string;
  brideName: string;
  groomName: string;
  bride: Person;
  groom: Person;
}

function ContactBlock({ person, label }: { person: Person; label: string }) {
  if (!person.phone && !person.facebook) return null;

  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">{label}</p>
      <p className="mt-1 font-serif text-lg font-semibold text-sage-700">
        {person.name}
      </p>
      <div className="mt-2 flex flex-col items-center gap-1.5 text-sm">
        {person.phone && (
          <a
            href={`tel:${person.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 text-ink/70 transition hover:text-sage-700"
          >
            <Phone size={15} className="shrink-0" />
            {person.phone}
          </a>
        )}
        {person.facebook && (
          <a
            href={person.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-ink/70 transition hover:text-sage-700"
          >
            <Facebook size={15} className="shrink-0" />
            Facebook
          </a>
        )}
      </div>
    </div>
  );
}

export default function FooterSection({
  musicSrc,
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
        <MusicPlayer src={musicSrc} />

        {hasContact && (
          <div className="w-full max-w-lg border-y border-sage-100 py-6">
            <p className="mb-1.5 text-xs uppercase tracking-[0.2em] text-gold">
              Contact
            </p>
            <h2 className="mb-5 font-serif text-xl font-semibold text-ink">
              Thông tin liên hệ
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

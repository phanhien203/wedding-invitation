import { SOCIAL_LINKS } from "@/constants";
import MusicPlayer from "@/components/common/MusicPlayer";
import Container from "@/components/ui/Container";

interface FooterSectionProps {
  musicSrc: string;
  brideName: string;
  groomName: string;
}

export default function FooterSection({
  musicSrc,
  brideName,
  groomName,
}: FooterSectionProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sage-100 bg-white py-10">
      <Container className="flex flex-col items-center gap-6 text-center">
        <MusicPlayer src={musicSrc} />
        <div className="flex flex-wrap justify-center gap-4">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink/60 transition hover:text-sage-700"
            >
              {link.platform}
            </a>
          ))}
        </div>
        <p className="text-xs text-ink/40">
          © {year} {brideName} &amp; {groomName}. With love.
        </p>
      </Container>
    </footer>
  );
}

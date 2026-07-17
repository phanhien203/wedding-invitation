import { useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";
import { useMusicStore } from "@/stores/musicStore";
import { cn } from "@/lib/cn";

interface MusicPlayerProps {
  src: string;
  /** Góc đặt nút nổi. Mặc định dưới phải. */
  position?: "left" | "right";
  className?: string;
}

export default function MusicPlayer({
  src,
  position = "right",
  className,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isPlaying, isMuted, volume, setPlaying, togglePlay } =
    useMusicStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
    audio.loop = true;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    if (isPlaying) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, src, setPlaying]);

  if (!src) return null;

  return (
    <>
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Tạm dừng nhạc" : "Phát nhạc"}
        aria-pressed={isPlaying}
        className={cn(
          "fixed bottom-4 z-50 h-11 w-11 rounded-full shadow-xl ring-1 ring-black/10 transition hover:scale-105 active:scale-95 sm:bottom-6 sm:h-14 sm:w-14",
          position === "left" ? "left-4 sm:left-6" : "right-4 sm:right-6",
          className
        )}
      >
        {/* Mặt đĩa than — xoay khi đang phát, dừng khi tạm dừng */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#4a4a4a,#1c1c1c_60%,#000)]",
            isPlaying && "animate-spin-slow"
          )}
        >
          {/* Các rãnh đĩa */}
          <span className="absolute inset-[5px] rounded-full border border-white/10 sm:inset-[6px]" />
          <span className="absolute inset-[9px] rounded-full border border-white/10 sm:inset-[11px]" />
          {/* Chấm sáng ở mép để thấy rõ chuyển động xoay */}
          <span className="absolute left-1/2 top-[5px] h-1 w-1 -translate-x-1/2 rounded-full bg-gold sm:top-[6px]" />
          {/* Nhãn giữa đĩa */}
          <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-gold to-sage-700 sm:h-4 sm:w-4" />
        </span>

        {/* Icon play/pause cố định ở tâm (không xoay) */}
        <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-white">
          {isPlaying ? (
            <Pause size={9} className="fill-current sm:hidden" />
          ) : (
            <Play size={9} className="ml-[1px] fill-current sm:hidden" />
          )}
          {isPlaying ? (
            <Pause size={11} className="hidden fill-current sm:block" />
          ) : (
            <Play size={11} className="ml-[1px] hidden fill-current sm:block" />
          )}
        </span>
      </button>
    </>
  );
}

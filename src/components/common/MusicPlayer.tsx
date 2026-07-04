import { useEffect, useRef } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import { useMusicStore } from "@/stores/musicStore";
import { cn } from "@/lib/cn";

interface MusicPlayerProps {
  src: string;
  className?: string;
}

export default function MusicPlayer({ src, className }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isPlaying, isMuted, volume, setPlaying, setMuted, setVolume, togglePlay, toggleMute } =
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
    <div className={cn("flex items-center gap-2", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        onClick={togglePlay}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-blush-400 text-white transition hover:bg-blush-500"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      <button
        onClick={toggleMute}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink/60 transition hover:bg-blush-50 hover:text-ink"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={isMuted ? 0 : volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="h-1 w-20 accent-blush-400"
        aria-label="Volume"
      />
    </div>
  );
}

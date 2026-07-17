import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { formatDate } from "@/utils/date";
import { useMusicStore } from "@/stores/musicStore";
import FallingLeaves from "@/components/common/FallingLeaves";

interface InvitationIntroProps {
  brideName: string;
  groomName: string;
  weddingDate: string;
  inviteeName?: string | null;
}

const CURTAIN = { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const };

// Nền xanh rừng đậm cho màn intro (kiểu vignette: sáng nhẹ ở giữa, tối dần ra
// mép). Dùng cho từng nửa rèm phủ full viewport nên hai nửa ghép liền mạch.
const GREEN_GRADIENT =
  "radial-gradient(circle at 50% 38%, #3f5f2b 0%, #294420 45%, #15300f 100%)";

export default function InvitationIntro({
  brideName,
  groomName,
  weddingDate,
  inviteeName,
}: InvitationIntroProps) {
  const [blooming, setBlooming] = useState(false);
  const [opening, setOpening] = useState(false);
  const [done, setDone] = useState(false);
  const [wide, setWide] = useState(false);
  const { setPlaying, setVolume } = useMusicStore();

  // scale là giá trị JS nên không theo breakpoint của Tailwind được. Màn hẹp thì
  // hoa vốn đã tràn ra ngoài, phóng mạnh nữa là bay khỏi màn hình nên phải nhẹ tay.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const bloomScale = wide ? 1.4 : 1.12;

  // Bấm "Mở thiệp": phát nhạc ở 50% (cú click là hành vi người dùng nên trình
  // duyệt cho phép autoplay), chạy hiệu ứng "nở" (tim lan tỏa + hoa hai bên to
  // dần ra), rồi sau ~1s mới mở rèm.
  const handleOpen = () => {
    if (blooming || opening) return;
    setVolume(0.5);
    setPlaying(true);
    setBlooming(true);
    window.setTimeout(() => setOpening(true), 700);
  };

  // Khoá cuộn nền khi màn intro còn hiển thị, và luôn bắt đầu từ đầu trang
  // (chặn trình duyệt khôi phục vị trí cuộn cũ khi F5).
  useEffect(() => {
    if (done) return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [done]);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Hai tấm rèm xanh chẻ dọc ở giữa và mở sang hai bên (mọi thiết bị).
          Mỗi nửa chứa một lớp gradient full viewport pin về đúng cạnh nên hai
          nửa ghép lại thành một nền xanh liền mạch. */}
      <motion.div
        className="absolute left-0 top-0 h-full w-1/2 overflow-hidden"
        style={{ backgroundColor: "#15300f" }}
        initial={{ x: 0 }}
        animate={{ x: opening ? "-101%" : 0 }}
        transition={CURTAIN}
      >
        <div
          className="absolute left-0 top-0 h-screen w-screen"
          style={{ background: GREEN_GRADIENT }}
        />
      </motion.div>
      <motion.div
        className="absolute right-0 top-0 h-full w-1/2 overflow-hidden"
        style={{ backgroundColor: "#15300f" }}
        initial={{ x: 0 }}
        animate={{ x: opening ? "101%" : 0 }}
        transition={CURTAIN}
        onAnimationComplete={() => {
          if (opening) setDone(true);
        }}
      >
        <div
          className="absolute right-0 top-0 h-screen w-screen"
          style={{ background: GREEN_GRADIENT }}
        />
      </motion.div>

      {/* Lá rơi phủ toàn màn, mờ dần khi mở thiệp. */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        <FallingLeaves />
      </motion.div>

      {/* Thẻ mời */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
        animate={{ opacity: opening ? 0 : 1, scale: opening ? 0.92 : 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="relative w-full max-w-sm">
          {/* Hoa trái: có sẵn từ đầu, bấm mở thiệp thì to dần ra phía ngoài
              (gốc phóng ở mép phải-dưới nên nó nở về hướng trái-trên). */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-2 left-0 z-20 w-[7.5rem] sm:w-48"
            style={{ transformOrigin: "bottom right" }}
            initial={{ opacity: 0, scale: 0.86, rotate: -8 }}
            animate={{ opacity: 0.5, scale: blooming ? bloomScale : 1, rotate: 0 }}
            transition={{
              duration: blooming ? 1.6 : 0.9,
              ease: [0.22, 1, 0.36, 1],
              delay: blooming ? 0 : 0.25,
            }}
          >
            <Image
              src="/images/flower.webp"
              alt=""
              width={260}
              height={260}
              className="h-auto w-full"
            />
          </motion.div>

          {/* Hoa phải: lật ngang cho đối xứng, gốc phóng ở mép trái-trên. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-2 right-0 z-20 w-[7.5rem] sm:w-48"
            style={{ transformOrigin: "top left" }}
            initial={{ opacity: 0, scale: 0.86, rotate: 8 }}
            animate={{ opacity: 0.5, scale: blooming ? bloomScale : 1, rotate: 0 }}
            transition={{
              duration: blooming ? 1.6 : 0.9,
              ease: [0.22, 1, 0.36, 1],
              delay: blooming ? 0.1 : 0.35,
            }}
          >
            <Image
              src="/images/flower.webp"
              alt=""
              width={260}
              height={260}
              className="h-auto w-full -scale-x-100"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="pointer-events-auto relative z-10 w-full rounded-3xl bg-cream/95 px-8 py-10 text-center shadow-2xl backdrop-blur-sm"
          >
          <div className="relative mx-auto mb-6 h-14 w-14">
            {/* Vòng lan tỏa khi bấm mở thiệp. */}
            {blooming &&
              [0, 0.45, 0.9].map((delay, i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-sage-500/60"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.6, opacity: 0 }}
                  transition={{
                    duration: 1.3,
                    delay,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              ))}
            <motion.div
              animate={blooming ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-700 text-cream"
            >
              <Heart className="h-6 w-6 fill-current" />
            </motion.div>
          </div>

          <h2 className="font-script text-4xl font-semibold leading-tight text-sage-700">
            <span className="block">{brideName}</span>
            <span className="my-1 block text-2xl font-normal text-gold">
              &amp;
            </span>
            <span className="block">{groomName}</span>
          </h2>

          <div className="mx-auto my-5 h-px w-20 bg-gold/50" />

          <p className="text-sm tracking-wide text-ink/70">
            {formatDate(weddingDate, "DD [tháng] M, YYYY")}
          </p>

          <p className="mt-5 text-xs uppercase tracking-[0.3em] text-gold">
            Thân mời
          </p>
          {inviteeName && (
            <p className="mt-1 font-script text-2xl text-sage-700">
              {inviteeName}
            </p>
          )}

          <button
            type="button"
            onClick={handleOpen}
            className="mt-7 rounded-full bg-sage-700 px-9 py-3 text-sm font-medium tracking-wide text-cream shadow-md transition hover:bg-sage-500"
          >
            Mở thiệp
          </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

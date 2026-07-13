import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { formatDate } from "@/utils/date";

interface InvitationIntroProps {
  brideName: string;
  groomName: string;
  weddingDate: string;
  coverImage: string;
  inviteeName?: string | null;
}

const CURTAIN = { duration: 1.1, ease: [0.76, 0, 0.24, 1] as const };

export default function InvitationIntro({
  brideName,
  groomName,
  weddingDate,
  coverImage,
  inviteeName,
}: InvitationIntroProps) {
  const [opening, setOpening] = useState(false);
  const [done, setDone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Web: rèm mở dọc (trái/phải). Điện thoại: trượt lên trên.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (done) return null;

  // Ảnh nền phủ đúng tỉ lệ (bg-cover). Mỗi tấm rèm là một khung cắt của cùng
  // một ảnh cỡ full viewport nên hai nửa ghép lại không bị bóp méo.
  const coverStyle = { backgroundImage: `url(${coverImage})` };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {isMobile ? (
        // Điện thoại: một tấm rèm trượt lên trên
        <motion.div
          className="absolute inset-0 overflow-hidden bg-ink"
          initial={{ y: 0 }}
          animate={{ y: opening ? "-101%" : 0 }}
          transition={CURTAIN}
          onAnimationComplete={() => {
            if (opening) setDone(true);
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={coverStyle}
          />
        </motion.div>
      ) : (
        // Web: hai tấm rèm mở dọc sang hai bên
        <>
          <motion.div
            className="absolute left-0 top-0 h-full w-1/2 overflow-hidden bg-ink"
            initial={{ x: 0 }}
            animate={{ x: opening ? "-101%" : 0 }}
            transition={CURTAIN}
          >
            <div
              className="absolute left-0 top-0 h-screen w-screen bg-cover bg-center opacity-30"
              style={coverStyle}
            />
          </motion.div>
          <motion.div
            className="absolute right-0 top-0 h-full w-1/2 overflow-hidden bg-ink"
            initial={{ x: 0 }}
            animate={{ x: opening ? "101%" : 0 }}
            transition={CURTAIN}
            onAnimationComplete={() => {
              if (opening) setDone(true);
            }}
          >
            <div
              className="absolute right-0 top-0 h-screen w-screen bg-cover bg-center opacity-30"
              style={coverStyle}
            />
          </motion.div>
        </>
      )}

      {/* Thẻ mời */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
        animate={{ opacity: opening ? 0 : 1, scale: opening ? 0.92 : 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="pointer-events-auto w-full max-w-sm rounded-3xl bg-cream/95 px-8 py-10 text-center shadow-2xl backdrop-blur-sm"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sage-700 text-cream">
            <Heart className="h-6 w-6 fill-current" />
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
            onClick={() => setOpening(true)}
            className="mt-7 rounded-full bg-sage-700 px-9 py-3 text-sm font-medium tracking-wide text-cream shadow-md transition hover:bg-sage-500"
          >
            Mở thiệp
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

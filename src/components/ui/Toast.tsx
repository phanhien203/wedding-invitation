import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ToastState {
  /** Đổi theo mỗi lần hiện để cùng một nội dung vẫn chạy lại được animation. */
  id: number;
  text: string;
  variant: "success" | "error";
}

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({
  toast,
  onDismiss,
  duration = 3500,
}: ToastProps) {
  // Giữ callback trong ref: nếu đưa thẳng vào deps, mỗi lần cha render lại là
  // timer bị đặt lại từ đầu và toast không bao giờ tự tắt.
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => dismiss.current(), duration);
    return () => window.clearTimeout(timer);
  }, [toast, duration]);

  const success = toast?.variant === "success";

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5",
            "rounded-full py-3 pl-4 pr-5 text-sm text-white shadow-lg",
            "sm:left-auto sm:right-6 sm:translate-x-0",
            success ? "bg-sage-700" : "bg-blush-500"
          )}
        >
          {success ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : (
            <XCircle size={18} className="shrink-0" />
          )}
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={onDismiss}
            className="ml-1 shrink-0 text-white/60 transition hover:text-white"
            aria-label="Đóng thông báo"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

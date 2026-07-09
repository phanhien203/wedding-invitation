import { useEffect, useState } from "react";
import { getCountdown } from "@/utils/date";

// Start from a fixed value so the server render and the first client render
// match (avoids a time-based hydration mismatch); the real countdown is
// filled in right after mount.
const INITIAL = { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };

export function useCountdown(targetDate: string) {
  const [countdown, setCountdown] = useState(INITIAL);

  useEffect(() => {
    setCountdown(getCountdown(targetDate));
    const timer = setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return countdown;
}

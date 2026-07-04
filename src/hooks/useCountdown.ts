import { useEffect, useState } from "react";
import { getCountdown } from "@/utils/date";

export function useCountdown(targetDate: string) {
  const [countdown, setCountdown] = useState(() => getCountdown(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return countdown;
}

import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export default function Container({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container-page", className)} {...props} />;
}

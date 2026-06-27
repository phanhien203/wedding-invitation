import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl border border-sage-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blush-300 focus:ring-2 focus:ring-blush-100",
            error && "border-blush-400 focus:border-blush-400 focus:ring-blush-100",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-blush-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import Button from "@/components/ui/Button";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = "Sao chép" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-1.5 whitespace-nowrap"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Đã sao chép" : label}
    </Button>
  );
}

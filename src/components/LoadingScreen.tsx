import { Loader2 } from "lucide-react";

export default function LoadingScreen({
  message = "Generating…",
}: {
  message?: string;
}) {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <div className="text-sm text-muted-foreground">{message}</div>
      </div>
    </div>
  );
}

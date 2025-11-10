import { Loader2 } from "lucide-react";

export default function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <div className="text-sm text-muted-foreground">{message}</div>
      </div>
    </div>
  );
}

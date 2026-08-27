import { LoaderCircle } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full">
        <LoaderCircle className="text-primary h-10 w-10" />
      </div>
    </div>
  );
}
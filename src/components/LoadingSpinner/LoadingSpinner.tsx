import { LoaderCircle } from "lucide-react";
interface ILoadingSpinnerProps{
  subtext?: string
}
export default function LoadingSpinner({subtext}:ILoadingSpinnerProps) {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 flex-col">
      <div className="animate-spin rounded-full">
        <LoaderCircle className="text-primary h-10 w-10" />
      </div>
      {subtext && <p className="text-sm text-slate-500">{subtext}</p>}
    </div>
  );
}
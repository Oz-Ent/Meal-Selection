import type { ReactNode } from "react";

export interface IModal {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: "center" | "bottom";
  showCloseButton?: boolean;
}
export interface IModal {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: "center" | "bottom";
  showCloseButton?: boolean;
}
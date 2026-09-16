import type { ReactNode } from 'react';
import Button from '../Button/Button';

interface ModalActionButtonProps {
  label: string;
  onClick?: () => void;
  icon?: ReactNode;
}

export default function ModalActionButton({ label, onClick, icon }: ModalActionButtonProps) {
  return (
    <Button
      variant="tertiary"
      fullWidth
      onClick={onClick}
      className="flex flex-row justify-between items-center w-full h-full py-4"
    >
      <p className="text-left flex-1">{label}</p>
      {icon}
    </Button>
  );
}

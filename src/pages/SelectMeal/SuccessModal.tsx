import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Modal from '../../components/Modal/Modal';
import MenuIllustration from '../../assets/Menu Illustration.svg';
import type { OverviewMeal } from './MealOverview';

export interface SuccessModalProps {
  selectedMeals?: Record<string, OverviewMeal>;
  targetName?: string;
  onClose?: () => void;
}

export function SuccessModal({ targetName, onClose }: SuccessModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    } else {
      navigate('/activities');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} variant="bottom" showCloseButton={true}>
      <div className="flex flex-col items-center text-center p-4 pt-2 w-full font-sans">
        {/* Burger Illustration */}
        <div className="flex justify-center my-4">
          <img
            src={MenuIllustration}
            alt="Meals Locked In"
            className="w-28 h-24 sm:w-32 sm:h-28 object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Meals Locked In!!</h2>

        {/* Subtitle */}
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-6">
          {targetName
            ? `Weekly selection for ${targetName} is submitted. You can update choices until the selection window closes.`
            : 'Your weekly selection is submitted. You can update choices until the selection window closes.'}
        </p>

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleClose}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer mb-2"
        >
          <ArrowRight size={18} />
          <span>Continue</span>
        </button>
      </div>
    </Modal>
  );
}

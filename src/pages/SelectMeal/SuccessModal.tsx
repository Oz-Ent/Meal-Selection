import Modal from '../../components/Modal/Modal';
import SuccessCuate from '../../assets/successcuate.svg';
import Button from '../../components/Button/Button';
import { useState } from 'react';
import { MealOverview, type OverviewMeal } from './MealOverview';
export function SuccessModal({ selectedMeals }: { selectedMeals: Record<string, OverviewMeal> }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMealOverviewOpen, setIsMealOverviewOpen] = useState(false);

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} variant={'bottom'}>
        <div className="flex flex-col items-center text-center h-[85vh] w-full">
          <img src={SuccessCuate} alt="Success" className="mt-17 mb-3" />
          <p className="text-[24px] font-semibold pb-3 text-msSuccessGreen">Successful</p>
          <p className="text-[16px] px-7">
            The meals you have chosen for the week has successfully been recorded.
          </p>
          <div className="w-full flex mt-8 px-4 h-13">
            <Button
              label={'View Your Meals For The Week'}
              onClick={() => {
                setIsOpen(false);
                setIsMealOverviewOpen(true);
              }}
            />
          </div>
        </div>
      </Modal>
      {isMealOverviewOpen && <MealOverview selectedMeals={selectedMeals} />}
    </>
  );
}

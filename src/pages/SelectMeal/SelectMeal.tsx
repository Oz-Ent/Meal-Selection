import { useState } from 'react';
import NavigationArrows from '../../components/NavigationArrows/NavigationArrows';
import ListCard from '../../components/ListCard/ListCard';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import { days } from '../../utils/Enums/DayOfWeek';
import { SuccessModal } from './SuccessModal';
import { availableMeals } from '../../helpers/availableMeals';
import { TitleBar } from '../../components/TitleBar/TitleBar';


export default function SelectMealPage() {
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

  
    const currentDay = days[currentDayIndex] ?? '';
    const daysLength = days.length;
    const currentSelection = selections[currentDay] || '';
    const currentCustomInput = customInputs[currentDay] || '';

    const handleNext = () => {
        if (currentDayIndex < daysLength - 1) {
            setCurrentDayIndex(prev => prev + 1);
        } else {
            setIsConfirmModalOpen(true);
        }
    };

    const handlePrev = () => {
        if (currentDayIndex > 0) {
            setCurrentDayIndex(prev => prev - 1);
        }
    };

    const handleSelectMeal = (id: string) => {
        setSelections(prev => ({ ...prev, [currentDay]: id }));
    };

    const handleCustomInputChange = (value: string) => {
        setCustomInputs(prev => ({ ...prev, [currentDay]: value }));
        if (selections[currentDay] !== 'custom') {
            setSelections(prev => ({ ...prev, [currentDay]: 'custom' }));
        }
    };

    const isNextDisabled = !currentSelection || (currentSelection === 'custom' && !currentCustomInput);

    return (
        <div className="min-h-screen bg-[#1c1c1e] text-white font-sans flex flex-col relative overflow-hidden max-w-md mx-auto">
            <div className="relative h-screen w-full shrink-0">
                <img src="/bg_burger_fries.png" alt="Burger and fries background" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-black/80"></div>
                <div className="absolute inset-0 pt-6.5 flex flex-col">    
               <TitleBar/>
                    <div className="mt-8">
                        <h1 className="text-[32px] font-bold leading-snug tracking-tight text-center">Choose Your Meals<br/>For The Week</h1>
                    </div>
                </div>
            </div>

            <Modal isOpen={true} onClose={() => {}} variant="bottom" showCloseButton={false}>
                <div className="p-2 flex flex-col text-black h-[60vh]">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                        <h3 className="text-[22px] font-bold text-gray-800">{currentDay}</h3>
                        <NavigationArrows 
                            prevDisabled={currentDayIndex === 0} 
                            nextDisabled={currentDayIndex === daysLength - 1} 
                            onPrevClick={handlePrev} 
                            onNextClick={handleNext} 
                            ariaSectionName="day navigation"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-0.5 mb-6 pr-2">
                        {availableMeals.map((meal) => (
                            <ListCard 
                                key={meal.id}
                                id={meal.id}
                                title={meal.title}
                                imageUrl={meal.imageUrl}
                                selectedValue={currentSelection}
                                inputType="radio"
                                onChange={handleSelectMeal}
                            />
                        ))}

                        <ListCard 
                            id="custom"
                            selectedValue={currentSelection}
                            inputType="radio"
                            onChange={handleSelectMeal}
                            isCustomInput={true}
                            customInputValue={currentCustomInput}
                            onCustomInputChange={handleCustomInputChange}
                            customInputPlaceholder="Enter your meal"
                        />
                    </div>

                    <div className="shrink-0 pt-2 h-13">
                        <Button 
                            label={currentDayIndex === daysLength - 1 ? "Confirm Menu" : "Next"} 
                            onClick={handleNext} 
                            disabled={isNextDisabled}
                            className={`w-full py-4 text-base font-semibold rounded-md transition-all shadow-md active:scale-[0.98] ${isNextDisabled ? 'bg-gray-200 text-gray-400 shadow-none' : 'bg-primary text-white hover:bg-primary/90'}`}
                        />
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} variant="center">
                <div className="p-2 flex flex-col items-center text-center w-82.5">
                    <h3 className="text-xl font-bold mb-2 text-gray-800 w-full text-left">Confirm Meal</h3>
                    <p className="text-gray-500 mb-6 text-sm leading-relaxed px-2">Please confirm that you are satisfied with your food choices for this week.</p>
                    <div className="flex gap-3 w-full items-center">
                        <Button label="Cancel" variant="ghost" onClick={() => setIsConfirmModalOpen(false)} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors "/>
                        <Button label="Confirm" variant="primary" onClick={() => { setIsConfirmModalOpen(false); setIsConfirmed(true) }} className="flex-1 bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md"/>
                    </div>
                </div>
            </Modal>
            {isConfirmed &&<SuccessModal selectedMeals={selections}/>}
        </div>
    );
}
import Modal from "../../components/Modal/Modal";
import { availableMeals } from "../../helpers/availableMeals";
import ListCard from "../../components/ListCard/ListCard";

export function MealOverview({ selectedMeals }: { selectedMeals: Record<string, string> }) {
    return <Modal isOpen={true} onClose={() => { }} variant={"bottom"}>
        <div className="h-[80vh] overflow-y-auto px-3 py-2">
            <div>
                <h2 className="text-[18px] font-semibold mb-2 text-msTextPrimary">My Meals For The Week</h2>
            </div>
            {Object.entries(selectedMeals).map(([day, meal]) => (
                <div>
                    <p className="text-[16px] font-medium mt-1 text-msTextPrimary">{day}</p>
                    <ListCard
                        title={availableMeals.find((item) => item.id === meal)?.title || ""}
                        imageUrl={availableMeals.find((item) => item.id === meal)?.imageUrl || ""}
                        id={day}
                        inputType="none"
                    />
                </div>
            ))}
        </div> 
    </Modal>
}
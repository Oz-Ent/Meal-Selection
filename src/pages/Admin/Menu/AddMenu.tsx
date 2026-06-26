import { useNavigate, useParams } from "react-router-dom";
import { NavBar } from "../../../components/NavBar/NavBar";
import {Plus} from "lucide-react";
import Button from "../../../components/Button/Button";
import Modal from "../../../components/Modal/Modal";
import { useState, type Dispatch, type SetStateAction } from "react";
import { availableMeals } from "../../../helpers/availableMeals";
import ListCard from "../../../components/ListCard/ListCard";
import StatusModal from "../../../components/StatusModal/StatusModal";

interface IMeals{
    id: string
    title: string
    imageUrl: string
}

interface IDayMenu{
    id: string
    title: string
    meals: IMeals[]
}
export function AddMenu(){
    const Navigate = useNavigate();
    const { menuName } = useParams<{ menuName: string }>();
    const [menuDays, setMenuDays] = useState<IDayMenu[]>([
        {
            id: "1",
            title: "Monday",
            meals: []
        },
        {
            id: "2",
            title: "Tuesday",
            meals: []
        },
        {
            id: "3",
            title: "Wednesday",
            meals: []
        },
        {
            id: "4",
            title: "Thursday",
            meals: []
        },
        {
            id: "5",
            title: "Friday",
            meals: []
        }
    ]);

    const handleSelectMeal =(dayId: string, action: SetStateAction<IMeals[]>)=>{
      setMenuDays((prevDays)=> prevDays.map((day)=>{
        if(day.id === dayId){
            const nextMeals = typeof action === "function"
            ? (action as (prevState: IMeals[]) => IMeals[])(day.meals)
            : action;
            return {...day, meals: nextMeals};
        }
        return day;
      }));
    }

    const [isMenuSaved, setIsMenuSaved] = useState<{isMenuSaved: boolean, success: boolean}>({isMenuSaved: false, success: false});
    const [saveFeedbackMessage, setSaveFeedbackMessage] = useState("");
    // const [unSelectedDaysReminder, setUnSelectedDaysReminder] = useState(false);
    const handleSaveMenu =()=>{
        if (!menuName) {
            setSaveFeedbackMessage("Unable to save because menu name is missing.");
            setIsMenuSaved({isMenuSaved: true, success: false});
            return;
        }

        const unselectedDays = menuDays
            .filter((day)=> day.meals.length === 0)
            .map((day)=> day.title);

        if(unselectedDays.length > 0){
            setSaveFeedbackMessage(`Please add meals for: ${unselectedDays.join(", ")}.`);
            setIsMenuSaved({isMenuSaved: true, success: false});
            return;
        }

        try {
            const menus = JSON.parse(localStorage.getItem("menus") || "{}");
            menus[menuName] = menuDays;
            localStorage.setItem("menus", JSON.stringify(menus));
            setSaveFeedbackMessage("Menu saved successfully!");
            setIsMenuSaved({isMenuSaved: true, success: true});
            // setUnSelectedDaysReminder(false);
            console.log("Saved Menu:", { [menuName]: menuDays });
        } catch {
            setSaveFeedbackMessage("Sorry, couldn't save menu. Try again.");
            setIsMenuSaved({isMenuSaved: true, success: false});
        }
    }

    return (
        <div className="relative flex flex-col h-screen">
           <NavBar title={menuName || "Add Menu"} backUrl="/admin/menu"/>
           {/* {unSelectedDaysReminder && menuDays.some((day)=> day.meals.length === 0) && <div className = " text-center p-5 text-red-500">{`Some days doesn't have meals: ${menuDays.filter((day)=> day.meals.length === 0).map((day)=> day.title).join(", ")}`}</div>} */}
           <div className="px-4 gap-4 flex-1 overflow-y-auto pb-16">
             {menuDays.map((day)=>(
               <AddMenuSection
               key={day.id}
                title={day.title}
                meals={day.meals}
                setMeals={(action)=> handleSelectMeal(day.id, action)}
                />
             ))}

           </div>
           <div className="h-13 absolute bottom-0 left-0 w-full px-2 py-1 bg-white z-10">
            <Button variant="primary" className="" onClick={handleSaveMenu} label="Save"/>
           </div>

          
            <StatusModal
                isOpen={isMenuSaved.isMenuSaved}
                status={isMenuSaved.success ? "success" : "error"}
                title={isMenuSaved.success ? "Success" : "Error"}
                message={saveFeedbackMessage}
                onClose={() => {
                    setIsMenuSaved({isMenuSaved: false, success: false});
                    if (isMenuSaved.success) {
                        Navigate("/admin/menu");
                    }
                }}
            />
        </div>
    )
}
interface IAddMenuSection {
    title: string;
    meals: IMeals[];
    setMeals: Dispatch<SetStateAction<IMeals[]>>;
}
function AddMenuSection({title, meals, setMeals }: IAddMenuSection) {
    const [openModal, setOpenModal] = useState(false);
    return (
   <><section className="border-b border-msListBorder pb-3 pt-1">
        <h4 className="text-msCardPrimaryText font-medium pb-1">{title}</h4>
      <div className="pb-3 pt-1">  {meals.length > 0 ?(
            meals.map((meal)=>(
                <ListCard
                key={meal.id}
                id={meal.id}
                title={meal.title}
                imageUrl={meal.imageUrl}
                inputType="delete"
                selectedValue={meals.map((meal)=> meal.id)}
                onChange={(mealId) => setMeals((prev) => prev.filter((m) => m.id !== mealId))}
                />
            ))
        ) : null}</div>
        <Button variant="none" className=" text-msDeepBlue flex cursor-pointer mt-1 items-center" onClick={()=>{setOpenModal(true)}}>
            <Plus className="stroke-msDeepBlue h-4 w-4"/> <span className="text-sm">Add Meal(s)</span>
        </Button>
    </section>
{openModal &&  <AddMealModal onClose={()=>{setOpenModal(false)}} meals={meals} setMeals={setMeals}/>}
    </>
    )
}
interface IAddMealModal{
    onClose: () => void
    meals: IMeals[]
    setMeals: Dispatch<SetStateAction<IMeals[]>>
}
function AddMealModal({ onClose, meals, setMeals }: IAddMealModal){
    const [tempMeals, setTempMeals] = useState<IMeals[]>(meals);

    const handleSelectMeal = (mealId:string)=>{
        if(tempMeals.some((meal)=> meal.id === mealId)){
            setTempMeals((prev)=> prev.filter((meal)=> meal.id !== mealId))
        }
        else {
            const findMeal = availableMeals.find((meal)=> meal.id === mealId);
            if(findMeal){
                setTempMeals((prev)=> [...prev, findMeal])
            }
        }
    }
    return (
        <Modal isOpen={true} variant="bottom" onClose={onClose} showCloseButton={true}>
            <div className="h-[90vh] flex flex-col relative pb-16">
                <h2 className="text-msTextPrimary font-semibold text-lg px-3 mb-2 shrink-0 pt-1">All Menu</h2>
                
                <div className="flex-1 overflow-y-auto pb-2">
                    {availableMeals.map((meal)=>{
                        return <ListCard 
                            key={meal.id}
                            id={meal.id}
                            title={meal.title}
                            imageUrl={meal.imageUrl}
                            inputType="checkbox"
                            selectedValue={tempMeals.map((meal)=> meal.id)}
                            onChange={handleSelectMeal}
                            highlightedColor="bg-msHighlightBlue"
                        />
                    })}
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-11 my-3 bg-white z-10">
                    <Button variant="primary" className="" onClick={() => {
                        setMeals(tempMeals);
                        onClose();           
                    }} label="Add"/>
                </div>
            </div>
        </Modal>
    )
}
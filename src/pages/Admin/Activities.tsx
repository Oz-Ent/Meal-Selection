import { Card } from "../../components/Card/Card";
import AllMenus from '../../assets/AllMenus.svg';
import AllMeals from '../../assets/AllMeals.svg';
import ChooseMeals from '../../assets/ChooseMeal.svg';
import Reports from '../../assets/Report.svg';
import { TitleBar } from '../../components/TitleBar/TitleBar';
import MealForeground from '../../assets/MealForeground.jpg';

export function Activities() {
    return <div className="h-full w-full">
        <section className="h-[30vh] relative">
            <img src={MealForeground} className="absolute inset-0 w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-black/80"></div>
            <div className="absolute inset-0 pt-6.5 pb-4 flex flex-col text-white">
                <TitleBar/>
                <div className="mt-auto">
                    <h1 className="text-[24px] font-medium leading-snug tracking-tight px-5">Manage and<br/>coordinate lunch effortlessly.</h1>
                </div>
            </div>
        </section>
        <section className="flex-1 gap-y-6 flex flex-col">
            <h3 className="text-msDeepBlue font-bold text-[18px] mx-4 mt-4 mb-[-6px]">Activities</h3>
        <Card
        type="activity"
        title="All Menus"
        description="Create and choose menu for the whole week."
        imageUrl={AllMenus}
        onButtonClick={() => {}}
        vertEllipsisIconAction={() => {}}
    />
    <Card
        type="activity"
        title="All Meals"
        description="View, add, edit and delete all meals."
        imageUrl={AllMeals}
        onButtonClick={() => {}}
        vertEllipsisIconAction={() => {}}
    />
        <Card
        type="activity"
        title="Choose Meals"
        description="Select meals you want to eat for the week."
        imageUrl={ChooseMeals}
        onButtonClick={() => {}}
        vertEllipsisIconAction={() => {}}
    />    <Card
        type="activity"
        title="Reports"
        description="View and export data from the app."
        imageUrl={Reports}
        onButtonClick={() => {}}
        vertEllipsisIconAction={() => {}}
    />
 </section>
    </div>
}
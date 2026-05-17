import Button from "../../components/Button/Button";
import InputField from "../../components/InputField/InputField";
import NavigationArrows from "../../components/NavigationArrows/NavigationArrows";
import SpinWheel from "../../components/SpinWheel/SpinWheel";

export default function HomePage() {
    const options =[
        {label:'Red' , value: ' 0'},
        {label:'Blue' , value: ' 1'},
        {label:'Green' , value: ' 2'},
    ]
    return (
        <div>
            <h1>Home Page</h1>
            <NavigationArrows prevDisabled={true} />
            <Button label="clickme"/>
            <InputField label="Trial" onChange={()=>{}} value={""} />

            <SpinWheel
            options={options}
            onSpinComplete={(value)=> console.log(value)}
            />
        </div>
    );
}
import Button from "../components/Button";  
import HeroImage from "../components/HeroImage";
import AuthLink from "../components/AuthLink";
import { useNavigate } from "react-router";


function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-6 justify-center px-4 overflow-hidden">
      <section className="w-full max-w-lg flex  flex-col gap-6  items-center justify-center text-center mx-auto">
        <HeroImage />

        <div className="flex flex-col gap-y-3">
        <h1 className="text-xl text-black font-semibold font-['Inter']">
          Welcome to Edziban 
        </h1>

        <p className="text-sky-950 text-base font-normal font-['Roboto']">
          Choose what you want to eat this week and see your tasty selections come to life. Let's get started!
        </p>
        </div>
      </section>

      <section className="w-full max-w-sm flex flex-col gap-4 font-normal mx-auto">
        <Button  text="Login" 
        onClick={() => navigate("/login")}  
        className= " w-full py-[14px] rounded-md text-base bg-[#254e65] text-white font-['Roboto'] "
        />
        <AuthLink text="Create an account" 
        onClick={() => {}} 
        className="text-sky-950 font-['Roboto']"
        />
      </section>
    </div>
  );
}

export default Welcome;
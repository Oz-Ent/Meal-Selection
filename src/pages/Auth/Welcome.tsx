import Button from "../../components/Button/Button";  
import HeroImage from "../../components/HeroImage/HeroImage";
import AuthLink from "../../components/AuthLink/AuthLink";
import { useNavigate } from "react-router";


function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-6 justify-center px-4 overflow-hidden items-center">
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

      <section className="w-full flex flex-col gap-4 font-normal px-4 max-w-sms">
        <div className="w-full h-12">
          <Button
            label="Login"
            variant="primary"
            onClick={() => navigate("/login")}
            className="rounded-md text-base font-['Roboto']"
          />
        </div>
        <AuthLink text="Create an account" 
        onClick={() => {}} 
        className="text-sky-950 font-['Roboto']"
        />
      </section>
    </div>
  );
}

export default Welcome;
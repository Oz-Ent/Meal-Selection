import { useState } from "react";
import Button from "../components/Button"; 
import InputField from "../components/InputField";
import PasswordField from "../components/PasswordField";
import Divider from "../components/Divider";
import AuthLink from "../components/AuthLink";
import GoogleButton from "../components/GoogleButton";
import Checkbox from "../components/Checkbox";  



function Login() {
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    if (email !== "test@email.com" || password !== "password123") {
      setError("Invalid email or password.");
      return;
    }
  };




  return (
    <div className="flex flex-col gap-6 font-normal">
      <section className= "flex flex-col gap-2">
      <h1 style={{ fontFamily: "Inter" }} className="text-3xl text-gray-700 font-semibold text-left">
        Login 
      </h1>
      <p  
      style={{ fontFamily: "Roboto" }} 
      className="text-[#313957] text-base font-normal text-left"> 
      Log in to choose your weekly meals. Create your ideal menu and make every meal a delight.
      </p>
       </section>

       <section className="flex flex-col gap-4">
        <InputField
        label = "Email"
        placeholder=" " 
         style={{ fontFamily: "Poppins", color: " rgba(58, 58, 58, 1)" }}
         id="Email"
         fontFamily= "Poppins"
         value={email}
         onChange={(e) => setEmail(e.target.value)}
         />

           
        <PasswordField 
        label = "Password"
         id="Password"
        style={{ fontFamily: "Poppins", color: " rgba(58, 58, 58, 1)" }}
        fontFamily = "Poppins"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
         />

         {error && (
          <p className="text-red-500 text-right text-xs">{error}</p>
          )}

        <AuthLink to="/forgot-password" className="text-xs text-right text-blue-600" text="Forgot Password?" onClick={() => {}} />
       </section>

       <section className="flex flex-col gap-8">
         <Checkbox
           label="Keep me signed in."
           checked={keepSignedIn}
           onChange={setKeepSignedIn}
         />

        <Button text="Login" 
        className= "w-full py-[14px] rounded-sm text-base "
        style={{ color: "white", fontFamily: "Roboto" }} 
        onClick={handleLogin}/>

        <Divider  label = "Or login with" />

        <GoogleButton style={{ backgroundColor: "rgba(237,237,237,1)", fontFamily: "Roboto" }} onClick={() => {}} />
        </section>

        <p className="text-sm text-gray-700 text-center">
         Don't have an account?{" "}
         <AuthLink to="/signup" className="text-blue-600" text="Sign up" onClick={() => {}} />
        </p>

    </div>
  );
}

export default Login;
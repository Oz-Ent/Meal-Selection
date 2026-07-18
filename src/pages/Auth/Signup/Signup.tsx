import { useState } from "react";
import Button from "../../../components/Button/Button"; 
import InputField from "../../../components/InputField/InputField";
import PasswordField from "../../../components/PasswordField/PasswordField";
import AuthLink from "../../../components/AuthLink/AuthLink";
import Checkbox from "../../../components/Checkbox/Checkbox";  



function Signup() {
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = () => {
    setError("");

    if (email !== "test@email.com" || password !== "password123") {
      setError("Invalid email or password.");
      return;
    }
  };




  return (
    <div className="flex flex-col gap-6 font-normal justify-center w-full max-w-100 h-full max-h-150 bg-white px-4 py-6">
      <section className= "flex flex-col gap-2">
      <h1 className="text-3xl text-gray-700 font-semibold text-left font-['Inter']">
        Sign Up
      </h1>
      <p className="text-msDescription text-base font-normal text-left font-['Roboto']"> 
      Sign up and start planning your weekly menu. Create your ideal menu in a breeze
      </p>
       </section>

       <section className="flex flex-col gap-4">
        <InputField
          label="Email"
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
         <InputField
          label="Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
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

        <div className="w-full h-12">
          <Button
            label="Sign Up"
            variant="primary"
            onClick={handleSignup}
            className="rounded-sm text-base font-['Roboto']"
          />
        </div>

        </section>

        <p className="text-sm text-gray-700 text-center">
         Already have an account?{" "}
         <AuthLink to="/login" className="text-blue-600" text="Login" onClick={() => {}} />
        </p>

    </div>
  );
}

export default Signup;
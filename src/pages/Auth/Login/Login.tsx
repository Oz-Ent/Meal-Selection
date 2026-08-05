import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button/Button"; 
import InputField from "../../../components/InputField/InputField";
import PasswordField from "../../../components/PasswordField/PasswordField";
import AuthLink from "../../../components/AuthLink/AuthLink";
import Checkbox from "../../../components/Checkbox/Checkbox";  
import { useLoginHandler } from "../LoginHandler/LoginHandler";


function Login() {
  const navigate = useNavigate();
  const handleLoginSubmit = useLoginHandler();
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await handleLoginSubmit(email, password, keepSignedIn);
      const roleName = response.user.roleName.toLowerCase();
      if (roleName === "admin" || roleName === "hr") {
        navigate("/admin/activities");
      } else {
        navigate("/activities");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };




  return (
    <div className="flex flex-col gap-6 font-normal justify-center w-full max-w-100 h-full max-h-150 bg-white px-4 py-6">
      <section className= "flex flex-col gap-2">
      <h1 className="text-3xl text-gray-700 font-semibold text-left font-['Inter']">
        Login 
      </h1>
      <p className="text-msDescription text-base font-normal text-left font-['Roboto']"> 
      Log in to choose your weekly meals. Create your ideal menu and make every meal a delight.
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
            label={isLoading ? "Logging in..." : "Login"}
            variant="primary"
            onClick={handleLogin}
            disabled={isLoading}
            className="rounded-sm text-base font-['Roboto']"
          />
        </div>
        </section>

        <p className="text-sm text-gray-700 text-center">
         Don't have an account?{" "}
         <AuthLink to="/signup" className="text-blue-600" text="Sign up" onClick={() => {}} />
        </p>

    </div>
  );
}

export default Login;
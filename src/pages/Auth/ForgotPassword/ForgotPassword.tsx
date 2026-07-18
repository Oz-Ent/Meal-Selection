import ForgetPasswordImage from "../../../assets/ForgetPassword.svg";
import { Link } from "react-router-dom";
import { NavBar } from "../../../components/NavBar/NavBar";

export function ForgotPassword() {
    return (
      <div className="w-full h-full">
        <NavBar backUrl="/login"/>
        <section className="flex flex-col gap-3 font-normal  items-center w-full min-h-screen mt-20 bg-white px-4 py-6">
            <img className="w-52 h-46.25" src={ForgetPasswordImage} alt="Forget Password" />
            <h3 className="text-2xl font-semibold text-msTextPrimary mt-2">Forgot Password?</h3>
            <p className="text-center text-msDescription w-[80%]">Choose your preferred method to reset password.</p>
            <Link to="/forgot-password/email" className="h-14.5 w-[90%] bg-white shadow-lg rounded-lg flex items-center justify-center text-sm font-medium text-msTextPrimary"> Continue with Email</Link>
        </section></div>
    )
}
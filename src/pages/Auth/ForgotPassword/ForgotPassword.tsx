import ForgetPasswordImage from '../../../assets/ForgetPassword.svg';
import { Link } from 'react-router-dom';
import { NavBar } from '../../../components/NavBar/NavBar';

export function ForgotPassword() {
  return (
    <div className="w-full min-h-screen bg-app-bg flex flex-col">
      <NavBar backUrl="/login" />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <section className="flex flex-col gap-4 items-center w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-center">
          <img
            className="w-48 h-auto max-h-44 object-contain"
            src={ForgetPasswordImage}
            alt="Forget Password"
          />
          <h3 className="text-2xl font-bold text-slate-800">Forgot Password?</h3>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            Choose your preferred method to reset password.
          </p>
          <Link
            to="/forgot-password/email"
            className="h-12 w-full bg-primary hover:bg-primary-hover text-white shadow-sm rounded-xl flex items-center justify-center text-sm font-semibold transition-all mt-2"
          >
            Continue with Email
          </Link>
        </section>
      </main>
    </div>
  );
}
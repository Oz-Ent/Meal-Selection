import { useNavigate } from "react-router-dom";
import SuccessImage from "../../../../assets/successcuate.svg";
import Button from "../../../../components/Button/Button";

export function ResetSuccess() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-app-bg flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center">
        <img className="w-56 h-auto max-h-52 object-contain" src={SuccessImage} alt="Password reset successful" />
        <h3 className="text-2xl font-bold text-primary mt-4">Successful</h3>
        <p className="text-center text-slate-500 text-sm max-w-xs mt-2 leading-relaxed">
          Your password has been reset successfully. Log in with your new password to continue.
        </p>

        <div className="w-full h-12 mt-8">
          <Button
            label="Back To Login"
            variant="primary"
            onClick={() => navigate("/login")}
            className="rounded-xl text-base font-medium font-['Roboto'] w-full shadow-sm hover:shadow transition-all"
          />
        </div>
      </div>
    </div>
  );
}


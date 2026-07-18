import { useNavigate } from "react-router-dom";
import SuccessImage from "../../../../assets/successcuate.svg";
import Button from "../../../../components/Button/Button";

export function ResetSuccess() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center max-w-md mx-auto px-4">
      <img className="w-60" src={SuccessImage} alt="Password reset successful" />
      <h3 className="text-2xl font-semibold text-msSuccessGreen mt-4">Successful</h3>
      <p className="text-center text-msDescription w-[80%] mt-2">
        Your password has been reset successfully. Log in with your new password to continue.
      </p>

      <div className="w-full h-12 mt-10">
        <Button
          label="Back To Login"
          variant="primary"
          onClick={() => navigate("/login")}
          className="rounded-sm text-base font-['Roboto']"
        />
      </div>
    </div>
  );
}

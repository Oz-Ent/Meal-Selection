import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ResetPasswordImage from "../../../../assets/Reset Password.svg";
import { NavBar } from "../../../../components/NavBar/NavBar";
import PasswordField from "../../../../components/PasswordField/PasswordField";
import Button from "../../../../components/Button/Button";

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const isDisabled = password.trim() === "" || confirmPassword.trim() === "";

  const handleReset = () => {
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    navigate("/forgot-password/success");
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <NavBar backUrl="/forgot-password/otp" />
      <section className="flex flex-col items-center w-full max-w-md mx-auto px-4 pt-4">
        <img className="w-52 h-46.25" src={ResetPasswordImage} alt="Reset Password" />
        <h3 className="text-2xl font-semibold text-msTextPrimary mt-2">Reset Password</h3>
        <p className="text-center text-msDescription w-[85%] mt-2">
          Set a new password to regain access to your account. It should be something you can
          remember easily.
        </p>

        <div className="w-full mt-8 flex flex-col gap-4">
          <PasswordField
            label="Password"
            id="new-password"
            fontFamily="Poppins"
            style={{ fontFamily: "Poppins", color: "rgba(58, 58, 58, 1)" }}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
          />
          <PasswordField
            label="Confirm Password"
            id="confirm-password"
            fontFamily="Poppins"
            style={{ fontFamily: "Poppins", color: "rgba(58, 58, 58, 1)" }}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError("");
            }}
          />
          {error && <p className="text-msWarningRed text-right text-xs">{error}</p>}
        </div>

        <div className="w-full h-12 mt-8">
          <Button
            label="Reset Password"
            variant="primary"
            disabled={isDisabled}
            onClick={handleReset}
            className="rounded-sm text-base font-['Roboto']"
          />
        </div>
      </section>
    </div>
  );
}

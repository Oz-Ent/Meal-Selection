import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ResetPasswordImage from "../../../../assets/Reset Password.svg";
import { NavBar } from "../../../../components/NavBar/NavBar";
import PasswordField from "../../../../components/PasswordField/PasswordField";
import Button from "../../../../components/Button/Button";
import { useResetPasswordMutation } from "../../../../api/useApiQueries";

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; token?: string } | undefined;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const resetPasswordMutation = useResetPasswordMutation();

  const isDisabled = password.trim() === "" || confirmPassword.trim() === "" || isLoading;

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!state?.email || !state?.token) {
      setError("Missing reset token or email. Please restart the process.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await resetPasswordMutation.mutateAsync({ email: state.email, password, token: state.token });
      navigate("/forgot-password/success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
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
            label={isLoading ? "Resetting..." : "Reset Password"}
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

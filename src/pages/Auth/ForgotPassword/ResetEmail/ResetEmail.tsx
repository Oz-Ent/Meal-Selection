import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailImage from "../../../../assets/Email.svg";
import { NavBar } from "../../../../components/NavBar/NavBar";
import InputField from "../../../../components/InputField/InputField";
import Button from "../../../../components/Button/Button";
import { useGeneratePasswordTokenMutation } from "../../../../api/useApiQueries";

export interface IResetEmailNavState {
  email: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ResetEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const generatePasswordTokenMutation = useGeneratePasswordTokenMutation();

  const isDisabled = email.trim() === "" || isLoading;

  const handleContinue = async () => {
    if (!EMAIL_REGEX.test(email)) {
      setError("Invalid email.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await generatePasswordTokenMutation.mutateAsync({ email });
      const state: IResetEmailNavState = { email };
      navigate("/forgot-password/otp", { state });
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <NavBar backUrl="/forgot-password" />
      <section className="flex flex-col items-center w-full max-w-md mx-auto px-4 pt-4">
        <img className="w-52 h-46.25" src={EmailImage} alt="Email" />
        <h3 className="text-2xl font-semibold text-msTextPrimary mt-2">Email</h3>
        <p className="text-center text-msDescription w-[80%] mt-2">
          Enter the email you would like to reset your password with.
        </p>

        <div className="w-full mt-8">
          <InputField
            label="Email"
            type="email"
            value={email}
            error={!!error}
            errorMessage={error}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
          />
        </div>

        <div className="w-full h-12 mt-8">
          <Button
            label={isLoading ? "Sending..." : "Continue"}
            variant="primary"
            disabled={isDisabled}
            onClick={handleContinue}
            className="rounded-sm text-base font-['Roboto']"
          />
        </div>
      </section>
    </div>
  );
}

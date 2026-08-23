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
    <div className="w-full min-h-screen bg-app-bg flex flex-col">
      <NavBar backUrl="/forgot-password" />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <section className="flex flex-col items-center w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-center">
          <img className="w-48 h-auto max-h-44 object-contain" src={EmailImage} alt="Email" />
          <h3 className="text-2xl font-bold text-slate-800 mt-2">Email</h3>
          <p className="text-center text-slate-500 text-sm max-w-xs mt-1 leading-relaxed">
            Enter the email you would like to reset your password with.
          </p>

          <div className="w-full mt-6 text-left">
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

          <div className="w-full h-12 mt-6">
            <Button
              label={isLoading ? "Sending..." : "Continue"}
              variant="primary"
              disabled={isDisabled}
              onClick={handleContinue}
              className="rounded-xl text-base font-medium font-['Roboto'] w-full shadow-sm hover:shadow transition-all"
            />
          </div>
        </section>
      </main>
    </div>
  );
}


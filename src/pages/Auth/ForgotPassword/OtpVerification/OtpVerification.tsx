import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OtpImage from "../../../../assets/OTP.svg";
import { NavBar } from "../../../../components/NavBar/NavBar";
import { OtpInput } from "../../../../components/OtpInput/OtpInput";
import Button from "../../../../components/Button/Button";
import {
  useGeneratePasswordTokenMutation,
  useVerifyOtpMutation,
} from "../../../../api/useApiQueries";

interface IOtpLocationState {
  email?: string;
}

const OTP_LENGTH = 8;

export function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as IOtpLocationState)?.email ?? "your email address";

  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const verifyOtpMutation = useVerifyOtpMutation();
  const generatePasswordTokenMutation = useGeneratePasswordTokenMutation();

  const isDisabled = otp.length < OTP_LENGTH || isLoading;

  const handleVerify = async () => {
    setError("");
    setIsLoading(true);
    try {
      await verifyOtpMutation.mutateAsync({ email, token: otp });
      navigate("/forgot-password/reset", { state: { email, token: otp } });
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccessMsg("");
    setOtp("");
    try {
      await generatePasswordTokenMutation.mutateAsync({ email });
      setSuccessMsg("OTP resent successfully.");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to resend OTP.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-app-bg flex flex-col">
      <NavBar backUrl="/forgot-password/email" />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <section className="flex flex-col items-center w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-center">
          <img className="w-48 h-auto max-h-44 object-contain" src={OtpImage} alt="OTP" />
          <h3 className="text-2xl font-bold text-slate-800 mt-2">OTP</h3>
          <p className="text-center text-slate-500 text-sm max-w-xs mt-1 leading-relaxed">
            We&apos;ve sent a code to your email address{" "}
            <span className="font-semibold text-slate-700">{email}</span>. Check your inbox and input the code.
          </p>

          <div className="w-full mt-6 flex flex-col items-center">
            <OtpInput
              length={OTP_LENGTH}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                if (error) setError("");
              }}
              hasError={!!error}
            />
            {error && <p className="text-red-500 text-center text-xs mt-2">{error}</p>}
            {successMsg && <p className="text-green-600 text-center text-xs mt-2">{successMsg}</p>}
          </div>

          <div className="w-full h-12 mt-6">
            <Button
              label={isLoading ? "Verifying..." : "Verify"}
              variant="primary"
              disabled={isDisabled}
              onClick={handleVerify}
              className="rounded-xl text-base font-medium font-['Roboto'] w-full shadow-sm hover:shadow transition-all"
            />
          </div>

          <p className="text-sm text-slate-600 text-center mt-4 flex items-center justify-center gap-1">
            Didn&apos;t receive code?{" "}
            <Button
              type="button"
              onClick={handleResend}
              className="text-primary font-semibold hover:underline"
              label="Resend"
            />
          </p>
        </section>
      </main>
    </div>
  );
}


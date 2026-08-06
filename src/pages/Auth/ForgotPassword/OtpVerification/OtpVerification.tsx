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
    <div className="w-full min-h-screen bg-white">
      <NavBar backUrl="/forgot-password/email" />
      <section className="flex flex-col items-center w-full max-w-md mx-auto px-4 pt-4">
        <img className="w-52 h-46.25" src={OtpImage} alt="OTP" />
        <h3 className="text-2xl font-semibold text-msTextPrimary mt-2">OTP</h3>
        <p className="text-center text-msDescription w-[85%] mt-2">
          We&apos;ve sent a code to your email address{" "}
          <span className="font-semibold">{email}</span>. Check your inbox and input the code.
        </p>

        <div className="w-full mt-8 flex flex-col items-center">
          <OtpInput
            length={OTP_LENGTH}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (error) setError("");
            }}
            hasError={!!error}
          />
          {error && <p className="text-msWarningRed text-center text-xs mt-2">{error}</p>}
          {successMsg && <p className="text-green-500 text-center text-xs mt-2">{successMsg}</p>}
        </div>

        <div className="w-full h-12 mt-8">
          <Button
            label={isLoading ? "Verifying..." : "Verify"}
            variant="primary"
            disabled={isDisabled}
            onClick={handleVerify}
            className="rounded-sm text-base font-['Roboto']"
          />
        </div>

        <p className="text-sm text-msTextPrimary text-center mt-4 flex items-center gap-1">
          Didn&apos;t receive code?{" "}
          <Button
            type="button"
            onClick={handleResend}
            className="text-msDeepBlue font-medium hover:opacity-80"
            label="Resend"
          />
        </p>
      </section>
    </div>
  );
}

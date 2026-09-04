import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../../components/Button/Button';
import InputField from '../../../components/InputField/InputField';
import PasswordField from '../../../components/PasswordField/PasswordField';
import AuthLink from '../../../components/AuthLink/AuthLink';
import Checkbox from '../../../components/Checkbox/Checkbox';

import { useLoginHandler } from '../LoginHandler/LoginHandler';
import {
  useOnboardingMutation,
  useRegisterMutation,
} from '../../../api/useApiQueries';

import AppIcon from '../../../assets/App Icon.svg';
import bro from '../../../assets/bro.svg';
import { OtpInput } from '../../../components/OtpInput/OtpInput';
import { EMAIL_REGEX, PASSWORD_REGEX, TOKEN_REGEX } from '../../../helpers/regex';
import { isAdminRole } from '../../../utils/Enums/Role';

type Errors = {
  email?: string;
  password?: string;
  token?: string;
  api?: string;
};

const validate = (
  email: string,
  password: string,
  token: string,
): Errors => {
  const errors: Errors = {};

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please enter a valid supported email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.password =
      'Password must contain 8+ characters, uppercase, lowercase, number and special character.';
  }

  if (!token) {
    errors.token = 'OTP is required.';
  } else if (!TOKEN_REGEX.test(token)) {
    errors.token = 'OTP must be exactly 6 letters or numbers.';
  }

  return errors;
};

function Signup() {
  const navigate = useNavigate();
  const handleLoginSubmit = useLoginHandler();

  const onboardingMutation = useOnboardingMutation();
  const registerMutation = useRegisterMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  const [isLoading, setIsLoading] = useState(false);

  /*
   * Validation is always calculated,
   * but isn't displayed until the user submits once.
   */
  const formErrors = useMemo(
    () => validate(email, password, token),
    [email, password, token],
  );

  const visibleErrors = hasSubmitted ? formErrors : {};

  const isFormValid = Object.keys(formErrors).length === 0;

  const cooldown = Math.max(
    0,
    Math.ceil((cooldownUntil - now) / 1000),
  );

  /*
   * OTP countdown
   */
  useEffect(() => {
    if (!cooldownUntil) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  /*
   * Update a field and clear its previous API/field error.
   */
  const updateField = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
    field: keyof Errors,
  ) => {
    setter(value);

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      api: undefined,
    }));
  };

  /*
   * Request OTP
   */
  const handleRequestOtp = async () => {
    const emailError = validate(email, '', '').email;

    if (emailError) {
      setErrors((prev) => ({
        ...prev,
        email: emailError,
      }));

      return;
    }

    if (cooldown > 0 || onboardingMutation.isPending) return;

    try {
      await onboardingMutation.mutateAsync({
        email: email.trim(),
      });

      const expiry = Date.now() + 60_000;

      setCooldownUntil(expiry);
      setNow(Date.now());

      setErrors((prev) => ({
        ...prev,
        email: undefined,
        api: undefined,
      }));
    } catch (error: unknown) {
      setErrors((prev) => ({
        ...prev,
        api:
          error instanceof Error
            ? error.message
            : 'Failed to send OTP.',
      }));
    }
  };

  /*
   * Submit registration
   */
  const handleSignup = async () => {
    setHasSubmitted(true);

    if (!isFormValid) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await registerMutation.mutateAsync({
        email: email.trim(),
        password,
        token,
      });

      const response = await handleLoginSubmit(
        email.trim(),
        password,
        keepSignedIn,
      );

      navigate(
        isAdminRole(response.user)
          ? '/admin/activities'
          : '/activities',
      );
    } catch (error: unknown) {
      setErrors({
        api:
          error instanceof Error
            ? error.message
            : 'Failed to register. Invalid OTP or details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-linear-to-br from-slate-50 via-slate-100/60 to-slate-200/50">
      <div className="w-full max-w-md lg:max-w-4xl bg-white rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* Branding */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary via-primary-hover to-secondary p-10 text-white relative overflow-hidden">

          <div className="flex items-center gap-2.5">
            <img
              src={AppIcon}
              alt="Edziban"
              className="h-8 w-8 object-contain"
            />

            <span className="text-lg font-bold">
              Edziban
            </span>
          </div>

          <div className="my-auto py-8 flex flex-col items-center text-center">
            <img
              src={bro}
              alt="Welcome"
              className="w-64 h-auto max-h-56 object-contain drop-shadow-lg mb-6"
            />

            <h2 className="text-2xl font-bold">
              Join Edziban Today
            </h2>

            <p className="mt-3 text-sm text-slate-200 max-w-xs leading-relaxed">
              Create your account to start planning your weekly menu,
              customize presets, and enjoy stress-free dining.
            </p>
          </div>

          <div className="text-xs text-emerald-200/80">
            © {new Date().getFullYear()} Edziban Meal Planning System
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col justify-center gap-5 p-6 sm:p-10">

          {/* Header */}
          <section>
            <div className="lg:hidden flex items-center gap-2 mb-2">
              <img
                src={AppIcon}
                alt="Edziban"
                className="h-7 w-7 object-contain"
              />

              <span className="font-bold text-slate-700">
                Edziban
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl text-gray-800 font-semibold">
              Sign Up
            </h1>

            <p className="text-msDescription text-sm sm:text-base">
              Sign up and start planning your weekly menu with ease.
            </p>
          </section>

          {/* Form Fields */}
          <section className="flex flex-col gap-5">

            {/* Email */}
            <InputField
              label="Email"
              type="email"
              error={!!visibleErrors.email}
              errorMessage={visibleErrors.email}
              value={email}
              onChange={(e) =>
                updateField(
                  setEmail,
                  e.target.value,
                  'email',
                )
              }
            />

            {/* Password */}
            <PasswordField
              label="Password"
              id="Password"
              error={!!visibleErrors.password}
              errorMessage={visibleErrors.password}
              value={password}
              onChange={(e) =>
                updateField(
                  setPassword,
                  e.target.value,
                  'password',
                )
              }
            />

            {/* OTP */}
          <OtpInput
            length={6}
            value={token}
            hasError={!!visibleErrors.token}
            errorMessage={visibleErrors.token}
            handleRequestOTP={handleRequestOtp}
            isPending={onboardingMutation.isPending}
            requestLabel="Request OTP"
            requestCooldown={cooldown}
            onChange={(value) =>
              updateField(setToken, value, 'token')
            }
          />
          <p className='text-xs text-slate-400 text-left'>OTP expires in 1 hour after request.</p>
          {/* API Error */}
          {errors.api && (
            <p className="text-red-500 text-xs text-left">
              {errors.api}
            </p>
          )}
          </section>

          {/* Actions */}
          <section className="flex flex-col gap-5">

            <Checkbox
              label="Keep me signed in."
              checked={keepSignedIn}
              onChange={setKeepSignedIn}
            />

          <Button
            label={isLoading ? 'Signing up...' : 'Sign Up'}
            variant="primary"
            onClick={handleSignup}
            disabled={!isFormValid || isLoading}
          />
          </section>
          
          {/* Login */}
          <p className="text-sm text-gray-600 text-center">
            Already have an account?{' '}
            <AuthLink
              to="/login"
              className="text-primary hover:text-primary-hover font-bold hover:underline inline"
              text="Login"
              onClick={() => {}}
            />

            {/* Forgot Password */}
            <AuthLink
              to="/forgot-password"
              className="text-primary hover:text-primary-hover font-bold hover:underline"
              text="Forgot Password?"
              onClick={() => {}}
            />
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
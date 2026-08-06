import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/InputField/InputField';
import PasswordField from '../../../components/PasswordField/PasswordField';
import AuthLink from '../../../components/AuthLink/AuthLink';
import Checkbox from '../../../components/Checkbox/Checkbox';
import { useLoginHandler } from '../LoginHandler/LoginHandler';
import { useOnboardingMutation, useRegisterMutation } from '../../../api/useApiQueries';

function Signup() {
  const navigate = useNavigate();
  const handleLoginSubmit = useLoginHandler();
  const onboardingMutation = useOnboardingMutation();
  const registerMutation = useRegisterMutation();
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNoTokenChange = async (checked: boolean) => {
    setNoToken(checked);
    setError('');
    setSuccessMsg('');
    if (checked) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address first.');
        setNoToken(false);
        return;
      }
      try {
        await onboardingMutation.mutateAsync({ email });
        setSuccessMsg('Token sent! Please check your email.');
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Failed to send token.');
        setNoToken(false);
      }
    }
  };

  const handleSignup = async () => {
    setError('');
    setSuccessMsg('');

    if (!email || !password || !token) {
      setError('Email, password, and token are required.');
      return;
    }

    setIsLoading(true);
    try {
      await registerMutation.mutateAsync({ email, password, token });
      const response = await handleLoginSubmit(email, password, keepSignedIn);
      const roleName = response.user.roleName.toLowerCase();
      if (roleName === 'admin' || roleName === 'hr') {
        navigate('/admin/activities');
      } else {
        navigate('/activities');
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'Failed to register. Invalid token or details.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-normal justify-center w-full max-w-100 h-full max-h-150 bg-white px-4 py-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl text-gray-700 font-semibold text-left font-['Inter']">Sign Up</h1>
        <p className="text-msDescription text-base font-normal text-left font-['Roboto']">
          Sign up and start planning your weekly menu. Create your ideal menu in a breeze
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <InputField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <PasswordField
          label="Password"
          id="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputField label="Token" value={token} onChange={(e) => setToken(e.target.value)} />

        {error && <p className="text-red-500 text-right text-xs">{error}</p>}
        {successMsg && <p className="text-green-500 text-right text-xs">{successMsg}</p>}

        <AuthLink
          to="/forgot-password"
          className="text-xs text-right text-blue-600"
          text="Forgot Password?"
          onClick={() => {}}
        />
      </section>

      <section className="flex flex-col gap-8">
        <Checkbox label="I don't have a token." checked={noToken} onChange={handleNoTokenChange} />
        <Checkbox label="Keep me signed in." checked={keepSignedIn} onChange={setKeepSignedIn} />

        <div className="w-full h-12">
          <Button
            label={isLoading ? 'Signing up...' : 'Sign Up'}
            variant="primary"
            onClick={handleSignup}
            disabled={isLoading}
            className="rounded-sm text-base font-['Roboto']"
          />
        </div>
      </section>

      <p className="text-sm text-gray-700 text-center">
        Already have an account?{' '}
        <AuthLink to="/login" className="text-blue-600" text="Login" onClick={() => {}} />
      </p>
    </div>
  );
}

export default Signup;

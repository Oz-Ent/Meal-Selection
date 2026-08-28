import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/InputField/InputField';
import PasswordField from '../../../components/PasswordField/PasswordField';
import AuthLink from '../../../components/AuthLink/AuthLink';
import Checkbox from '../../../components/Checkbox/Checkbox';
import { useLoginHandler } from '../LoginHandler/LoginHandler';
import AppIcon from '../../../assets/App Icon.svg';
import bro from '../../../assets/bro.svg';

function Login() {
  const navigate = useNavigate();
  const handleLoginSubmit = useLoginHandler();
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await handleLoginSubmit(email, password, keepSignedIn);
      const roleName = response.user.roleName.toLowerCase();
      if (roleName === 'admin' || roleName === 'hr') {
        navigate('/admin/activities');
      } else {
        navigate('/activities');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-linear-to-br from-slate-50 via-slate-100/60 to-slate-200/50">
      <div className="w-full max-w-md lg:max-w-4xl bg-white rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left Branding Showcase (Visible on lg screens) */}
        <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-primary via-primary-hover to-secondary p-10 text-white relative overflow-hidden">
          <div className="flex items-center gap-2.5 z-10">
            <img src={AppIcon} alt="Edziban" className="h-8 w-8 object-contain" />
            <span className="text-lg font-bold tracking-tight text-white">Edziban</span>
          </div>

          <div className="my-auto py-8 flex flex-col items-center text-center z-10">
            <img src={bro} alt="Welcome" className="w-64 h-auto max-h-56 object-contain drop-shadow-lg mb-6" />
            <h2 className="text-2xl font-bold font-['Inter'] leading-snug">
              Delightful Meals,<br />Simplified Daily
            </h2>
            <p className="mt-3 text-sm text-slate-200 font-['Roboto'] max-w-xs leading-relaxed">
              Explore custom menus, make your weekly choices in seconds, and track meal schedules seamlessly.
            </p>
          </div>

          <div className="text-xs text-emerald-200/80 font-['Roboto'] z-10">
            © {new Date().getFullYear()} Edziban Meal Planning System
          </div>

          {/* Subtle decorative background circles */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
        </div>

        {/* Right Form Pane */}
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-10">
          <section className="flex flex-col gap-2">
            <div className="lg:hidden flex items-center gap-2 mb-2">
              <img src={AppIcon} alt="Edziban" className="h-7 w-7 object-contain" />
              <span className="text-base font-bold text-slate-700">Edziban</span>
            </div>
            <h1 className="text-2xl sm:text-3xl text-gray-800 font-semibold text-left font-['Inter']">Login</h1>
            <p className="text-msDescription text-sm sm:text-base font-normal text-left font-['Roboto']">
              Log in to choose your weekly meals. Create your ideal menu and make every meal a delight.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <PasswordField
              label="Password"
              id="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-right text-xs">{error}</p>}

            <AuthLink
              to="/forgot-password"
              className="text-xs text-right text-primary hover:text-primary-hover hover:underline"
              text="Forgot Password?"
              onClick={() => {}}
            />
          </section>

          <section className="flex flex-col gap-6 sm:gap-8">
            <Checkbox label="Keep me signed in." checked={keepSignedIn} onChange={setKeepSignedIn} />

            <div className="w-full h-12">
              <Button
                label={isLoading ? 'Logging in...' : 'Login'}
                variant="primary"
                onClick={handleLogin}
                disabled={isLoading}
                className="rounded-xl text-base font-medium font-['Roboto'] w-full shadow-sm hover:shadow transition-all"
              />
            </div>
          </section>

          <p className="text-sm text-gray-600 text-center">
            Don't have an account?{' '}
            <AuthLink to="/signup" className="text-primary hover:text-primary-hover font-bold hover:underline inline" text="Sign up" onClick={() => {}} />
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;


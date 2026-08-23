import Button from '../../components/Button/Button';
import HeroImage from '../../components/HeroImage/HeroImage';
import AuthLink from '../../components/AuthLink/AuthLink';
import { useNavigate } from 'react-router';
import AppIcon from '../../assets/App Icon.svg';

function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-linear-to-br from-slate-50 via-slate-100/60 to-slate-200/50">
      <div className="w-full max-w-md lg:max-w-lg bg-white rounded-3xl p-6 sm:p-10 shadow-[0_15px_50px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-2">
          <img src={AppIcon} alt="Edziban" className="h-9 w-9 object-contain" />
          <span className="text-xl font-bold text-slate-800 tracking-tight">Edziban</span>
        </div>

        <section className="w-full flex flex-col gap-5 items-center justify-center text-center">
          <div className="max-w-xs sm:max-w-sm">
            <HeroImage />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl text-slate-900 font-bold font-['Inter']">
              Welcome to Edziban
            </h1>

            <p className="text-slate-600 text-sm sm:text-base font-normal font-['Roboto'] max-w-sm leading-relaxed">
              Choose what you want to eat this week and see your tasty selections come to life. Let's get started!
            </p>
          </div>
        </section>

        <section className="w-full flex flex-col gap-4 font-normal mt-2">
          <div className="w-full h-12">
            <Button
              label="Login"
              variant="primary"
              onClick={() => navigate('/login')}
              className="rounded-xl text-base font-medium font-['Roboto'] w-full shadow-sm hover:shadow transition-all"
            />
          </div>
          <AuthLink
            to="/signup"
            text="Create an account"
            onClick={() => {}}
            className="text-primary hover:text-primary-hover font-semibold font-['Roboto'] hover:underline text-sm"
          />
        </section>
      </div>
    </div>
  );
}

export default Welcome;
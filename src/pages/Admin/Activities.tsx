import { BottomNavbar } from '../../components/BottomNavbar/BottomNavbar';

import chefIcon from '../../assets/admin/ChefOnAdminCard.svg';
import burgerIcon from '../../assets/admin/BurgeronAdminCard.svg';
import { useAuth } from '../Auth/useAuth/useAuth';
import { TitleBar } from '../../components/TitleBar/TitleBar';
import MenuCard from '../../components/MenuCard/MenuCard';
import { adminActivitiesConfig } from '../../config/activitiesConfig';


export function Activities() {
  const { profile } = useAuth();
  const userName = profile?.user?.name ? profile.user.name.split(' ')[0] : 'Admin';



  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-app-bg pb-28 text-text-primary font-sans">
      <TitleBar />

      <div className="px-4 sm:px-6 pt-4 flex flex-col gap-5">
        {/* Welcome Banner Card */}
        <section className="w-full">
          <div className="relative flex min-h-32 sm:min-h-40 items-center justify-between rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs overflow-hidden">
            <div className="flex flex-col justify-center max-w-[210px] sm:max-w-md">
              <h1 className="text-lg sm:text-2xl font-bold text-text-primary leading-snug">
                Welcome, {userName} 👋
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-relaxed">
                Manage weekly menus, track meals, and oversee daily hub food operations.
              </p>
            </div>

            {/* Banner Graphic */}
            <div className="relative h-24 w-28 sm:h-36 sm:w-40 shrink-0">
              <img
                src={burgerIcon}
                alt="Burger"
                className="absolute bottom-0 right-0 h-16 sm:h-24 w-auto object-contain"
              />
              <img
                src={chefIcon}
                alt="Chef"
                className="absolute top-0 right-2 h-18 sm:h-28 w-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Activities Grid Section */}
        <section className="w-full">
          <h2 className="mb-3 text-base font-bold text-text-primary">Activities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {adminActivitiesConfig.map((activity) => (
              <MenuCard
                key={activity.id}
                label={activity.title}
                subtitle={activity.description}
                icon={activity.image}
                path={activity.path}
              />
            ))}
          </div>
        </section>
      </div>

      <BottomNavbar activeTab="admin" />
    </main>
  );
}

export default Activities;

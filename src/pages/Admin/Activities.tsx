import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { BottomNavbar } from '../../components/BottomNavbar/BottomNavbar';
import { LogoutConfirmModal } from '../Account/components/LogoutConfirmModal';
import AppIcon from '../../assets/App Icon.svg';
import menuIcon from '../../assets/admin/menu.svg';
import mealIcon from '../../assets/admin/meal.svg';
import reportIcon from '../../assets/admin/AdminReport.svg';
import foodAssignmentIcon from '../../assets/admin/FoodAssignment.svg';
import chefIcon from '../../assets/admin/ChefOnAdminCard.svg';
import burgerIcon from '../../assets/admin/BurgeronAdminCard.svg';
import { useAuth } from '../Auth/useAuth/useAuth';

export function Activities() {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  let userName = 'Admin';
  try {
    const { profile } = useAuth();
    if (profile?.user?.name) {
      userName = profile.user.name.split(' ')[0];
    }
  } catch {
    // Fallback if rendered without AuthContext provider
  }

  const activities = [
    {
      id: 'menus',
      title: 'Menus',
      description: 'Create custom menus and schedule them for your weekly meal planning.',
      image: menuIcon,
      path: '/admin/menu',
    },
    {
      id: 'meals',
      title: 'Meals',
      description: 'Create and manage the master library of dishes used to build your menus.',
      image: mealIcon,
      path: '/admin/meal',
    },
    {
      id: 'food-assignment',
      title: 'Food Assignment',
      description: 'Log arrived deliveries and distribute meals to assigned users for today.',
      image: foodAssignmentIcon,
      path: '/admin/selection-activity',
    },
    {
      id: 'mark-holidays',
      title: 'Mark Holidays',
      description: 'Schedule and manage company holidays and view public holiday closures.',
      image: reportIcon,
      path: '/admin/holidays',
    },
    {
      id: 'selection-status',
      title: 'Selection Status',
      description: 'Track users pending meal choices and toggle weekly selection closure.',
      image: reportIcon,
      path: '/admin/selection-status',
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-app-bg pb-28 text-text-primary font-sans">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <img src={AppIcon} alt="App Icon" className="h-8 w-8 object-contain" />
          <span className="text-base font-bold tracking-tight text-slate-800">Edziban</span>
        </div>
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          aria-label="Log out"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
        </button>
      </header>

      <div className="px-4 sm:px-6 pt-4 flex flex-col gap-5">
        {/* Welcome Banner Card */}
        <section className="w-full">
          <div className="relative flex min-h-32 sm:min-h-40 items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-xs overflow-hidden">
            <div className="flex flex-col justify-center max-w-[210px] sm:max-w-md">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug">
                Welcome, {userName} 👋
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Manage weekly menus, track meals, and oversee daily hub food operations.
              </p>
            </div>

            {/* Banner Graphic (3D Chef on Burger) */}
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
            {activities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => navigate(activity.path)}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-3 sm:p-4 text-left shadow-2xs transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
              >
                <div className="w-full overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="h-24 sm:h-28 w-full object-contain rounded-xl"
                  />
                </div>
                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{activity.title}</h3>
                    <p className="mt-1 text-[11px] sm:text-xs leading-tight text-slate-500">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      <BottomNavbar activeTab="admin" />
    </main>
  );
}

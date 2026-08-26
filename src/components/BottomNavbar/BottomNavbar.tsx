import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../pages/Auth/useAuth/useAuth';
import { Contact, History, Home, UserRound, type LucideIcon } from 'lucide-react';

export type NavTab = 'home' | 'admin' | 'history' | 'account';

interface BottomNavbarProps {
  activeTab: NavTab;
}

interface NavItemConfig {
  id: NavTab;
  label: string;
  path: string;
  icon: LucideIcon;
}

export function BottomNavbar({ activeTab }: BottomNavbarProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const role = profile?.user?.roleName?.toLowerCase();
  const isAdminOrHr = role === 'admin' || role === 'hr';

  const handleNavigation = (tab: NavTab, path: string) => {
    if (activeTab !== tab) {
      navigate(path);
    }
  };

  const navItems: NavItemConfig[] = [
    { id: 'home', label: 'Home', path: '/activities', icon: Home },
    ...(isAdminOrHr
      ? [{ id: 'admin' as NavTab, label: 'Admin', path: '/admin/activities', icon: Contact }]
      : []),
    { id: 'history', label: 'History', path: '/history', icon: History },
    { id: 'account', label: 'Account', path: '/account', icon: UserRound },
  ];

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md md:max-w-xl -translate-x-1/2 items-center justify-between border-t border-slate-100 bg-white/95 backdrop-blur-md px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:rounded-t-2xl md:border-x"
    >
      {navItems.map(({ id, label, path, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => handleNavigation(id, path)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-xs select-none transition-colors cursor-pointer ${
              isActive ? 'font-bold text-primary' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon
              className="w-5 h-5 shrink-0 transition-all duration-150"
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <span className="leading-none">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

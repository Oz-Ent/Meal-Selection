import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../pages/Auth/useAuth/useAuth';
import {
  getBottomNavItemsForRole,
  type NavigationItemConfig,
  type NavItemId,
} from '../../config/navigationConfig';

export type NavTab = NavItemId | 'home' | 'admin' | 'budget' | 'history' | 'feedback' | 'account' | string;

interface BottomNavbarProps {
  activeTab: NavTab;
  /** Optional custom items to override or extend default navigation configuration */
  items?: readonly NavigationItemConfig[] | NavigationItemConfig[];
}

export function BottomNavbar({ activeTab, items }: BottomNavbarProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const role = profile?.user?.roleName ?? profile?.user?.roleId;

  const handleNavigation = (tab: NavTab, path: string) => {
    if (activeTab !== tab) {
      navigate(path);
    }
  };

  const navItems = items ? items : getBottomNavItemsForRole(role);

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md md:max-w-xl -translate-x-1/2 items-center justify-between border-t border-border bg-surface/95 backdrop-blur-md px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:rounded-t-2xl md:border-x transition-colors"
    >
      {navItems.map(({ id, name, href, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => handleNavigation(id as NavTab, href)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-xs select-none transition-colors cursor-pointer ${
              isActive ? 'font-bold text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon
              className="w-5 h-5 shrink-0 transition-all duration-150"
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <span className="leading-none">{name}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNavbar;

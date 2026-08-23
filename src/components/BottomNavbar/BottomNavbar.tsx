import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../pages/Auth/useAuth/useAuth';

export type NavTab = 'home' | 'admin' | 'history' | 'account';

interface BottomNavbarProps {
  activeTab: NavTab;
}

function HomeIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path
          d="M12 2.5L2.5 10V20.5C2.5 21.0523 2.94772 21.5 3.5 21.5H9V15.5C9 14.3954 9.89543 13.5 11 13.5H13C14.1046 13.5 15 14.3954 15 15.5V21.5H20.5C21.0523 21.5 21.5 21.0523 21.5 20.5V10L12 2.5Z"
          fill="var(--color-primary)"
          stroke="var(--color-primary)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M12 2.5L2.5 10V20.5C2.5 21.0523 2.94772 21.5 3.5 21.5H9V15.5C9 14.3954 9.89543 13.5 11 13.5H13C14.1046 13.5 15 14.3954 15 15.5V21.5H20.5C21.0523 21.5 21.5 21.0523 21.5 20.5V10L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function AdminIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <circle cx="11" cy="13" r="8" fill="var(--color-primary)" stroke="var(--color-primary)" strokeWidth="1.8" />
        <circle cx="11" cy="10" r="2.5" fill="white" />
        <path
          d="M 6.2 17.5 C 6.2 14.8 8.3 13.2 11 13.2 C 13.7 13.2 15.8 14.8 15.8 17.5 Z"
          fill="white"
        />
        <g transform="translate(17, 6)">
          <circle cx="0" cy="0" r="3.5" fill="var(--color-primary)" stroke="white" strokeWidth="1.2" />
          <path
            d="M 0 -2.2 V 2.2 M -2.2 0 H 2.2 M -1.5 -1.5 L 1.5 1.5 M -1.5 1.5 L 1.5 -1.5"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    );
  }
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <circle cx="11" cy="13" r="8" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="11" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M 6.2 17.5 C 6.2 14.8 8.3 13.2 11 13.2 C 13.7 13.2 15.8 14.8 15.8 17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <g transform="translate(17, 6)">
        <circle cx="0" cy="0" r="3.5" fill="white" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M 0 -2.2 V 2.2 M -2.2 0 H 2.2 M -1.5 -1.5 L 1.5 1.5 M -1.5 1.5 L 1.5 -1.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path
          d="M12 8V12L15 14M3.05 11A9 9 0 1 1 5.3 16"
          stroke="var(--color-primary)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 5V11H8"
          stroke="var(--color-primary)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M12 8V12L15 14M3.05 11A9 9 0 1 1 5.3 16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 5V11H8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccountIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <circle cx="12" cy="7" r="4" fill="var(--color-primary)" stroke="var(--color-primary)" strokeWidth="1.8" />
        <path
          d="M 4.5 20 C 4.5 15.5 8 13.5 12 13.5 C 16 13.5 19.5 15.5 19.5 20 Z"
          fill="var(--color-primary)"
          stroke="var(--color-primary)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path
        d="M 4.5 20 C 4.5 15.5 8 13.5 12 13.5 C 16 13.5 19.5 15.5 19.5 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function BottomNavbar({ activeTab }: BottomNavbarProps) {
  const navigate = useNavigate();

  let isAdminOrHr = false;
  try {
    const { profile } = useAuth();
    const role = profile?.user?.roleName?.toLowerCase();
    isAdminOrHr = role === 'admin' || role === 'hr';
  } catch {
    // Graceful fallback if rendered without AuthContext provider
  }

  const handleNavigation = (tab: NavTab, path: string) => {
    if (activeTab !== tab) {
      navigate(path);
    }
  };

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md md:max-w-xl -translate-x-1/2 items-center justify-around border-t border-slate-100 bg-white/95 backdrop-blur-md py-2.5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:rounded-t-2xl md:border-x"
    >
      {/* Home Tab */}
      <button
        type="button"
        aria-current={activeTab === 'home' ? 'page' : undefined}
        onClick={() => handleNavigation('home', '/activities')}
        className={`flex flex-col items-center gap-1 text-xs transition-colors ${
          activeTab === 'home' ? 'font-bold text-primary' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <HomeIcon active={activeTab === 'home'} />
        <span>Home</span>
      </button>

      {/* Admin Tab (Rendered for Admin/HR users on all screens) */}
      {isAdminOrHr && (
        <button
          type="button"
          aria-current={activeTab === 'admin' ? 'page' : undefined}
          onClick={() => handleNavigation('admin', '/admin/activities')}
          className={`flex flex-col items-center gap-1 text-xs transition-colors ${
            activeTab === 'admin'
              ? 'font-bold text-primary'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AdminIcon active={activeTab === 'admin'} />
          <span>Admin</span>
        </button>
      )}

      {/* History Tab */}
      <button
        type="button"
        aria-current={activeTab === 'history' ? 'page' : undefined}
        onClick={() => handleNavigation('history', '/history')}
        className={`flex flex-col items-center gap-1 text-xs transition-colors ${
          activeTab === 'history'
            ? 'font-bold text-primary'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <HistoryIcon active={activeTab === 'history'} />
        <span>History</span>
      </button>

      {/* Account Tab */}
      <button
        type="button"
        aria-current={activeTab === 'account' ? 'page' : undefined}
        onClick={() => handleNavigation('account', '/account')}
        className={`flex flex-col items-center gap-1 text-xs transition-colors ${
          activeTab === 'account'
            ? 'font-bold text-primary'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <AccountIcon active={activeTab === 'account'} />
        <span>Account</span>
      </button>
    </nav>
  );
}

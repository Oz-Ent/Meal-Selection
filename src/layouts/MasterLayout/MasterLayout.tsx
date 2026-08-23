import { Outlet } from 'react-router';

export default function MasterLayout() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-app-bg text-slate-800 antialiased">
      <Outlet />
    </main>
  );
}

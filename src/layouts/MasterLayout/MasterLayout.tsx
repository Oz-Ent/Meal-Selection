import { Outlet } from 'react-router-dom';

export default function MasterLayout() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-app-bg text-text-primary antialiased">

      <Outlet />
    </main>
  );
}

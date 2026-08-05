import { Outlet } from 'react-router';

export default function MasterLayout() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-white text-sky-800">
      <Outlet />
    </main>
  );
}

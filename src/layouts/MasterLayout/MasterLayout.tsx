import { Outlet } from "react-router";

export default function MasterLayout() {
    return (
        <main className="flex flex-col items-center justify-center w-screen h-screen bg-white text-sky-800 px-8">
                <Outlet /> 
        </main>
    );
}
import { Outlet } from "react-router";

export default function MasterLayout() {
    return (
        <div>
            <main>
                <Outlet />
            </main>
        </div>
    );
}
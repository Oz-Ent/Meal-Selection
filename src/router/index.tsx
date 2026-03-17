import { createBrowserRouter } from "react-router";
import HomePage from "../pages/HomePage/HomePage";
import MasterLayout from "../layouts/MasterLayout/MasterLayout";
import NotFoundPage from "../pages/NotFound/NotFound";


export const routes = [{
    path: "/",
    element: <MasterLayout />,
    errorElement: <NotFoundPage />,
    children: [
        {
            index: true,
            element: <HomePage />
        },
        {
            path: "*",
            element: <NotFoundPage />,
        },
    ]
}];

const router = createBrowserRouter(routes);


export default router;
import { createBrowserRouter } from "react-router";
import MasterLayout from "../layouts/MasterLayout/MasterLayout";
import NotFoundPage from "../pages/NotFound/NotFound";
import Welcome from "../pages/Welcome";
import Login from "../pages/Login";
import SelectMealPage from "../pages/SelectMeal/SelectMeal";
import { Activities } from "../pages/Admin/Activities";


export const routes = [{
    path: "/",
    element: <MasterLayout />,
    errorElement: <NotFoundPage />,
    children: [
        {
            index: true,
            element: <Welcome />
        },
        {
            path: "/login",
            element: <Login />,
        },
        {
            path: "*",
            element: <NotFoundPage />,
        },
        {
            path: "select-meal",
            element: <SelectMealPage />
        },
        {
            path: "admin/activities",
            element: <Activities />
        }
    ]
}];

const router = createBrowserRouter(routes);


export default router;
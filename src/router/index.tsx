import { createBrowserRouter } from "react-router";
import HomePage from "../pages/HomePage/HomePage";
import MasterLayout from "../layouts/MasterLayout/MasterLayout";
import NotFoundPage from "../pages/NotFound/NotFound";
import SelectMealPage from "../pages/SelectMeal/SelectMeal";
import { Activities } from "../pages/Admin/Activities";


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
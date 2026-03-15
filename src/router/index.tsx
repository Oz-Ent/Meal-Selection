import { createBrowserRouter } from "react-router";
import HomePage from "../pages/HomePage/HomePage";
import MasterLayout from "../layouts/MasterLayout/MasterLayout";
import NotFoundPage from "../pages/NotFound/NotFound";


const router = createBrowserRouter([{
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
}]);


export default router;
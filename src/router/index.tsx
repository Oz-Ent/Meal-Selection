import { createBrowserRouter } from "react-router";
import MasterLayout from "../layouts/MasterLayout/MasterLayout";
import NotFoundPage from "../pages/NotFound/NotFound";
import Welcome from "../pages/Auth/Welcome";
import Login from "../pages/Auth/Login/Login";
import SelectMealPage from "../pages/SelectMeal/SelectMeal";
import { Activities } from "../pages/Admin/Activities";
import { Menu } from "../pages/Admin/Menu/Menu";
import { AddMenu } from "../pages/Admin/Menu/AddMenu";
import {Meal} from "../pages/Admin/Meal/Meal";
import { EditMeal } from "../pages/Admin/Meal/EditMeal";
import { Report } from "../pages/Admin/Report/Report";
import { ProtectedRoute } from "../pages/Auth/ProtectedRoute";
import Signup from "../pages/Auth/Signup/Signup";
import { ForgotPassword } from "../pages/Auth/ForgotPassword/ForgotPassword";
import { ResetEmail } from "../pages/Auth/ForgotPassword/ResetEmail/ResetEmail";
import { OtpVerification } from "../pages/Auth/ForgotPassword/OtpVerification/OtpVerification";
import { ResetPassword } from "../pages/Auth/ForgotPassword/ResetPassword/ResetPassword";
import { ResetSuccess } from "../pages/Auth/ForgotPassword/ResetSuccess/ResetSuccess";


export const routes = [{
    path: "/welcome",
    element: <Welcome />
},
{
    path: "/login",
    element: <Login />
},
{
    path: "/signup",
    element: <Signup />
},
{
    path: "/forgot-password",
    element: <ForgotPassword />
},
{
    path: "/forgot-password/email",
    element: <ResetEmail />
},
{
    path: "/forgot-password/otp",
    element: <OtpVerification />
},
{
    path: "/forgot-password/reset",
    element: <ResetPassword />
},
{
    path: "/forgot-password/success",
    element: <ResetSuccess />
},
{
    path: "/",
    
    element: (<ProtectedRoute><MasterLayout /></ProtectedRoute>),
    errorElement: <NotFoundPage />,
    children: [

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
        },
        {
            path: "admin/menu",
            element: <Menu />
        },
        {
            path: "admin/menu/add-menu/:menuName",
            element: <AddMenu />
        },
        {
            path: "admin/meal",
            element: <Meal />
        },
        {
            path: "admin/meal/edit/:cardId",
            element: <EditMeal />
        },
        {
            path: "admin/report",
            element: <Report />
        }
    ]
}];

const router = createBrowserRouter(routes);


export default router;
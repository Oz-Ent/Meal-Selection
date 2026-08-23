import { createBrowserRouter, Outlet } from 'react-router';
import MasterLayout from '../layouts/MasterLayout/MasterLayout';
import NotFoundPage from '../pages/NotFound/NotFound';
import Welcome from '../pages/Auth/Welcome';
import Login from '../pages/Auth/Login/Login';
import SelectMealPage from '../pages/SelectMeal/SelectMeal';
import { Activities } from '../pages/Admin/Activities';
import { UserActivities } from '../pages/User/Activities';
import { Menu } from '../pages/Admin/Menu/Menu';
import { AddMenu } from '../pages/Admin/Menu/AddMenu';
import { EditMenu } from '../pages/Admin/Menu/EditMenu';
import { Meal } from '../pages/Admin/Meal/Meal';
import { EditMeal } from '../pages/Admin/Meal/EditMeal';
import { ProtectedRoute } from '../pages/Auth/ProtectedRoutes/ProtectedRoute';
import Signup from '../pages/Auth/Signup/Signup';
import { ForgotPassword } from '../pages/Auth/ForgotPassword/ForgotPassword';
import { ResetEmail } from '../pages/Auth/ForgotPassword/ResetEmail/ResetEmail';
import { OtpVerification } from '../pages/Auth/ForgotPassword/OtpVerification/OtpVerification';
import { ResetPassword } from '../pages/Auth/ForgotPassword/ResetPassword/ResetPassword';
import { ResetSuccess } from '../pages/Auth/ForgotPassword/ResetSuccess/ResetSuccess';
import { AdminProtectedRoute } from '../pages/Auth/ProtectedRoutes/AdminProtectedRoute/AdminProtectedRoute';
import { ActivitiesRedirect } from '../pages/Auth/ProtectedRoutes/ActivitiesRedirect/ActivitiesRedirect';
import { SelectionActivity } from '../pages/Admin/SelectionActivity/SelectionActivity';
import { PresetMeals } from '../pages/Preset/PresetMeals';
import { PresetBuilder } from '../pages/Preset/PresetBuilder';
import { PresetDetail } from '../pages/Preset/PresetDetail';
import { MarkHolidays } from '../pages/Admin/Holidays/MarkHolidays';
import { SelectionStatus } from '../pages/Admin/SelectionStatus/SelectionStatus';
import { Account } from '../pages/Account/Account';
import { History } from '../pages/History/History';

export const routes = [
  {
    path: '/welcome',
    element: <Welcome />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/forgot-password/email',
    element: <ResetEmail />,
  },
  {
    path: '/forgot-password/otp',
    element: <OtpVerification />,
  },
  {
    path: '/forgot-password/reset',
    element: <ResetPassword />,
  },
  {
    path: '/forgot-password/success',
    element: <ResetSuccess />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MasterLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <ActivitiesRedirect />,
      },
      {
        path: 'activities',
        element: <UserActivities />,
      },
      {
        path: 'history',
        element: <History />,
      },
      {
        path: 'select-meal',
        element: <SelectMealPage />,
      },
      {
        path: 'preset-meals',
        element: <PresetMeals />,
      },
      {
        path: 'preset-meals/create/:menuId',
        element: <PresetBuilder />,
      },
      {
        path: 'preset-meals/:presetId',
        element: <PresetDetail />,
      },
      {
        path: 'account',
        element: <Account />,
      },
      {
        element: (
          <AdminProtectedRoute>
            <Outlet />
          </AdminProtectedRoute>
        ),
        children: [
          {
            path: 'admin/activities',
            element: <Activities />,
          },
          {
            path: 'admin/menu',
            element: <Menu />,
          },
          {
            path: 'admin/menu/add-menu/:menuName',
            element: <AddMenu />,
          },
          {
            path: 'admin/menu/edit/:menuId',
            element: <EditMenu />,
          },
          {
            path: 'admin/meal',
            element: <Meal />,
          },
          {
            path: 'admin/meal/edit/:cardId',
            element: <EditMeal />,
          },
          {
            path: 'admin/selection-activity',
            element: <SelectionActivity />,
          },
          {
            path: 'admin/holidays',
            element: <MarkHolidays />,
          },
          {
            path: 'admin/selection-status',
            element: <SelectionStatus />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;

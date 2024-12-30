import { lazy } from 'react';

// project import
import GuestGuard from 'utils/route-guard/GuestGuard';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import AuthGuard from '../utils/route-guard/AuthGuard';

// render - login
const AuthLogin = Loadable(lazy(() => import('pages/auth/login')));
const AuthRegister = Loadable(lazy(() => import('pages/auth/register')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <GuestGuard>
          <CommonLayout />
        </GuestGuard>
      ),
      children: [
        {
          path: 'login',
          element: <AuthLogin />
        },
        {
          path: 'register',
          element: <AuthRegister />
        }
      ]
    }
  ]
};

export default LoginRoutes;

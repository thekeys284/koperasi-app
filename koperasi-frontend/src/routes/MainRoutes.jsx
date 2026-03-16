import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
// import UserPage from 'views/users/Index';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// master data koperasi
const UserForm = Loadable(lazy(() => import('views/users/UserForm')));
const UserPage = Loadable(lazy(() => import('views/users/Index')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// lead routing
const LeadLoan = Loadable(lazy(() => import('views/lead/LeadLoan')));
const LeadLoanDetail = Loadable(lazy(() => import('views/lead/LeadLoanDetail')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    // menu lead
    {
      path: 'lead',
      children: [
        {
          path: 'loans',
          children: [
            {
              path: '',
              element: <LeadLoan />
            },
            {
              path: 'detail/:id',
              element: <LeadLoanDetail />
            }
          ]
        }
      ]
    },
    // menu admin
    {
      path: 'admin',
      children: [
        {
          path: 'users',
          children: [
            {
              path: '',
              element: <UserPage />
            },
            {
              path: 'add',
              element: <UserForm />
            },
            {
              path: 'edit/:id',
              element: <UserForm />
            }
          ]
        }
      ]
    },

    {
      path: 'typography',
      element: <UtilsTypography />
    },
    {
      path: 'color',
      element: <UtilsColor />
    },
    {
      path: 'shadow',
      element: <UtilsShadow />
    },
    {
      path: '/sample-page',
      element: <SamplePage />
    },
    // {
    //   path: '/users',
    //   element: <UserPage />
    // }
  ]
};

export default MainRoutes;

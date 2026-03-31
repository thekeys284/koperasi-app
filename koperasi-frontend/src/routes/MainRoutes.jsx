import { lazy } from "react";

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
// import UserPage from 'views/users/Index';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// master data koperasi
const UserForm = Loadable(lazy(()=>import('views/master/users/UserForm')));
const UserPage = Loadable(lazy(()=>import('views/master/users/Index')));
const ProductForm = Loadable(lazy(()=>import('views/master/product/ProductForm')));
const ProductPage = Loadable(lazy(()=>import('views/master/product/Index')))

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

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
    // menu admin
    {
      path:'admin',
      children:[
        {
          path:'users',
          children:[
            {
              path:'',
              element:<UserPage />
            },
            {
              path:'add',
              element:<UserForm />
            },
            {
              path:'edit/:id',
              element:<UserForm />
            }
          ]
        },
        {
          path:'products',
          children:[
            {
              path:'',
              element: <ProductPage />
            },
            {
              path:'add',
              element:<ProductForm />
            },
            {
              path:'edit/:id',
              element:<ProductForm />
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
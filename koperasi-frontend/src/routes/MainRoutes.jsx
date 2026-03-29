import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout'; 
import Loadable from 'ui-component/Loadable';

// Dashboard
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// Master Data (Sesuaikan dengan folder views/master/...)
const UserPage = Loadable(lazy(() => import('views/master/users/Index.jsx')));
const UserForm = Loadable(lazy(() => import('views/master/users/UserForm.jsx')));
// const ProductPage = Loadable(lazy(() => import('../views/master/product/Index.jsx')));

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
            children: [{ path: 'default', element: <DashboardDefault /> }]
        },
        {
            path: 'admin',
            children: [
                {
                    path: 'users',
                    children: [
                        { path: '', element: <UserPage /> }, // Pakai string kosong untuk index
                        { path: 'add', element: <UserForm /> },
                        { path: 'edit/:id', element: <UserForm /> }
                    ]
                },
                // {
                //     path: 'products',
                //     children: [
                //         { path: '', element: <ProductPage /> }
                //     ]
                // }
            ]
        }
    ]
};

export default MainRoutes;
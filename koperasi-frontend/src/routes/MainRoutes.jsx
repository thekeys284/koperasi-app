import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout'; 
import Loadable from 'ui-component/Loadable';
// import ConvUnitPage from '@/views/master/conversionunit/Index';
// import ConvUnitForm from '@/views/master/conversionunit/ConvUnitForm';

// Dashboard
const DashboardDefault = Loadable(lazy(() => import('../views/dashboard/Default')));

// Master Data (Sesuaikan dengan folder views/master/...)
const UserPage = Loadable(lazy(() => import('../views/master/users/Index.jsx')));
const UserForm = Loadable(lazy(() => import('../views/master/users/UserForm.jsx')));
const ProductPage = Loadable(lazy(() => import('../views/master/product/Index.jsx')));
const ProductForm = Loadable(lazy(() => import('../views/master/product/ProductForm.jsx')));
const CategoryPage = Loadable(lazy(() => import('../views/master/category/Index.jsx')));    
const CategoryForm = Loadable(lazy(() => import('../views/master/category/CategoryForm.jsx')));
const UnitPage = Loadable(lazy(() => import('../views/master/unit/Index.jsx')));
const UnitForm = Loadable(lazy(() => import('../views/master/unit/UnitForm.jsx')));
const ConvUnitPage = Loadable(lazy(()=>import('../views/master/conversionunit/Index.jsx')));
const ConvUnitForm = Loadable(lazy(()=>import('../views/master/conversionunit/ConvUnitForm.jsx')));


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
                        { path: '', element: <UserPage /> },
                        { path: 'add', element: <UserForm /> },
                        { path: 'edit/:id', element: <UserForm /> }
                    ]
                },
                {
                    path: 'products',
                    children: [
                        { path: '', element: <ProductPage /> },
                        { path: 'add', element: <ProductForm /> },  
                        { path: 'edit/:id', element: <ProductForm /> }
                    ]
                },
                {
                    path: 'categories',
                    children: [
                        { path: '', element: <CategoryPage /> },
                        { path: 'add', element: <CategoryForm /> },  
                        { path: 'edit/:id', element: <CategoryForm /> }
                    ]
                },
                {
                    path: 'units',
                    children: [
                        { path: '', element: <UnitPage /> },
                        { path: 'add', element: <UnitForm /> },  
                        { path: 'edit/:id', element: <UnitForm /> }
                    ]
                },
                {
                    path: 'conversionunit',
                    children: [
                        { path: '', element: <ConvUnitPage /> },
                        { path: 'add', element: <ConvUnitForm /> },  
                        { path: 'edit/:id', element: <ConvUnitForm /> }
                    ]
                }
            ]
        }
    ]
};

export default MainRoutes;
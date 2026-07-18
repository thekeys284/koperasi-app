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
const StockBatchPage = Loadable(lazy(() => import('../views/master/stockbatch/Index.jsx')));
const StockBatchForm = Loadable(lazy(()=>import('../views/master/stockbatch/StockBatchForm')));
const PaymentMethodPage = Loadable(lazy(() => import('../views/master/payment/Index.jsx')));
const PaymentMethodForm = Loadable(lazy(() => import('../views/master/payment/PaymentMethodForm.jsx')));
const LeadLoanPage = Loadable(lazy(() => import('../views/lead/loans/LeadLoan.jsx')));
const LeadLoanDetailPage = Loadable(lazy(() => import('../views/lead/loans/LeadLoanDetail.jsx')));

// Operational
const TransactionPage = Loadable(lazy(() => import('../views/operational/transaction/Index.jsx')));
const TransactionForm = Loadable(lazy(() => import('../views/operational/transaction/TransactionForm.jsx')));
// ==== PJ Toko (sesuaikan nama file setelah folder di-expand) ====
const PjtokoLoanPage = Loadable(lazy(() => import('../views/pjtoko/loans/PjtokoLoan.jsx')));
const PjtokoLoanDetailPage = Loadable(lazy(() => import('../views/pjtoko/loans/PjtokoLoanDetail.jsx')));

// ==== User ====
const UserLoansPage = Loadable(lazy(() => import('../views/users/loans/userLoans.jsx')));
const UserPengajuanPage = Loadable(lazy(() => import('../views/users/loans/userPengajuan.jsx')));
const UserCicilanPage = Loadable(lazy(() => import('../views/users/loans/userCicilan.jsx')));


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
            path: 'lead',
            children: [
                {
                    path: 'loans',
                    children: [
                        { path: 'pengajuan', element: <LeadLoanPage /> },
                        { path: 'pengajuan/details', element: <LeadLoanDetailPage /> }
                    ]
                }
            ]
        },
        {
            path: 'pjtoko',
            children: [
                {
                    path: 'loans',
                    children: [
                        { path: 'pengajuan', element: <PjtokoLoanPage /> },
                        { path: 'pengajuan/details', element: <PjtokoLoanDetailPage /> }
                    ]
                }
            ]
        },
        {
            path: 'master',
            children: [
                {
                    path: 'products',
                    children: [
                        { path: '', element: <ProductPage /> },
                        { path: 'add', element: <ProductForm /> },  
                        { path: 'edit/:id', element: <ProductForm /> }
                    ]
                },
                {
                    path: 'stocks',
                    children: [
                        { path: '', element: <StockBatchPage /> },
                        { path: 'add', element: <StockBatchForm /> },  
                        { path: 'edit/:id', element: <StockBatchForm /> }
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
                },
                {
                    path: 'payment-methods',
                    children: [
                        { path: '', element: <PaymentMethodPage /> },
                        { path: 'add', element: <PaymentMethodForm /> },  
                        { path: 'edit/:id', element: <PaymentMethodForm /> }
                    ]
                }
            ]
        },
        {
            path: 'operational',
            children: [
                {
                    path: 'transactions',
                    children: [
                        { path: '', element: <TransactionPage /> },
                        { path: 'add', element: <TransactionForm /> },
                        { path: 'edit/:id', element: <TransactionForm /> }
                    ]
                },
        ]},
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
        ]}
    ]
};

export default MainRoutes;
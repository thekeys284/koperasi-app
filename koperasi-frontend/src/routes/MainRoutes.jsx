import { lazy } from "react";

// project imports
import MainLayout from 'layout/MainLayout'; 
import Loadable from 'ui-component/Loadable';

// Dashboard
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// Master Data (Sesuaikan dengan folder views/master/...)
const UserPage = Loadable(lazy(() => import('views/master/users/Index.jsx')));
const UserForm = Loadable(lazy(() => import('views/master/users/UserForm.jsx')));
const AdminLoanPage = Loadable(lazy(() => import('views/admin/loans/LoanPage.jsx')));
const AdminLoanDetails = Loadable(lazy(() => import('views/admin/loans/LoanDetails.jsx')));
const AdminLoanSubmissionPage = Loadable(lazy(() => import('views/admin/loans/LoanSubmissionPage.jsx')));
const AdminLoanSubmissionDetail = Loadable(lazy(() => import('views/admin/loans/LoanSubmissionDetail.jsx')));
const UserLoanPage = Loadable(lazy(() => import('views/users/loans/userLoans.jsx')));
const UserLoanCreatePage = Loadable(lazy(() => import('views/users/loans/userPengajuan.jsx')));
const UserLoanCicilanPage = Loadable(lazy(() => import('views/users/loans/userCicilan.jsx')));
const LeadLoanPage = Loadable(lazy(() => import('views/lead/loans/LeadLoan.jsx')));
const LeadLoanDetails = Loadable(lazy(() => import('views/lead/loans/LeadLoanDetail.jsx')));
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
            path: 'lead',
            children: [
                {
                    path: 'loans',
                    children: [
                        { path: '', element: <LeadLoanPage /> },
                        { path: 'details', element: <LeadLoanDetails /> }
                    ]
                }
            ]
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
                {
                    path: 'loans',
                    children: [
                        {
                            path: 'pengajuan',
                            children: [
                                { path: '', element: <AdminLoanSubmissionPage /> },
                                { path: 'details', element: <AdminLoanSubmissionDetail /> }
                            ]
                        },
                        { path: 'daftar', element: <AdminLoanPage /> },
                        { path: 'details', element: <AdminLoanDetails /> }
                    ]
                },
                // {
                //     path: 'products',
                //     children: [
                //         { path: '', element: <ProductPage /> }
                //     ]
                // }
            ]
        },
        {
            path: 'user',
            children: [
                {
                    path: 'loans',
                    children: [
                        { path: '', element: <UserLoanPage /> },
                        { path: 'add', element: <UserLoanCreatePage /> },
                        { path: 'cicilan', element: <UserLoanCicilanPage /> }
                    ]
                }
            ]
        }
    ]
};

export default MainRoutes;
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
const LeadLoanDetailPage = Loadable(lazy(() => import('../views/lead/loans/LeadLoanDetail.jsx'))); // Lead Loan Submission Detail

// Operational
const TransactionPage = Loadable(lazy(() => import('../views/operational/transaction/Index.jsx')));
const TransactionForm = Loadable(lazy(() => import('../views/operational/transaction/TransactionForm.jsx')));

// PJ Toko Loans
const PjtokoLoanSubmissionPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanSubmissionPage.jsx'))); // PJ Toko Loan Submissions List
const PjtokoLoanSubmissionDetailPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanSubmissionDetail.jsx'))); // PJ Toko Loan Submission Detail
const PjtokoLoanDetailsPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanDetails.jsx'))); // PJ Toko Active/Paid Loan Details & Installments
const PjtokoLoanGenerateReportPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanGenerateReport.jsx'))); // PJ Toko Loan Report

// User Loans
const UserLoansPage = Loadable(lazy(() => import('../views/master/users/loans/userLoans.jsx'))); // User's list of loans
const UserPengajuanPage = Loadable(lazy(() => import('../views/master/users/loans/userPengajuan.jsx'))); // User's loan application form
const UserCicilanPage = Loadable(lazy(() => import('../views/master/users/loans/userCicilan.jsx'))); // User's installment details

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
                    // Lead specific loan routes
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
                    // PJ Toko specific loan routes
                    children: [
                        { path: 'pengajuan', element: <PjtokoLoanSubmissionPage /> },
                        { path: 'pengajuan/details', element: <PjtokoLoanSubmissionDetailPage /> },
                        { path: 'daftar', element: <PjtokoLoanDetailsPage /> },
                        { path: 'daftar/details', element: <PjtokoLoanDetailsPage /> },
                        { path: 'report', element: <PjtokoLoanGenerateReportPage /> }
                    ]
                }
            ]
        },
        {
            path: 'user', // Base path for regular users
            children: [
                {
                    path: 'loans',
                    // User specific loan routes
                    children: [ 
                        { path: 'daftar', element: <UserLoansPage /> },
                        { path: 'pengajuan', element: <UserPengajuanPage /> },
                        { path: 'cicilan', element: <UserCicilanPage /> }
                    ]
                }
            ]},
            { // Admin routes for loan management
                path: 'admin',
                children: [
                    // Existing admin user routes
                    { path: 'users', children: [
                        { path: '', element: <UserPage /> },
                        { path: 'add', element: <UserForm /> },
                        { path: 'edit/:id', element: <UserForm /> }
                    ]},
                    // Admin access to Lead's loan submissions
                    { path: 'loans/pengajuan/lead', element: <LeadLoanPage /> },
                    { path: 'loans/pengajuan/lead/details', element: <LeadLoanDetailPage /> },
                    // Admin access to PJ Toko's loan submissions
                    { path: 'loans/pengajuan/pjtoko', element: <PjtokoLoanSubmissionPage /> },
                    { path: 'loans/pengajuan/pjtoko/details', element: <PjtokoLoanSubmissionDetailPage /> },
                    // Admin access to PJ Toko's active loans
                    { path: 'loans/daftar/pjtoko', element: <PjtokoLoanDetailsPage /> },
                    { path: 'loans/daftar/pjtoko/details', element: <PjtokoLoanDetailsPage /> },
                    // Admin access to PJ Toko's loan report
                    { path: 'loans/report/pjtoko', element: <PjtokoLoanGenerateReportPage /> },
                    // Admin access to User's loans
                    { path: 'loans/daftar/user', element: <UserLoansPage /> },
                    { path: 'loans/pengajuan/user', element: <UserPengajuanPage /> },
                    { path: 'loans/cicilan/user', element: <UserCicilanPage /> },
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
        ]}, // End of operational routes
        { // Admin routes (moved outside of pjtoko/user/lead specific loan paths)
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
                // Potentially other admin-specific routes here
            ]
        },
    ]
};

export default MainRoutes;
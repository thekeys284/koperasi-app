import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// ===================== DASHBOARD =====================
const DashboardDefault = Loadable(lazy(() => import('../views/dashboard/Default')));

// ===================== MASTER DATA =====================
const UserPage = Loadable(lazy(() => import('../views/master/users/Index.jsx')));
const UserForm = Loadable(lazy(() => import('../views/master/users/UserForm.jsx')));
const ProductPage = Loadable(lazy(() => import('../views/master/product/Index.jsx')));
const ProductForm = Loadable(lazy(() => import('../views/master/product/ProductForm.jsx')));
const CategoryPage = Loadable(lazy(() => import('../views/master/category/Index.jsx')));
const CategoryForm = Loadable(lazy(() => import('../views/master/category/CategoryForm.jsx')));
const UnitPage = Loadable(lazy(() => import('../views/master/unit/Index.jsx')));
const UnitForm = Loadable(lazy(() => import('../views/master/unit/UnitForm.jsx')));
const ConvUnitPage = Loadable(lazy(() => import('../views/master/conversionunit/Index.jsx')));
const PriceLogForm = Loadable(lazy(() => import('../views/operational/pricelogs/PriceLogForm.jsx'))); // NEW: PriceLog Form
const PriceLogIndexPage = Loadable(lazy(() => import('../views/operational/pricelogs/Index.jsx'))); // NEW: PriceLog Index Page
const ConvUnitForm = Loadable(lazy(() => import('../views/master/conversionunit/ConvUnitForm.jsx')));
const StockBatchPage = Loadable(lazy(() => import('../views/master/stockbatch/Index.jsx')));
const StockBatchForm = Loadable(lazy(() => import('../views/master/stockbatch/StockBatchForm')));
const PaymentMethodPage = Loadable(lazy(() => import('../views/master/payment/Index.jsx')));
const PaymentMethodForm = Loadable(lazy(() => import('../views/master/payment/PaymentMethodForm.jsx')));

// ===================== OPERATIONAL =====================
const TransactionPage = Loadable(lazy(() => import('../views/operational/transaction/Index.jsx')));
const TransactionForm = Loadable(lazy(() => import('../views/operational/transaction/TransactionForm.jsx')));

// ===================== LOAN MODULE =====================

// -- Lead --
const LeadLoanPage = Loadable(lazy(() => import('../views/lead/loans/LeadLoan.jsx')));
const LeadLoanDetailPage = Loadable(lazy(() => import('../views/lead/loans/LeadLoanDetail.jsx')));

// -- PJ Toko --
const PjtokoLoanSubmissionPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanSubmissionPage.jsx')));
const PjtokoLoanSubmissionDetailPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanSubmissionDetail.jsx')));
const PjtokoLoanIndexPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanPage.jsx'))); // PJ Toko's main loan list (active, paid, etc.)
const PjtokoLoanDetailsPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanDetails.jsx')));
const PjtokoLoanGenerateReportPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanGenerateReport.jsx')));

// -- User / Anggota -- (folder: views/users/loans)
const UserLoansPage = Loadable(lazy(() => import('../views/master/users/loans/userLoans.jsx')));
const UserPengajuanPage = Loadable(lazy(() => import('../views/master/users/loans/userPengajuan.jsx')));
const UserCicilanPage = Loadable(lazy(() => import('../views/master/users/loans/userCicilan.jsx')));

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        { path: '/', element: <DashboardDefault /> },
        { path: 'dashboard', children: [{ path: 'default', element: <DashboardDefault /> }] },

        // ================= LEAD =================
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

        // ================= PJ TOKO =================
        {
            path: 'pjtoko',
            children: [
                {
                    path: 'loans',
                    children: [
                        { path: 'pengajuan', element: <PjtokoLoanSubmissionPage /> },
                        { path: 'pengajuan/details', element: <PjtokoLoanSubmissionDetailPage /> }, // Detail for PJ Toko's submission review
                        { path: 'daftar', element: <PjtokoLoanIndexPage /> },
                        { path: 'details', element: <PjtokoLoanDetailsPage /> },
                        { path: 'report', element: <PjtokoLoanGenerateReportPage /> }
                    ]
                }
            ]
        },

        // ================= USER / ANGGOTA =================
        {
            path: 'user',
            children: [
                {
                    path: 'loans',
                    children: [
                        { path: '', element: <UserLoansPage /> },       // /user/loans
                        { path: 'daftar', element: <UserLoansPage /> }, // /user/loans/daftar (User's list of loans)
                        { path: 'pengajuan', element: <UserPengajuanPage /> }, // Added for /user/loans/pengajuan
                        { path: 'add', element: <UserPengajuanPage /> },
                        { path: 'topup', element: <UserPengajuanPage /> },
                        { path: 'cicilan', element: <UserCicilanPage /> }
                    ]
                }
            ]
        },

        // ================= ADMIN =================
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

                // -- Loan: Lead --
                { path: 'loans/pengajuan/lead', element: <LeadLoanPage /> },
                { path: 'loans/pengajuan/lead/details', element: <LeadLoanDetailPage /> },

                // -- Loan: PJ Toko --
                { path: 'loans/pengajuan/pjtoko', element: <PjtokoLoanSubmissionPage /> },
                { path: 'loans/pengajuan/pjtoko/details', element: <PjtokoLoanSubmissionDetailPage /> },
                { path: 'loans/daftar/pjtoko', element: <PjtokoLoanIndexPage /> },
                { path: 'loans/daftar/pjtoko/details', element: <PjtokoLoanDetailsPage /> },
                { path: 'loans/report/pjtoko', element: <PjtokoLoanGenerateReportPage /> },

                // -- Loan: User / Anggota --
                { path: 'loans/daftar/user', element: <UserLoansPage /> },
                { path: 'loans/add/user', element: <UserPengajuanPage /> },
                { path: 'loans/topup/user', element: <UserPengajuanPage /> },
                { path: 'loans/cicilan/user', element: <UserCicilanPage /> }
            ]
        },

        // ================= MASTER =================
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

        // ================= OPERATIONAL =================
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
                }
                ,
                { // NEW: Price Logs
                    path: 'pricelogs',
                    children: [
                        { path: '', element: <PriceLogIndexPage /> }, // Index page
                        { path: 'add', element: <PriceLogForm /> }, // Add form
                        { path: 'edit/:id', element: <PriceLogForm /> } // Edit form
                    ]
                }
            ]
        }
    ]
};

export default MainRoutes;
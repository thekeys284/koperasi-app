import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import RoleRoute from './RoleRoute';
import { ROLES } from '../utils/auth';

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
const PriceLogForm = Loadable(lazy(() => import('../views/operational/pricelogs/PriceLogForm.jsx')));
const PriceLogIndexPage = Loadable(lazy(() => import('../views/operational/pricelogs/Index.jsx')));
const ConvUnitForm = Loadable(lazy(() => import('../views/master/conversionunit/ConvUnitForm.jsx')));
const StockBatchPage = Loadable(lazy(() => import('../views/master/stockbatch/Index.jsx')));
const StockBatchForm = Loadable(lazy(() => import('../views/master/stockbatch/StockBatchForm')));
const PaymentMethodPage = Loadable(lazy(() => import('../views/master/payment/Index.jsx')));
const PaymentMethodForm = Loadable(lazy(() => import('../views/master/payment/PaymentMethodForm.jsx')));

// ===================== OPERATIONAL =====================
const TransactionPage = Loadable(lazy(() => import('../views/operational/transaction/Index.jsx')));
const TransactionForm = Loadable(lazy(() => import('../views/operational/transaction/TransactionForm.jsx')));
const TransactionReportPage = Loadable(lazy(() => import('../views/operational/transactionreport/Index.jsx')));
const CashDailyPage = Loadable(lazy(() => import('../views/operational/cashdaily/Index.jsx')));
const PurchaseRecapPage = Loadable(lazy(() => import('../views/operational/purchaserecap/Index.jsx'))); // NEW

// ===================== USER (ANGGOTA) =====================
const MyPurchaseHistoryPage = Loadable(lazy(() => import('../views/user/purchases/Index.jsx'))); // NEW

// ===================== LOAN MODULE =====================

// -- Lead --
const LeadLoanPage = Loadable(lazy(() => import('../views/lead/loans/LeadLoan.jsx')));
const LeadLoanDetailPage = Loadable(lazy(() => import('../views/lead/loans/LeadLoanDetail.jsx')));

// -- PJ Toko --
const PjtokoLoanSubmissionPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanSubmissionPage.jsx')));
const PjtokoLoanSubmissionDetailPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanSubmissionDetail.jsx')));
const PjtokoLoanIndexPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanPage.jsx')));
const PjtokoLoanDetailsPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanDetails.jsx')));
const PjtokoLoanGenerateReportPage = Loadable(lazy(() => import('../views/pjtoko/loans/LoanGenerateReport.jsx')));

// -- User / Anggota -- (folder: views/users/loans)
const UserLoansPage = Loadable(lazy(() => import('../views/user/loans/userLoans.jsx')));
const UserPengajuanPage = Loadable(lazy(() => import('../views/user/loans/userPengajuan.jsx')));
const UserCicilanPage = Loadable(lazy(() => import('../views/user/loans/userCicilan.jsx')));

// ---------------------------------------------------------------
// Daftar role dipakai berkali-kali -> definisikan sekali di sini
// ---------------------------------------------------------------
const ROLE_MASTER_DATA = [ROLES.ADMIN, ROLES.OPERATOR, ROLES.PJ_TOKO];
const ROLE_PAYMENT_METHOD = [ROLES.ADMIN, ROLES.PJ_TOKO];
const ROLE_PRICE_LOG = [ROLES.ADMIN, ROLES.OPERATOR, ROLES.PJ_TOKO];
const ROLE_USER_MANAGEMENT = [ROLES.ADMIN, ROLES.PJ_TOKO, ROLES.PJ_PINJAMAN, ROLES.KETUA];
const ROLE_TRANSACTION = [ROLES.ADMIN, ROLES.OPERATOR, ROLES.PJ_TOKO];
const ROLE_ONLY_USER = [ROLES.USER];
const ROLE_LOAN_MANAGEMENT = [ROLES.ADMIN, ROLES.PJ_PINJAMAN];
const ROLE_LOAN_KETUA = [ROLES.ADMIN, ROLES.KETUA];

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
                        { path: 'pengajuan', element: <RoleRoute roles={ROLE_LOAN_KETUA}><LeadLoanPage /></RoleRoute> },
                        { path: 'pengajuan/details', element: <RoleRoute roles={ROLE_LOAN_KETUA}><LeadLoanDetailPage /></RoleRoute> }
                    ]
                }
            ]
        },

        // ================= PJ PINJAMAN (Modul Pinjaman) =================
        {
            path: 'pjpinjaman',
            children: [
                {
                    path: 'loans',
                    children: [
                        { path: 'pengajuan', element: <RoleRoute roles={ROLE_LOAN_MANAGEMENT}><PjtokoLoanSubmissionPage /></RoleRoute> },
                        { path: 'pengajuan/details', element: <RoleRoute roles={ROLE_LOAN_MANAGEMENT}><PjtokoLoanSubmissionDetailPage /></RoleRoute> },
                        { path: 'daftar', element: <RoleRoute roles={ROLE_LOAN_MANAGEMENT}><PjtokoLoanIndexPage /></RoleRoute> },
                        { path: 'details', element: <RoleRoute roles={ROLE_LOAN_MANAGEMENT}><PjtokoLoanDetailsPage /></RoleRoute> },
                        { path: 'report', element: <RoleRoute roles={ROLE_LOAN_MANAGEMENT}><PjtokoLoanGenerateReportPage /></RoleRoute> }
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
                        { path: '', element: <RoleRoute roles={ROLE_ONLY_USER}><UserLoansPage /></RoleRoute> },
                        { path: 'daftar', element: <RoleRoute roles={ROLE_ONLY_USER}><UserLoansPage /></RoleRoute> },
                        { path: 'pengajuan', element: <RoleRoute roles={ROLE_ONLY_USER}><UserPengajuanPage /></RoleRoute> },
                        { path: 'add', element: <RoleRoute roles={ROLE_ONLY_USER}><UserPengajuanPage /></RoleRoute> },
                        { path: 'topup', element: <RoleRoute roles={ROLE_ONLY_USER}><UserPengajuanPage /></RoleRoute> },
                        { path: 'cicilan', element: <RoleRoute roles={ROLE_ONLY_USER}><UserCicilanPage /></RoleRoute> }
                    ]
                },
                {
                    // NEW: History belanja milik user sendiri
                    path: 'purchases',
                    children: [{ path: '', element: <RoleRoute roles={ROLE_ONLY_USER}><MyPurchaseHistoryPage /></RoleRoute> }]
                }
            ]
        },

        // ================= ADMIN (Manajemen User + Modul Pinjaman) =================
        {
            path: 'admin',
            children: [
                {
                    path: 'users',
                    children: [
                        { path: '', element: <RoleRoute roles={ROLE_USER_MANAGEMENT}><UserPage /></RoleRoute> },
                        { path: 'add', element: <RoleRoute roles={ROLE_USER_MANAGEMENT}><UserForm /></RoleRoute> },
                        { path: 'edit/:id', element: <RoleRoute roles={ROLE_USER_MANAGEMENT}><UserForm /></RoleRoute> }
                    ]
                },

                // -- Loan: Lead --
                { path: 'loans/pengajuan/lead', element: <RoleRoute roles={ROLE_LOAN_KETUA}><LeadLoanPage /></RoleRoute> },
                { path: 'loans/pengajuan/lead/details', element: <RoleRoute roles={ROLE_LOAN_KETUA}><LeadLoanDetailPage /></RoleRoute> },

                // -- Loan: PJ Toko --
                { path: 'loans/pengajuan/pjtoko', element: <RoleRoute roles={ROLE_LOAN_MANAGEMENT}><PjtokoLoanSubmissionPage /></RoleRoute> },
                { path: 'loans/pengajuan/pjtoko/details', element: <RoleRoute roles={ROLE_LOAN_MANAGEMENT}><PjtokoLoanSubmissionDetailPage /></RoleRoute> },
                { path: 'loans/daftar/pjtoko', element: <RoleRoute roles={ROLE_LOAN_MANAGEMENT}><PjtokoLoanIndexPage /></RoleRoute> },
                { path: 'loans/daftar/pjtoko/details', element: <RoleRoute roles={ROLE_LOAN_MANAGEMENT}><PjtokoLoanDetailsPage /></RoleRoute> },
                { path: 'loans/report/pjtoko', element: <RoleRoute roles={ROLE_LOAN_MANAGEMENT}><PjtokoLoanGenerateReportPage /></RoleRoute> },

                // -- Loan: User / Anggota --
                { path: 'loans/daftar/user', element: <RoleRoute roles={ROLE_ONLY_USER}><UserLoansPage /></RoleRoute> },
                { path: 'loans/add/user', element: <RoleRoute roles={ROLE_ONLY_USER}><UserPengajuanPage /></RoleRoute> },
                { path: 'loans/topup/user', element: <RoleRoute roles={ROLE_ONLY_USER}><UserPengajuanPage /></RoleRoute> },
                { path: 'loans/cicilan/user', element: <RoleRoute roles={ROLE_ONLY_USER}><UserCicilanPage /></RoleRoute> }
            ]
        },

        // ================= MASTER =================
        {
            path: 'master',
            children: [
                {
                    path: 'products',
                    children: [
                        { path: '', element: <RoleRoute roles={ROLE_MASTER_DATA}><ProductPage /></RoleRoute> },
                        { path: 'add', element: <RoleRoute roles={ROLE_MASTER_DATA}><ProductForm /></RoleRoute> },
                        { path: 'edit/:id', element: <RoleRoute roles={ROLE_MASTER_DATA}><ProductForm /></RoleRoute> }
                    ]
                },
                {
                    path: 'stocks',
                    children: [
                        { path: '', element: <RoleRoute roles={ROLE_MASTER_DATA}><StockBatchPage /></RoleRoute> },
                        { path: 'add', element: <RoleRoute roles={ROLE_MASTER_DATA}><StockBatchForm /></RoleRoute> },
                        { path: 'edit/:id', element: <RoleRoute roles={ROLE_MASTER_DATA}><StockBatchForm /></RoleRoute> }
                    ]
                },
                {
                    path: 'categories',
                    children: [
                        { path: '', element: <RoleRoute roles={ROLE_MASTER_DATA}><CategoryPage /></RoleRoute> },
                        { path: 'add', element: <RoleRoute roles={ROLE_MASTER_DATA}><CategoryForm /></RoleRoute> },
                        { path: 'edit/:id', element: <RoleRoute roles={ROLE_MASTER_DATA}><CategoryForm /></RoleRoute> }
                    ]
                },
                {
                    path: 'units',
                    children: [
                        { path: '', element: <RoleRoute roles={ROLE_MASTER_DATA}><UnitPage /></RoleRoute> },
                        { path: 'add', element: <RoleRoute roles={ROLE_MASTER_DATA}><UnitForm /></RoleRoute> },
                        { path: 'edit/:id', element: <RoleRoute roles={ROLE_MASTER_DATA}><UnitForm /></RoleRoute> }
                    ]
                },
                {
                    path: 'conversionunit',
                    children: [
                        { path: '', element: <RoleRoute roles={ROLE_MASTER_DATA}><ConvUnitPage /></RoleRoute> },
                        { path: 'add', element: <RoleRoute roles={ROLE_MASTER_DATA}><ConvUnitForm /></RoleRoute> },
                        { path: 'edit/:id', element: <RoleRoute roles={ROLE_MASTER_DATA}><ConvUnitForm /></RoleRoute> }
                    ]
                },
                {
                    path: 'payment-methods',
                    children: [
                        { path: '', element: <RoleRoute roles={ROLE_PAYMENT_METHOD}><PaymentMethodPage /></RoleRoute> },
                        { path: 'add', element: <RoleRoute roles={ROLE_PAYMENT_METHOD}><PaymentMethodForm /></RoleRoute> },
                        { path: 'edit/:id', element: <RoleRoute roles={ROLE_PAYMENT_METHOD}><PaymentMethodForm /></RoleRoute> }
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
                        { path: '', element: <RoleRoute roles={ROLE_TRANSACTION}><TransactionPage /></RoleRoute> },
                        { path: 'add', element: <RoleRoute roles={ROLE_TRANSACTION}><TransactionForm /></RoleRoute> },
                        { path: 'edit/:id', element: <RoleRoute roles={ROLE_TRANSACTION}><TransactionForm /></RoleRoute> }
                    ]
                },
                {
                    path: 'pricelogs',
                    children: [
                        { path: '', element: <RoleRoute roles={ROLE_PRICE_LOG}><PriceLogIndexPage /></RoleRoute> },
                        { path: 'add', element: <RoleRoute roles={ROLE_PRICE_LOG}><PriceLogForm /></RoleRoute> },
                        { path: 'edit/:id', element: <RoleRoute roles={ROLE_PRICE_LOG}><PriceLogForm /></RoleRoute> }
                    ]
                },
                {
                    path: 'transaction-report',
                    element: <RoleRoute roles={[ROLES.ADMIN, ROLES.PJ_TOKO, ROLES.OPERATOR]}><TransactionReportPage /></RoleRoute>
                },
                {
                    path: 'cash-daily',
                    element: <RoleRoute roles={[ROLES.ADMIN, ROLES.PJ_TOKO, ROLES.OPERATOR]}><CashDailyPage /></RoleRoute>
                },
                {
                    // NEW: Rekap Pembelian User
                    path: 'purchase-recap',
                    children: [{ path: '', element: <RoleRoute><PurchaseRecapPage /></RoleRoute> }]
                }
            ]
        }
    ]
};

export default MainRoutes;

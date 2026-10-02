import { IconCreditCard, IconFileText, IconReport, IconUserPlus, IconListDetails, IconClipboardList } from '@tabler/icons-react';

const loans = {
    id: 'loans',
    title: 'Pinjaman',
    type: 'group',
    children: [
        {
            id: 'lead-loan-submissions',
            title: 'Persetujuan Ketua',
            type: 'item',
            url: '/lead/loans/pengajuan',
            icon: IconFileText,
            breadcrumbs: false,
            roles: ['admin', 'ketua']
        },
        {
            id: 'pjpinjaman-loan-submissions',
            title: 'Pengajuan Masuk',
            type: 'item',
            url: '/pjpinjaman/loans/pengajuan',
            icon: IconUserPlus,
            breadcrumbs: false,
            roles: ['admin', 'pj_pinjaman']
        },
        {
            id: 'pjpinjaman-active-loans',
            title: 'Daftar Pinjaman',
            type: 'item',
            url: '/pjpinjaman/loans/daftar',
            icon: IconListDetails,
            breadcrumbs: false,
            roles: ['admin', 'pj_pinjaman']
        },
        {
            id: 'pjpinjaman-loan-report',
            title: 'Laporan Pinjaman',
            type: 'item',
            url: '/pjpinjaman/loans/report',
            icon: IconReport,
            breadcrumbs: false,
            roles: ['admin', 'pj_pinjaman']
        },
        {
            id: 'user-my-loans',
            title: 'Pinjaman Saya (Anggota)',
            type: 'item',
            url: '/user/loans/daftar',
            icon: IconCreditCard,
            breadcrumbs: false,
            roles: ['user']
        },
        {
            id: 'user-apply-loan',
            title: 'Ajukan Pinjaman (Anggota)',
            type: 'item',
            url: '/user/loans/pengajuan',
            icon: IconUserPlus,
            breadcrumbs: false,
            roles: ['user']
        },
        {
            id: 'user-my-installments',
            title: 'Cicilan Saya (Anggota)',
            type: 'item',
            url: '/user/loans/cicilan',
            icon: IconClipboardList,
            breadcrumbs: false,
            roles: ['user']
        }
    ]
};

export default loans;

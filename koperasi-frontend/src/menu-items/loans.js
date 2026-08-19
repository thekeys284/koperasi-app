import { IconCreditCard, IconFileText, IconReport, IconUserPlus, IconListDetails, IconClipboardList } from '@tabler/icons-react';

const loans = {
    id: 'loans',
    title: 'Pinjaman',
    type: 'group',
    children: [
        {
            id: 'lead-loan-submissions',
            title: 'Pengajuan Pinjaman (Lead)',
            type: 'item',
            url: '/lead/loans/pengajuan',
            icon: IconFileText,
            breadcrumbs: false
        },
        {
            id: 'pjtoko-loan-submissions',
            title: 'Pengajuan Pinjaman (PJ Toko)',
            type: 'item',
            url: '/pjtoko/loans/pengajuan',
            icon: IconUserPlus,
            breadcrumbs: false
        },
        {
            id: 'pjtoko-active-loans',
            title: 'Daftar Pinjaman (PJ Toko)',
            type: 'item',
            url: '/pjtoko/loans/daftar',
            icon: IconListDetails,
            breadcrumbs: false
        },
        {
            id: 'pjtoko-loan-report',
            title: 'Laporan Pinjaman (PJ Toko)',
            type: 'item',
            url: '/pjtoko/loans/report',
            icon: IconReport,
            breadcrumbs: false
        },
        {
            id: 'user-my-loans',
            title: 'Pinjaman Saya (Anggota)',
            type: 'item',
            url: '/user/loans/daftar',
            icon: IconCreditCard,
            breadcrumbs: false
        },
        {
            id: 'user-apply-loan',
            title: 'Ajukan Pinjaman (Anggota)',
            type: 'item',
            url: '/user/loans/pengajuan',
            icon: IconUserPlus,
            breadcrumbs: false
        },
        {
            id: 'user-my-installments',
            title: 'Cicilan Saya (Anggota)',
            type: 'item',
            url: '/user/loans/cicilan',
            icon: IconClipboardList,
            breadcrumbs: false
        }
    ]
};

export default loans;
import { IconShoppingCart, IconCash, IconFileDescription, IconReceipt, IconWallet } from "@tabler/icons-react";
const icons = { IconShoppingCart, IconCash, IconFileDescription, IconReceipt, IconWallet };

const operasional = {
  id: "operasional",
  title: "Operasional",
  type: "group",
  children: [
    {
      id: "kasir",
      title: "Transaksi",
      caption: "Kelola Transaksi Penjualan",
      type: "item",
      url: "/operational/transactions",
      icon: icons.IconShoppingCart,
      breadcrumbs: false,
      roles: ["admin", "operator", "pj_toko"],
    },
    {
      id: "pinjaman",
      title: "Peminjaman",
      caption: "Kelola Peminjaman",
      type: "item",
      url: "/lead/loans/pengajuan",
      icon: icons.IconCash,
      breadcrumbs: false,
      roles: ["admin", "ketua"],
    },
    {
      id: "my-purchases",
      title: "Riwayat Belanja Saya",
      caption: "Struk dan rincian barang yang dibeli",
      type: "item",
      url: "/user/purchases",
      icon: icons.IconReceipt,
      breadcrumbs: false,
      roles: ["user"],
    },
    {
      id: "cash-daily",
      title: "Kas Harian",
      caption: "Opname, penjualan tunai, dan penarikan anggota",
      type: "item",
      url: "/operational/cash-daily",
      icon: icons.IconWallet,
      breadcrumbs: false,
      roles: ["admin", "operator", "pj_toko"],
    },
    {
      id: "laporan",
      title: "Laporan",
      type: "collapse",
      icon: icons.IconFileDescription,
      children: [
        {
          id: "laporan-transaksi",
          title: "Rekap Transaksi",
          type: "item",
          url: "/operational/purchase-recap",
          breadcrumbs: false,
        },
        {
          id: "laporan-belanja-transaksi",
          title: "Laporan Belanja Bulanan",
          type: "item",
          url: "/operational/transaction-report",
          breadcrumbs: false,
          roles: ["admin", "pj_toko", "operator"],
        },
      ],
    },
  ],
};

export default operasional; 

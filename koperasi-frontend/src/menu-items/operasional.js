import { IconShoppingCart, IconCash, IconFileDescription } from "@tabler/icons-react";
const icons = { IconShoppingCart, IconCash, IconFileDescription };

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
      url: "/admin/transaksi",
      icon: icons.IconShoppingCart,
      breadcrumbs: false,
    },
    {
      id: "pinjaman",
      title: "Peminjaman",
      caption: "Kelola Peminjaman",
      type: "collapse",
      icon: icons.IconCash,
      children: [
        {
          id: "pengajuan-cicilan",
          title: "Konfirmasi Pengajuan",
          type: "item",
          url: "/admin/loans/pengajuan",
          breadcrumbs: false,
        },
        {
          id: "daftar-cicilan",
          title: "Daftar Cicilan",
          type: "item",
          url: "/admin/loans/daftar",
          breadcrumbs: false,
        }
      ],
    },
    {
      id: "laporan",
      title: "Laporan",
      type: "collapse",
      icon: icons.IconFileDescription,
      children: [
        {
          id: "laporan-transaksi",
          title: "Transaksi",
          type: "item",
          url: "/admin/laporan/transaksi",
          breadcrumbs: false,
        },
        {
          id: "laporan-peminjaman",
          title: "Peminjaman",
          type: "item",
          url: "/admin/laporan/peminjaman",
          breadcrumbs: false,
        },
      ],
    },
  ],
};

export default operasional; 
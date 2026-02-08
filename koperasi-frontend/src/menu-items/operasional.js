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
      type: "item",
      url: "/admin/loans",
      icon: icons.IconCash,
      breadcrumbs: false,
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
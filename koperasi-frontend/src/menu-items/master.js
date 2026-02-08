import { IconUsers, IconBox, IconSettings } from "@tabler/icons-react";

const icon = {IconUsers, IconBox, IconSettings};

const master = {
  id: "master",
  title: "Master Data",
  type: "group",
  children: [
    {
        id: "users",
        title: "Anggota",
        caption: "Kelola Anggota",
        type: "item",
        url: "/admin/users",
        icon: icon.IconUsers,
        breadcrumbs: false,
    },
    {
        id: "stock",
        title: "Stok Barang",
        type: "item",
        url: "/admin/stock",
        icon: icon.IconBox,
        breadcrumbs: false,
    },
    {
        id: "limit",
        title: "Limit",
        caption: "Pengaturan limit peminjaman",
        type: "item",
        url: "/admin/limit",
        icon: icon.IconSettings,
        breadcrumbs: false,
    },
  ],
};

export default master;
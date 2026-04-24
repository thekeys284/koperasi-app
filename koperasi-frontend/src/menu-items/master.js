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
        url: "/pjtoko/users",
        icon: icon.IconUsers,
        breadcrumbs: false,
    },
    {
        id: "stock",
        title: "Stok Barang",
        type: "item",
        url: "/pjtoko/stock",
        icon: icon.IconBox,
        breadcrumbs: false,
    },
    {
        id: "limit",
        title: "Limit",
        caption: "Pengaturan limit peminjaman",
        type: "item",
        url: "/pjtoko/limit",
        icon: icon.IconSettings,
        breadcrumbs: false,
    },
  ],
};

export default master;
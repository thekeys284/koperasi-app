import { 
  IconUsers, 
  IconBox, 
  IconSettings, 
  IconRulerMeasure, 
  IconArrowsHorizontal, 
  IconUserCircle, 
  IconDatabase,
  IconHistory,
  IconCreditCard,
  IconCoin } from "@tabler/icons-react";

const icon = {
  IconUsers, 
  IconBox, 
  IconSettings, 
  IconRulerMeasure, 
  IconArrowsHorizontal, 
  IconUserCircle, 
  IconDatabase,
  IconHistory,
  IconCreditCard,
  IconCoin
};

const master = {
  id: "master-group",
  title: "Master Data",
  type: "group",
  children: [
    {
      id: "master-barang",
      title: "Barang",
      type: "collapse",
      icon: icon.IconDatabase, 
      children: [
        {
          id: "product",
          title: "Kelola Produk",
          type: "item",
          url: "/master/products",
          icon: icon.IconBox,
          breadcrumbs: false,
        },
        {
          id: "stock",
          title: "Stok Barang",
          type: "item",
          url: "/master/stocks",
          icon: icon.IconBox,
          breadcrumbs: false,
        },
        {
          id: "category",
          title: "Kategori",
          type: "item",
          url: "/master/categories",
          icon: icon.IconSettings,
          breadcrumbs: false,
        },
        {
          id: "unit",
          title: "Satuan",
          type: "item",
          url: "/master/units",
          icon: icon.IconRulerMeasure,
          breadcrumbs: false,
        },
        {
          id: "conversion-unit",
          title: "Konversi Satuan",
          type: "item",
          url: "/master/conversionunit",
          icon: icon.IconArrowsHorizontal,
          breadcrumbs: false,
        }
      ]
    },
    {
      id: "price-logs",
      title: "History Harga",
      type: "item",
      url: "/admin/pricelogs",
      icon: icon.IconHistory, 
      breadcrumbs: false,
    },
    {
      id: "payment-methods",
      title: "Cara Pembayaran",
      type: "item",
      url: "/master/payment-methods",
      icon: icon.IconCreditCard, 
      breadcrumbs: false,
    }, 
    {
      id: "master-user",
      title: "User",
      type: "collapse",
      icon: icon.IconUserCircle, 
      children: [
        {
          id: "users",
          title: "User",
          caption: "Kelola User",
          type: "item",
          url: "/admin/users",
          icon: icon.IconUsers,
          breadcrumbs: false,
        }
      ]
    }, 
  ]
};

export default master;
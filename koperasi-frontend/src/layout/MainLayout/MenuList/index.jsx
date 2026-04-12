import { Activity, memo, useState } from 'react';

import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import menuItems from 'menu-items';
import api from 'api/axios';

import { useGetMenuMaster } from 'api/menu';
import React, { useEffect } from 'react';

// ==============================|| SIDEBAR MENU LIST ||============================== //

function MenuList() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [selectedID, setSelectedID] = useState('');
  const [items, setItems] = React.useState(menuItems.items);

  useEffect(() => {
    const updateMenuChip = (menuItemsList, targetId, count) => {
      return menuItemsList.map((item) => {
        if (item.id === targetId) {
          return {
            ...item,
            chip: count > 0 ? {
              label: String(count),
              color: 'secondary',
              size: 'small'
            } : null
          };
        }
        if (item.children) {
          return {
            ...item,
            children: updateMenuChip(item.children, targetId, count)
          };
        }
        return item;
      });
    };

    const fetchCounts = async () => {
      try {
        const response = await api.get('/loans', { params: { all: 1, user_id: 1 } });
        const loans = response.data?.data || [];
        const pendingCount = loans.filter((l) => l.status_pengajuan === 'pending').length;
        
        console.log('Pending Count for Badge:', pendingCount);

        setItems((prevItems) => updateMenuChip(prevItems, 'pengajuan-cicilan', pendingCount));
      } catch (err) {
        console.error('Failed to fetch menu counts:', err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // Sinkronkan setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  const lastItem = null;

  let lastItemIndex = items.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < items.length) {
    lastItemId = items[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = items.slice(lastItem - 1, items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const navItems = items.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <List key={item.id}>
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
              <Activity mode={index !== 0 ? 'visible' : 'hidden'}>
                <Divider sx={{ py: 0.5 }} />
              </Activity>
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
            Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(MenuList);

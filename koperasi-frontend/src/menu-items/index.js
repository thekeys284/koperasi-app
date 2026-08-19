import dashboard from './dashboard';
import master from './master';
import operasional from './operasional';
import loans from './loans'; // Import the new loans menu item
// import other from './other';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, operasional, master, loans] // Add loans to the menu items
};

export default menuItems;

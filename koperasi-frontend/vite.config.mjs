import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mapping folder ke src agar Absolute Import berfungsi kembali
      '@': path.resolve(__dirname, 'src'),
      'api': path.resolve(__dirname, 'src/api'), // Tambahan untuk api/menu
      'assets': path.resolve(__dirname, 'src/assets'),
      'components': path.resolve(__dirname, 'src/components'),
      'config': path.resolve(__dirname, 'src/config.js'),
      'contexts': path.resolve(__dirname, 'src/contexts'), // Tambahan untuk contexts/ConfigContext
      'hooks': path.resolve(__dirname, 'src/hooks'),
      'layout': path.resolve(__dirname, 'src/layout'),
      'menu-items': path.resolve(__dirname, 'src/menu-items'),
      'routes': path.resolve(__dirname, 'src/routes'),
      'store': path.resolve(__dirname, 'src/store'),
      'themes': path.resolve(__dirname, 'src/themes'),
      'ui-component': path.resolve(__dirname, 'src/ui-component'),
      'utils': path.resolve(__dirname, 'src/utils'), // Tambahan untuk utils/colorUtils
      'views': path.resolve(__dirname, 'src/views'),
    },
  },
});
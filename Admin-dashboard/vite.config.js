import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Cho phép file .js chứa JSX
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },

  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },

  build: {
    // Cảnh báo nếu chunk > 500KB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Tách vendor thành các chunk riêng để browser cache tốt hơn
        manualChunks: {
          // React core — ít thay đổi nhất, cache lâu nhất
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Ant Design — thư viện lớn nhất (~1MB), tách riêng
          'vendor-antd': ['antd', '@ant-design/icons'],
          // Charts — chỉ dùng ở Dashboard
          'vendor-charts': ['recharts'],
          // Utilities nhỏ
          'vendor-utils': ['axios', 'dayjs'],
        },
      },
    },
  },

  server: {
    port: 3001,
    historyApiFallback: true,
    proxy: {
      '/apis': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});

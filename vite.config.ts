import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      // Strip @version suffixes from imports like "package@1.2.3" or "@scope/package@1.2.3"
      {
        find: /^((?:@[^@/]+\/)?[^@/][^@/]*)@[\d.]+.*/,
        replacement: '$1',
      },
    ],
  },
});

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  define: {
    'process.env': {}, // Ensure environment variables are referenced if needed
  },
})

// Suggestion: Implement request throttling or debouncing in the frontend to limit API calls.
// For example, use a library like lodash.debounce or axios interceptors.
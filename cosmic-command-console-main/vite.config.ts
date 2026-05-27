import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      port: 5173, // כאן את קובעת את הפורט של הלקוח
      strictPort: true, // מבטיח שאם הפורט תפוס הוא לא יעבור אוטומטית לאחר
    },
  },
});
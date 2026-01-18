import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": "/Users/shaiju.edakulangara/projects/mercer/nodellm-apps/hr-chatbot/src",
    },
  },
});

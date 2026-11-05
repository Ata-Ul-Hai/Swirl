import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      NODE_ENV: "test",
      JWT_ACCESS_SECRET: "test_jwt_access_secret_1234567890",
      JWT_REFRESH_SECRET: "test_jwt_refresh_secret_1234567890",
    },
  },
});

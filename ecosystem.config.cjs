module.exports = {
  apps: [
    {
      name: "swirl-api",
      script: "./server/src/index.js",
      instances: "max", // Scale to all available CPU cores
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};

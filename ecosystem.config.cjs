module.exports = {
  apps: [
    {
      name: "hardhat-node",
      script: "npx",
      args: "hardhat node",
      interpreter: "node",
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "blue-carbon-backend",
      script: "./server.js",
      watch: false,
      autorestart: true,
      wait_ready: true,      // tells PM2 to wait until backend calls process.send('ready')
      listen_timeout: 30000, // wait up to 30 seconds for backend to be ready
      env: {
        NODE_ENV: "development",
      },
      // Ensure backend starts after Hardhat node is ready
      // Using "depends_on" is supported in PM2 v5+
      depends_on: ["hardhat-node"],
    },
  ],
};

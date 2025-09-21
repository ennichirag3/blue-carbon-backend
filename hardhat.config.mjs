import "@nomicfoundation/hardhat-toolbox";

export default {
  solidity: {
    version: "0.8.28", // ✅ matches your contracts
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};

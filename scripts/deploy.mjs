// scripts/deploy.mjs
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const initialSupply = hre.ethers.parseEther("1000"); // ✅ 1000 tokens
  const CarbonToken = await hre.ethers.getContractFactory("CarbonToken");
  const carbonToken = await CarbonToken.deploy(initialSupply);

  await carbonToken.waitForDeployment();

  console.log("CarbonToken deployed at:", await carbonToken.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

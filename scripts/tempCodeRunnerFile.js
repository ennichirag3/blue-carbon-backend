import { ethers } from "hardhat";

async function main() {
  const CarbonToken = await ethers.getContractFactory("CarbonToken");
  const token = await CarbonToken.deploy();
  await token.deployed();
  console.log("✅ CarbonToken deployed at:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

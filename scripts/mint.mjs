// scripts/mint.mjs
import hardhatPkg from "hardhat";
const { ethers } = hardhatPkg;
import { CONTRACT_ADDRESS } from "../constants.mjs";

async function main() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Set CONTRACT_ADDRESS in constants.mjs to the deployed address.");
  }
  const [deployer] = await ethers.getSigners();
  const carbon = await ethers.getContractAt("CarbonToken", CONTRACT_ADDRESS, deployer);

  // mint 100 tokens (ERC20 uses 18 decimals)
  const amount = ethers.parseUnits("100", 18);
  const tx = await carbon.mint(await deployer.getAddress(), amount);
  await tx.wait();
  console.log(`✅ Minted 100 CTK to deployer (${await deployer.getAddress()})`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

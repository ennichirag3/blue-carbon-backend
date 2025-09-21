// scripts/transfer.mjs
import hardhatPkg from "hardhat";
const { ethers } = hardhatPkg;
import { CONTRACT_ADDRESS } from "../constants.mjs";

async function main() {
  if (!CONTRACT_ADDRESS) throw new Error("Set CONTRACT_ADDRESS in constants.mjs");
  const [deployer, recipient] = await ethers.getSigners();

  const carbon = await ethers.getContractAt("CarbonToken", CONTRACT_ADDRESS, deployer);

  const amount = ethers.parseUnits("50", 18); // 50 tokens
  const tx = await carbon.transfer(await recipient.getAddress(), amount);
  await tx.wait();
  console.log(`✅ Transferred 50 CTK from ${await deployer.getAddress()} to ${await recipient.getAddress()}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

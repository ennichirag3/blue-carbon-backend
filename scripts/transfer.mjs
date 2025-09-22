// scripts/transfer.mjs
import hardhatPkg from "hardhat";
const { ethers } = hardhatPkg;
import { CONTRACT_ADDRESS } from "../constants.mjs";

async function main() {
  if (!CONTRACT_ADDRESS) throw new Error("Set CONTRACT_ADDRESS in constants.mjs");

  // Get signer accounts from Hardhat node
  const [deployer, recipient] = await ethers.getSigners();

  console.log(`🔑 Deployer: ${await deployer.getAddress()}`);
  console.log(`🎯 Recipient: ${await recipient.getAddress()}`);

  // Connect to deployed CarbonToken contract
  const carbon = await ethers.getContractAt("CarbonToken", CONTRACT_ADDRESS, deployer);

  // Amount to transfer (50 tokens)
  const amount = ethers.parseUnits("50", 18);

  // Send transaction
  const tx = await carbon.transfer(await recipient.getAddress(), amount);
  await tx.wait();

  console.log(
    `✅ Transferred 50 CTK from ${await deployer.getAddress()} to ${await recipient.getAddress()}`
  );
}

// Run script
main().catch((err) => {
  console.error("❌ Transfer script error:", err);
  process.exitCode = 1;
});

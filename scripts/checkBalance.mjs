// scripts/checkBalances.mjs
import hardhatPkg from "hardhat";
const { ethers } = hardhatPkg;
import { CONTRACT_ADDRESS } from "../constants.mjs";

async function main() {
  if (!CONTRACT_ADDRESS) throw new Error("Set CONTRACT_ADDRESS in constants.mjs");
  const [deployer, recipient] = await ethers.getSigners();
  const carbon = await ethers.getContractAt("CarbonToken", CONTRACT_ADDRESS, deployer);

  const balDeployer = await carbon.balanceOf(await deployer.getAddress());
  const balRecipient = await carbon.balanceOf(await recipient.getAddress());

  console.log("Deployer:", await deployer.getAddress(), "Balance:", ethers.formatUnits(balDeployer, 18));
  console.log("Recipient:", await recipient.getAddress(), "Balance:", ethers.formatUnits(balRecipient, 18));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

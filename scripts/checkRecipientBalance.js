import hre from "hardhat";

async function main() {
  const carbonToken = await hre.ethers.getContractAt(
    "CarbonToken",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );

  const recipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const balance = await carbonToken.balanceOf(recipient);
  console.log(`✅ Recipient Balance: ${hre.ethers.formatEther(balance)} CTK`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

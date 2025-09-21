import { CARBON_TOKEN_ADDRESS } from "./constants.js";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

// Provider and signer
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Hardhat or Ganache RPC
const signer = provider.getSigner(0);

// Load ABI from compiled artifact
const artifactPath = path.resolve("./artifacts/contracts/CarbonToken.sol/CarbonToken.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

// Function to get contract instance
export async function getCarbonToken() {
  return new ethers.Contract(CARBON_TOKEN_ADDRESS, artifact.abi, signer);
}

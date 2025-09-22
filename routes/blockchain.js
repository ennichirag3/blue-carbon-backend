import express from "express";
import { ethers } from "ethers";
import Transaction from "../models/Transaction.js";

const router = express.Router();

let provider;
let defaultSigner;

// --- Initialize blockchain connection ---
const initBlockchain = async () => {
  const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
  const RETRIES = 10;
  const DELAY = 1000;

  for (let i = 0; i < RETRIES; i++) {
    try {
      provider = new ethers.JsonRpcProvider(RPC_URL);
      const network = await provider.getNetwork();

      // Use Hardhat default account #0 as signer
      defaultSigner = new ethers.Wallet(
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        provider
      );

      console.log(`✅ Connected to blockchain: ${network.name} (chainId: ${network.chainId})`);
      console.log(`🔑 Default signer: ${defaultSigner.address}`);
      return;
    } catch (err) {
      console.warn(`⏳ Waiting for blockchain node... (${i + 1}/${RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, DELAY));
    }
  }
  console.error("❌ Failed to connect to blockchain");
};

await initBlockchain();

// --- GET balance ---
router.get("/balance/:address", async (req, res) => {
  try {
    if (!provider) throw new Error("Blockchain provider not initialized");

    const { address } = req.params;
    if (!ethers.isAddress(address))
      return res.status(400).json({ message: "Invalid Ethereum address" });

    const balanceWei = await provider.getBalance(address);
    const balance = ethers.formatEther(balanceWei);

    res.json({ address, balance });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch balance", error: err.message });
  }
});

// --- TRANSFER ETH (using default signer) ---
router.post("/transfer", async (req, res) => {
  try {
    if (!provider || !defaultSigner)
      throw new Error("Blockchain provider or signer not initialized");

    const { toAddress, amount } = req.body;

    if (!ethers.isAddress(toAddress))
      return res.status(400).json({ message: "Invalid Ethereum address" });
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const tx = await defaultSigner.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount.toString()),
    });

    await tx.wait();

    await Transaction.create({
      from: defaultSigner.address.toLowerCase(),
      to: toAddress.toLowerCase(),
      amount,
      txHash: tx.hash,
    });

    res.json({ message: "Transfer successful ✅", txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ message: "Transfer failed", error: err.message });
  }
});

// --- GET all transactions ---
router.get("/history", async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history", error: err.message });
  }
});

// --- Filter transactions by wallet address ---
router.get("/history/filter/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!ethers.isAddress(walletAddress))
      return res.status(400).json({ message: "Invalid Ethereum address" });

    const normalized = walletAddress.toLowerCase();
    const txs = await Transaction.find({
      $or: [{ from: normalized }, { to: normalized }],
    }).sort({ createdAt: -1 });

    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch filtered history", error: err.message });
  }
});

export default router;

import express from "express";
import { ethers } from "ethers";
import Transaction from "../models/Transaction.js";

const router = express.Router();

let provider;

// --- Initialize provider with retries ---
const initBlockchain = async () => {
  const RPC_URL = "http://127.0.0.1:8545";
  const RETRIES = 10;
  const DELAY = 1000; // 1s

  for (let i = 0; i < RETRIES; i++) {
    try {
      provider = new ethers.JsonRpcProvider(RPC_URL);
      await provider.getNetwork();
      console.log("✅ Connected to Hardhat blockchain");
      return;
    } catch (err) {
      console.log(`⏳ Waiting for Hardhat node... (${i + 1}/${RETRIES})`);
      await new Promise((r) => setTimeout(r, DELAY));
    }
  }
  console.error("❌ Blockchain connection failed: Hardhat node not detected");
};

await initBlockchain();

// --- GET balance ---
router.get("/balance/:address", async (req, res) => {
  try {
    const { address } = req.params;
    if (!provider) throw new Error("Blockchain provider not connected");
    if (!ethers.isAddress(address)) return res.status(400).json({ message: "Invalid Ethereum address" });
    const balanceWei = await provider.getBalance(address);
    const balance = ethers.formatEther(balanceWei);
    res.json({ address, balance });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch balance", error: err.message });
  }
});

// --- Transfer ETH dynamically with sender private key ---
router.post("/transfer", async (req, res) => {
  try {
    const { fromPrivateKey, toAddress, amount } = req.body;

    if (!fromPrivateKey || !ethers.isHexString(fromPrivateKey, 32))
      return res.status(400).json({ message: "Invalid sender private key" });
    if (!ethers.isAddress(toAddress))
      return res.status(400).json({ message: "Invalid Ethereum address" });
    if (!amount || isNaN(amount))
      return res.status(400).json({ message: "Invalid amount" });

    // create a signer dynamically from the provided private key
    const tempSigner = new ethers.Wallet(fromPrivateKey, provider);

    const tx = await tempSigner.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount.toString())
    });
    await tx.wait();

    await Transaction.create({
      from: tempSigner.address.toLowerCase(),
      to: toAddress.toLowerCase(),
      amount,
      txHash: tx.hash
    });

    res.json({ message: "Transfer successful", txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ message: "Transfer failed", error: err.message });
  }
});

// --- Get all transactions ---
router.get("/history", async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history", error: err.message });
  }
});

// --- Filter transactions by wallet ---
router.get("/history/filter/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!ethers.isAddress(walletAddress)) return res.status(400).json({ message: "Invalid Ethereum address" });
    const normalized = walletAddress.toLowerCase();
    const txs = await Transaction.find({
      $or: [{ from: normalized }, { to: normalized }]
    }).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch filtered history", error: err.message });
  }
});

export default router;

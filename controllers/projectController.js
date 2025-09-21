import Project from "../models/Project.js";
import { ethers } from "ethers";
import QRCode from "qrcode";

// --- Blockchain setup ---
let provider;
let signer;

const initBlockchain = async () => {
  const RPC_URL = "http://127.0.0.1:8545";
  const RETRIES = 10;
  const DELAY = 1000;

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

// ============================
// PROJECT APIs
// ============================

// 1. CREATE a new project
export const createProject = async (req, res) => {
  try {
    const { name, location, carbonSaved, description } = req.body;
    if (!description) return res.status(400).json({ message: "description is required" });

    const project = new Project({ name, location, carbonSaved, description });
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. GET all projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. UPDATE project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Project.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. DELETE project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. GET project QR code
export const getProjectQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const projectURL = `${process.env.FRONTEND_BASE_URL}/projects/${id}`;
    const qrCodeDataURL = await QRCode.toDataURL(projectURL);

    res.json({ projectId: id, qrCode: qrCodeDataURL, projectURL });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// BONUS: total projects
export const getProjectCount = async (req, res) => {
  try {
    const count = await Project.countDocuments();
    res.json({ totalProjects: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// BONUS: total carbon saved
export const getTotalCarbon = async (req, res) => {
  try {
    const result = await Project.aggregate([{ $group: { _id: null, totalCarbon: { $sum: "$carbonSaved" } } }]);
    res.json({ totalCarbonSaved: result[0]?.totalCarbon || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================
// WALLET APIs
// ============================

// Get wallet balance
export const getWalletBalance = async (req, res) => {
  try {
    const { address } = req.params;
    if (!ethers.isAddress(address)) return res.status(400).json({ message: "Invalid Ethereum address" });

    const balanceWei = await provider.getBalance(address);
    res.json({ address, balance: ethers.formatEther(balanceWei) + " ETH" });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch balance", error: err.message });
  }
};

// Transfer Carbon Credits dynamically using sender private key
export const transferCarbonCredits = async (req, res) => {
  try {
    const { fromPrivateKey, toAddress, amount } = req.body;

    if (!fromPrivateKey || !ethers.isHexString(fromPrivateKey, 32))
      return res.status(400).json({ message: "Invalid sender private key" });
    if (!ethers.isAddress(toAddress)) return res.status(400).json({ message: "Invalid Ethereum address" });
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const tempSigner = new ethers.Wallet(fromPrivateKey, provider);

    const tx = await tempSigner.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount.toString()),
    });
    await tx.wait();

    res.json({
      message: "Transfer successful",
      txHash: tx.hash,
      from: tempSigner.address,
      to: toAddress,
      amount,
    });
  } catch (err) {
    res.status(500).json({ message: "Transfer failed", error: err.message });
  }
};

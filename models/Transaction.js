import mongoose from "mongoose";

// Transaction schema for blockchain transfers
const transactionSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, lowercase: true }, // always store in lowercase
    to: { type: String, required: true, lowercase: true },   // always store in lowercase
    amount: { type: Number, required: true },                // ETH amount sent
    txHash: { type: String, required: true, unique: true },  // transaction hash on blockchain
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

// Model
const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;

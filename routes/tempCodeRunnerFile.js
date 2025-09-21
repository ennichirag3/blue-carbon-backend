console.log("✅ projectRoutes.js loaded");
const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// 🟢 BONUS ROUTES – MUST COME BEFORE /:id ROUTES

// 1️⃣ Count all projects
router.get("/bonus/count/all", async (req, res) => {
  try {
    const count = await Project.countDocuments();
    res.json({ success: true, totalProjects: count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2️⃣ Total carbon saved
router.get("/bonus/carbon/total", async (req, res) => {
  try {
    const result = await Project.aggregate([
      { $group: { _id: null, totalCarbon: { $sum: "$carbonSaved" } } }
    ]);
    res.json({
      success: true,
      totalCarbon: result.length > 0 ? result[0].totalCarbon : 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3️⃣ Filter projects by minimum carbon saved
router.get("/bonus/filter/:minCarbon", async (req, res) => {
  try {
    const minCarbon = Number(req.params.minCarbon);
    const projects = await Project.find({ carbonSaved: { $gte: minCarbon } });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🟢 MAIN CRUD ROUTES

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new project
router.post("/", async (req, res) => {
  try {
    const { name, location, carbonSaved } = req.body;

    if (!name || !location || !carbonSaved) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required." });
    }

    const newProject = new Project({ name, location, carbonSaved });
    await newProject.save();

    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update project by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    res.json({ success: true, data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete project by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

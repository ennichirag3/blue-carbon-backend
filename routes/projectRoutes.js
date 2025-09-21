import express from 'express';
import Project from '../models/Project.js';
import QRCode from 'qrcode';

const router = express.Router();

// --- CREATE a project ---
router.post('/', async (req, res) => {
  try {
    const { name, description, location, carbonSaved } = req.body;
    if (!name || !description || !location) {
      return res.status(400).json({ message: 'Name, description, and location are required' });
    }
    const project = new Project({ name, description, location, carbonSaved });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- UPDATE a project ---
router.put('/:id', async (req, res) => {
  try {
    const { name, description, location, carbonSaved } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, location, carbonSaved },
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- GET all projects ---
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- GET single project by ID ---
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- DELETE a project ---
router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- NEW: QR Code route ---
router.get('/qrcode/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // URL that QR code will point to
    const projectURL = `http://localhost:5001/projects/${project._id}`;

    // Generate QR code as data URL
    const qrCodeData = await QRCode.toDataURL(projectURL);

    res.json({ qrCode: qrCodeData, url: projectURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate QR code', error: err.message });
  }
});

export default router;

const Complaint = require('../models/complaint.model');
const Room = require('../models/room.model');
const path = require('path');
const fs = require('fs').promises;

// Get all complaint
exports.findAll = async (req, res) => {
  try {
    const complaint = await Complaint.find();
    // Check if complaint exist
    if (complaint.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({ data: complaint });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Get complaint by id
exports.findById = async (req, res) => {
  try {
    const id = req.params.id;
    const complaint = await Complaint.findById(id);
    // Check if complaint exist
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({ data: complaint });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Create complaint
exports.add = async (req, res) => {
  try {
    const { title, description } = req.body;
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'User ID is missing' });
    }
    // Check if room exists
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    // Check if complaint already exists
    const existingComplaint = await Complaint.findOne({
      room: room._id,
      user: req.user.id,
    });
    if (existingComplaint) {
      return res.status(409).json({ message: 'Complaint already exists' });
    }
    // Upload images
    const images = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));
    // Create complaint
    const complaint = new Complaint({
      user: req.user.id,
      title,
      description,
      images,
    });
    // Save complaint
    await complaint.save();
    // Add complaint to room
    room.complaints.push(complaint._id);
    await room.save();

    res
      .status(201)
      .json({ message: 'Room created successfully', data: complaint });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Update complaint by id
exports.update = async (req, res) => {
  try {
    const { title, description } = req.body;
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'User ID is missing' });
    }
    // Check if room exists
    const room = await Room.findById(req.params.id).populate('complaints');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    // Check if complaint exists
    const complaint = await Complaint.findById(room.complaints[0]._id);
    if (!complaint) {
      // Delete images if complaint not found
      if (req.files && req.files.length > 0) {
        await Promise.all(req.files.map((file) => fs.unlink(file.path)));
      }
      return res.status(404).json({ message: 'Complaint not found' });
    }
    // Update complaint
    complaint.title = title || complaint.title;
    complaint.description = description || complaint.description;
    //
    if (req.files && req.files.length > 0) {
      // Delete old images
      if (complaint.images && complaint.images.length > 0) {
        for (const image of complaint.images) {
          const filePath = path.resolve(image.url);

          await fs.access(filePath);
          await fs.unlink(filePath);
        }
      }
      // Update images
      complaint.images = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
      }));
    }
    // Save complaint
    await complaint.save();

    res.status(200).json({ message: 'Complaint updated!', complaint });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Delete complaint by id
exports.deleteById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    // Check if complaint exist
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Delete images
    const deleteImages = complaint.images.map((image) => {
      const filePath = path.resolve(
        __dirname,
        '../../public/images/complaint',
        image.filename
      );
      return fs.unlink(filePath);
    });
    await Promise.all(deleteImages);

    // Delete complaint
    await Complaint.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Complaint deleted!' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

const Complaint = require('../models/roomComplaint.model');
const Room = require('../models/room.model');
const User = require('../models/user.model');
const path = require('path');
const fs = require('fs').promises;

// Get all complaint
exports.getAll = async (req, res) => {
  try {
    // Check if complaint exist
    const complaint = await Complaint.find()
      .populate({
        path: 'user',
        select: 'fullName',
      })
      .populate({
        path: 'room',
        select: 'name',
      });
    if (complaint.length === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.status(200).json({ message: 'Data found', data: complaint });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Get complaint by id
exports.getById = async (req, res) => {
  try {
    // Check if complaint exist
    const complaint = await Complaint.find({ user: req.user.id });

    if (complaint.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({ message: 'Complaint found', data: complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Create complaint
exports.create = async (req, res) => {
  const { title, description } = req.body;
  try {
    // Check data room exists
    const room = await Room.findById(req.params.id);
    if (!room) {
      // Delete images if data not found
      if (req.files && req.files.length > 0) {
        await Promise.all(req.files.map((file) => fs.unlink(file.path)));
      }
      return res.status(404).json({ message: 'Data not found' });
    }

    // Check if complaint already exists
    const existingComplaint = await Complaint.findOne({
      user: req.user.id,
      room: room._id,
    });
    if (existingComplaint) {
      // Delete images if data not found
      if (req.files && req.files.length > 0) {
        await Promise.all(req.files.map((file) => fs.unlink(file.path)));
      }
      return res.status(409).json({ message: 'Complaint already exists' });
    }

    // Upload images
    // const images = req.files.complaintImages
    //   ? req.files.complaintImages.map((file) => ({
    //       url: path.join('images/complaint', file.filename),
    //       filename: file.filename,
    //     }))
    //   : [];

    // Create complaint
    const complaint = new Complaint({
      user: req.user.id,
      room: room._id,
      title,
      description,
      // images,
    });

    // Save data complaint
    await complaint.save();

    // Add data complaint to room
    room.complaints.push(complaint._id);
    await room.save();

    res.status(201).json({ message: 'Data created', data: complaint });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Update complaint by id
exports.update = async (req, res) => {
  const { title, description } = req.body;
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      // Delete images if complaint not found
      if (req.files && req.files.length > 0) {
        await Promise.all(req.files.map((file) => fs.unlink(file.path)));
      }
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Update data
    complaint.title = title || complaint.title;
    complaint.description = description || complaint.description;

    // Upload images
    if (req.files.complaintImages) {
      if (complaint.images) {
        await Promise.all(
          complaint.images.map((image) =>
            fs.unlink(path.resolve(__dirname, '../../public', image.url))
          )
        );
      }
      complaint.images = req.files.complaintImages.map((file) => ({
        url: path.join('images/complaint', file.filename),
        filename: file.filename,
      }));
    }

    // Save data
    await complaint.save();

    res.status(200).json({ message: 'Data updated', data: complaint });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Update status complaint by id
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  try {
    //  Validate the received status
    if (!['Menunggu', 'Selesai'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Search for complaints by ID
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Update complaint status
    complaint.status = status;

    //  save complaint status
    await complaint.save();

    // Send response successful
    res
      .status(200)
      .json({ message: 'Status updated successfully', data: complaint });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Update response complaint by id
exports.updateResponse = async (req, res) => {
  const { id } = req.params;
  const { response } = req.body;
  // Search for complaints by ID
  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    // Update complaint response
    complaint.response = response;

    // Save complaint response
    await complaint.save();

    // Send response successful
    return res
      .status(200)
      .json({ message: 'Response updated successfully', complaint });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Server error, failed to update response' });
  }
};

// Delete complaint by id
exports.deleteById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Data not found' });
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

    // Remove references from Room table
    await Room.updateOne(
      { complaints: req.params.id },
      { $pull: { complaints: req.params.id } }
    );

    // Delete complaint
    await Complaint.findByIdAndDelete(complaint.id);

    res.status(200).json({ message: 'Data deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

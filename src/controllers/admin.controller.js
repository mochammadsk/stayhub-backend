const User = require('../models/user.model');
const dotenv = require('dotenv');

dotenv.config();

// Show data user
exports.getAll = async (req, res) => {
  try {
    const user = await User.find();
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.status(200).json({ message: 'User found', data: user });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Show data user by id
exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.status(200).json({ message: 'User found', data: user });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Update role user
exports.updateRole = async (req, res) => {
  const role = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, role, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.status(200).json({ message: 'Data updated', data: user });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Delete user data
exports.deleteById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

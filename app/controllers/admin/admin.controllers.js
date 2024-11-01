const Admin = require("../../models/admin/admin.models");
const User = require("../../models/user/user.models");
const dotenv = require("dotenv");

dotenv.config();

// Show data user
exports.findAll = (req, res) => {
  User.find()
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send({ message: err.message }));
};

// Show data user by id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send({ message: err.message }));
};

// Update role user
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updateUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!updateUser) {
      return res.status(404).send({ message: "User not found!" });
    }

    res
      .status(200)
      .send({ message: "User updated successfully!", data: updateUser });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Delete user data by id
exports.delete = (req, res) => {
  const id = req.params.id;

  User.findOneAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: "Data can't be deleted!" });
      }
      res.send({ message: "Data deleted successfully!" });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

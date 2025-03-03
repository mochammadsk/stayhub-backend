const Room = require("../models/room.model");
const Transaction = require("../models/transaction.model");
const User = require("../models/user.model");
const snap = require("../config/midtranst");

exports.create = async (req, res) => {
  // Check if user is authenticated
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(400).json({ message: "User ID is missing" });
  }

  // Check if room exists
  const room = await Room.findById(req.params.id)
    .populate({
      path: "type",
      select: "name cost",
    })
    .populate({
      path: "transaction",
      select: "status",
    });
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  // Check if room is available
  if (room.status === "unavailable") {
    return res.status(400).json({ message: "Room is full" });
  }

  // Check if user already has a pending transaction
  const existingTransaction = await Transaction.findOne({
    user: req.user.id,
    room: req.params.id,
  });
  if (existingTransaction) {
    return res.status(400).json({
      message: `You already have a pending transaction for ${room.name}`,
    });
  }

  // Create transaction
  const transaction = new Transaction({
    user: req.user.id,
    room: req.params.id,
    cost: room.type[0].cost,
  });

  // Save transaction
  const result = await transaction.save();

  // Create Midtrans transaction
  try {
    const parameter = {
      transaction_details: {
        order_id: result._id,
        gross_amount: result.cost,
      },
      item_details: [
        {
          id: result._id,
          price: result.cost,
          quantity: "1",
          name: room.name,
          category: room.type[0].name,
        },
      ],
      customer_details: {
        first_name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
      },
    };

    const midtrans = await snap.createTransaction(parameter);

    // Update room data
    room.transaction.push(result._id);
    room.status = "unavailable";
    await room.save();

    // Add room to user
    user.room.push(room._id);
    await user.save();

    res.status(201).json({
      message: "Transaction created successfully",
      data: midtrans,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.update = async (req, res) => {
  const { status } = req.body;
  // Validasi input status
  const validStatuses = ["pending", "completed", "canceled"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid transaction status" });
  }

  try {
    // Cari transaksi berdasarkan ID
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Perbarui status transaksi
    transaction.status = status;
    await transaction.save();

    res.status(200).json({
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
    res.status(200).json({
      message: "Get all transactions successfully",
      data: transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message || error 
    });
  }
};

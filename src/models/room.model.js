const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TypeRoom' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    complaints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }],
    images: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

roomSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  return { id: _id, ...object };
});

module.exports = mongoose.model('Room', roomSchema);

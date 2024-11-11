const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    images: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
      },
    ],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  },
  {
    timestamps: true,
  }
);

roomSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('Room', roomSchema);

const mongoose = require('mongoose');

const pickupSlotSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: [true, 'Slot time is required'],
    },
    maxCapacity: {
      type: Number,
      default: 20,
      min: 1,
    },
    currentBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0], // YYYY-MM-DD
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: isFull
pickupSlotSchema.virtual('isFull').get(function () {
  return this.currentBookings >= this.maxCapacity;
});

module.exports = mongoose.model('PickupSlot', pickupSlotSchema);

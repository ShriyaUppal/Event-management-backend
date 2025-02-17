const mongoose = require("mongoose");
const User = require("./User");

const eventSchema = new mongoose.Schema({
  name: { type: String, require: true },
  description: { type: String, require: true },
  date: { type: Date, require: true },
  location: { type: String, default: "Online" },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  category: {
    type: String,
    enum: ["conference", "workshop", "webinar", "meetup"],
    required: true,
  },
  tags: [{ type: String }],
});

module.exports = mongoose.model("Event", eventSchema);

const Event = require("../models/Event");
const mongoose = require("mongoose");

// ✅ Create Event
exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      location = "Online",
      category,
      tags,
    } = req.body;

    if (!name || !description || !date || !category) {
      return res
        .status(400)
        .json({ message: "All fields except tags and location are required." });
    }

    const formattedCategory = category.toLowerCase();
    const validCategories = ["conference", "workshop", "webinar", "meetup"];
    if (!validCategories.includes(formattedCategory)) {
      return res.status(400).json({ message: "Invalid category selected" });
    }

    let tagArray = Array.isArray(tags)
      ? tags.map((tag) => tag.trim())
      : typeof tags === "string"
      ? tags.split(",").map((tag) => tag.trim())
      : [];

    const newEvent = new Event({
      name,
      description,
      date,
      location,
      createdBy: req.user.id,
      attendees: [],
      category: formattedCategory,
      tags: tagArray,
    });

    await newEvent.save();
    res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    console.error("❌ Error in creating event:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Get All Events with Search & Sorting
exports.getAllEvents = async (req, res) => {
  try {
    const { search, sort } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    let sortOption = {};
    if (sort === "newest") sortOption = { date: -1 };
    if (sort === "oldest") sortOption = { date: 1 };
    if (sort === "attendees") sortOption = { attendees: -1 };

    const events = await Event.find(query)
      .sort(sortOption || { date: -1 }) // ✅ Default sorting
      .populate("createdBy", "name");

    res.json(events);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching events", error: error.message });
  }
};

// ✅ Get Single Event
exports.getEventById = async (req, res) => {
  try {
    let eventId = req.params.id.trim();

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await Event.findById(eventId).populate("createdBy", "name");

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json(event);
  } catch (error) {
    console.error("❌ Error fetching event:", error);
    res.status(500).json({ message: "Error fetching event", error });
  }
};

// ✅ Update Event
exports.updateEvent = async (req, res) => {
  try {
    let eventId = req.params.id.trim();

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid Event ID format" });
    }

    const { name, eventName, description, date, category } = req.body;
    const updatedName = eventName || name;

    if (
      !updatedName ||
      typeof updatedName !== "string" ||
      updatedName.trim() === ""
    ) {
      return res
        .status(400)
        .json({ message: "Event name is required and must be a string" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { name: updatedName, description, date, category }, // ✅ Fix field name
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res
      .status(200)
      .json({ message: "Event updated successfully", updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    res
      .status(500)
      .json({ message: "Error updating event", error: error.message });
  }
};

// ✅ Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    let eventId = req.params.id.trim();

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully", event });
  } catch (error) {
    console.error("Error deleting event:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

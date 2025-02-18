const Event = require("../models/Event");
const mongoose = require("mongoose");

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

    // ✅ Validate required fields
    if (!name || !description || !date || !category) {
      return res
        .status(400)
        .json({ message: "All fields except tags and location are required." });
    }

    // ✅ Convert category to lowercase before validation
    const formattedCategory = category.toLowerCase();

    // ✅ Check if the category is valid
    const validCategories = ["conference", "workshop", "webinar", "meetup"];
    if (!validCategories.includes(formattedCategory)) {
      return res.status(400).json({ message: "Invalid category selected" });
    }

    // ✅ Ensure `tags` is always an array
    let tagArray = [];
    if (Array.isArray(tags)) {
      tagArray = tags.map((tag) => tag.trim()); // ✅ If already an array, trim each element
    } else if (typeof tags === "string") {
      tagArray = tags.split(",").map((tag) => tag.trim()); // ✅ If string, split by comma
    }

    // ✅ Create a new event
    const newEvent = new Event({
      name,
      description,
      date,
      location,
      createdBy: req.user.id,
      attendees: [],
      category: formattedCategory, // ✅ Use lowercase category
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

exports.getAllEvents = async (req, res) => {
  try {
    const { search, sort } = req.query;

    let query = {};

    // 🔍 Apply search filter (case-insensitive)
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    let sortOption = {};
    if (sort === "newest") sortOption.date = -1; // Descending
    if (sort === "oldest") sortOption.date = 1; // Ascending
    if (sort === "attendees") sortOption.attendees = -1; // Most attendees first

    const events = await Event.find(query)
      .sort(sortOption)
      .populate("createdBy", "name");

    console.log(req.query); // Debugging: Print query parameters
    res.json(events);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching events", error });
  }
};

//Get Single events
exports.getEventById = async (req, res) => {
  try {
    let eventId = req.params.id.trim(); // Remove spaces & newline characters
    console.log("🔍 Requested Event ID:", eventId);

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await Event.findById(eventId).populate("createdBy", "name");
    console.log("📌 Fetched Event:", event);

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json(event);
  } catch (error) {
    console.error("❌ Error fetching event:", error);
    res.status(500).json({ message: "Error fetching event", error });
  }
};

//Update Event
exports.updateEvent = async (req, res) => {
  try {
    let eventId = req.params.id.trim(); // Trim spaces and newline characters

    // Validate ObjectId format
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
      { eventName: updatedName, description, date, category },
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

//Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    let eventId = req.params.id.trim(); // Ensure no spaces or newline issues
    console.log("Received Event ID:", `"${eventId}"`); // Debugging log

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    // Attempt to delete the event
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

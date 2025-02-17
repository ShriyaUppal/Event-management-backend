const express = require("express");
const eventController = require("../controllers/eventController");
const {
  protect,
  protectEventActions,
} = require("../middlewares/authMiddleware"); // ✅ Destructure correct middleware

const router = express.Router();

router.post(
  "/create",
  protect,
  protectEventActions,
  eventController.createEvent
);
router.put("/:id", protect, protectEventActions, eventController.updateEvent);
router.delete(
  "/:id",
  protect,
  protectEventActions,
  eventController.deleteEvent
);
router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);

module.exports = router;

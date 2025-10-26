const express = require("express");
const router = express.Router();
const Workout = require("../models/workout");
const authenticate = require("../middleware/authenticateToken");

// Create a new workout plan
router.post("/", authenticate, async (req, res) => {
  try {
    const workout = new Workout(req.body);
    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all workout plans
router.get("/", authenticate, async (req, res) => {
  try {
    const workouts = await Workout.find();
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

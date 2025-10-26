const express = require("express");
const router = express.Router();
const CustomDiet = require("../models/customDiet");
const authenticate = require("../middleware/authenticateToken");

// Create a new diet plan
router.post("/", authenticate, async (req, res) => {
  try {
    const dietPlan = new CustomDiet({ ...req.body, userId: req.user.userId });
    await dietPlan.save();
    res.status(201).json(dietPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all diet plans
router.get("/", authenticate, async (req, res) => {
  try {
    const dietPlans = await CustomDiet.find({userId: req.user.userId}).sort({date: -1});
    res.json(dietPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

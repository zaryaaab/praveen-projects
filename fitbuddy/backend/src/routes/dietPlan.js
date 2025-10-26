const express = require("express");
const router = express.Router();
const DietPlan = require("../models/dietPlan");
const authenticate = require("../middleware/authenticateToken");
const User = require("../models/user");

// Create a new diet plan
router.post("/", authenticate, async (req, res) => {
  try {
    const dietPlan = new DietPlan(req.body);
    await dietPlan.save();
    res.status(201).json(dietPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all diet plans
router.get("/", authenticate, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const weight = user.weight;
      const heightCm = user.height;
      const heightM = heightCm / 100;
      const bmi = (weight / (heightM * heightM)).toFixed(2);
      const type =
        bmi < 18.5 ? "under" : bmi >= 18.5 && bmi < 25 ? "healthy" : "over";
  
      const dietPlans = await DietPlan.find({ type });
      res.json(dietPlans);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;

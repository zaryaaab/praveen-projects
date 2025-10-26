const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  carbs: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
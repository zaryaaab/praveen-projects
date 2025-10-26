const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  exercises: [{
    name: {
      type: String,
      required: true
    },
    sets: {
      type: Number,
      required: true
    },
    reps: {
      type: Number,
      required: true
    }
  }]
});

module.exports = mongoose.model('Workout', workoutSchema);
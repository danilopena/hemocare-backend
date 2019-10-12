const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 2
  },
  email: {
    type: String,
    unique: true,
    required: true,
    max: 255,
    min: 6
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6
  },
  date: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  authToken: {
    type: String,
    select: false
  },
  pathology: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("User", userSchema);

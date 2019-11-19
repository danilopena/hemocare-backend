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
  },
  agreeToTerms: {
    type: Boolean,
    required: true
  },
  initialStock: {
    type: Number,
    default: 0
  },
  dosage: {
    type: Number,
    default: 0
  },
  infusions: {
    type: Number,
    default: 0
  },
  percentageUsed: {
    type: Number,
    default: 0
  }
});
userSchema.pre("save", function(next) {
  this.percentageUsed =
    (this.infusions * 100) / (this.initialStock + this.infusions);

  next();
});
module.exports = mongoose.model("User", userSchema);

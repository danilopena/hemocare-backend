const mongoose = require("mongoose");

const historySchema = mongoose.Schema({
  typeInfusion: {
    type: String,
    required: true
  },
  dosage: {
    type: Number,
    required: true
  },
  recurring: {
    type: Boolean
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});
module.exports = mongoose.model("History", historySchema);

const mongoose = require("mongoose");
const format = require('date-fns/format')
const parseISO = require('date-fns/parseISO')
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
  },
  comment: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    required: true
  },
  formattedDate: {
    type: String,
    default: null

  }
});
historySchema.pre("save", function(next) {
  this.formattedDate = format(this.date, 'dd/MM/yyyy HH:mm:ss')

  next();
});
module.exports = mongoose.model("History", historySchema);

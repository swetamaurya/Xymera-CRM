const mongoose = require("mongoose");
const moment = require("moment");

// Leaves Schema
const leavesSchema = new mongoose.Schema({
  leaveId: { type: String }, // Unique leave identifier
  from: { type: String }, // Start date of the leave
  to: { type: String }, // End date of the leave
  halfDay: {
    type: String,
    //enum: ["First Half", "Second Half", "Full Half"],
    default: null,
  },
  leaveType: {
    type: String,
    // enum: ["vacation", "maternity", "sick", "casual", "other"],
    default: null,
  },
  name: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Approved by Admin/Manager
  noOfDays: { type: String, default: 0 }, // Total number of leave days
  reason: { type: String }, // Reason for leave
  approveReason: { type: String },
  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Rejected"], 
    default: "Pending" 
  }, // Leave status
  remark: { type: String }, // Optional remarks
  createdAt: {
    type: String,
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },
  updatedAt: {
    type: String,
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },
});

 
// Middleware to format dates (`from` and `to`) before saving
leavesSchema.pre("save", function (next) {
  // Parse and format 'from' date
  if (this.from) {
    const formattedFrom = moment(this.from, moment.ISO_8601, true).isValid() // Try ISO first
      ? moment(this.from) // Valid ISO format
      : moment(this.from, ["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "DD-MM-YYYY"], true); // Custom formats

    if (formattedFrom.isValid()) {
      this.from = formattedFrom.format("DD-MM-YYYY");
    } else {
      return next(new Error("Invalid 'from' date format. Use formats like DD-MM-YYYY, MM/DD/YYYY, etc."));
    }
  }

  // Parse and format 'to' date
  if (this.to) {
    const formattedTo = moment(this.to, moment.ISO_8601, true).isValid()
      ? moment(this.to)
      : moment(this.to, ["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "DD-MM-YYYY"], true);

    if (formattedTo.isValid()) {
      this.to = formattedTo.format("DD-MM-YYYY");
    } else {
      return next(new Error("Invalid 'to' date format. Use formats like DD-MM-YYYY, MM/DD/YYYY, etc."));
    }
  }

  // Always update the updatedAt field
  this.updatedAt = moment().format("DD-MM-YYYY HH:mm");
  next();
});




// Leaves Model
const Leaves = mongoose.model("Leaves", leavesSchema);

module.exports = Leaves;

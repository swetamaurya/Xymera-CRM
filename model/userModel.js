const mongoose = require('mongoose');
const moment = require('moment');

// Sequence Schema
const sequenceSchema = new mongoose.Schema({
  seqName: { type: String, required: true, unique: true },
  seqValue: { type: Number, default: 0 },
});

const Sequence = mongoose.model('Sequence', sequenceSchema);

// Function to get the next sequence value for userId
async function getNextSequenceValue(type) {
  const prefixMap = {
    Admin: "ADM",
    Employee: "EMP",
    Manager: "MMG",
    Doctor: "DR",
    HR: "HR",
    Chemist: "CHM",
  };

  const prefix = prefixMap[type] || "USR";

  try {
    const sequenceDoc = await Sequence.findOneAndUpdate(
      { seqName: type },
      { $inc: { seqValue: 1 } },
      { new: true, upsert: true }
    );

    const sequenceNumber = sequenceDoc.seqValue.toString().padStart(4, "0");
    return `${prefix}-${sequenceNumber}`;
  } catch (error) {
    throw new Error("Error generating sequence value: " + error.message);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String },
  name: { type: String },
  email: { type: String },
  password: { type: String },
  mobile: { type: String },
  roles: { type: String, required: true },
  userName: { type: String },
  visitFrequency: { type: Number, default: 0 },
  category: { type: String },
  speciality: { type: String },
  shiftStart: { type: String },
  shiftEnd: { type: String },
  doctor_time1: { type: String },
  doctor_time2: { type: String },
  chemist_time1: { type: String },
  chemist_time2: { type: String },
  area: { type: String },
  joiningDate: { type: String },
  image: { type: String },
  onboarding: { type: String },
  departments: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  designations: { type: String },
  km: { type: String },
  // currentOtp: { type: Number },
  status: { type: String, default: "Active" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { 
    type: String, 
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },
  updatedAt: { 
    type: String, 
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },
});

// Pre-save hook to generate userId and update timestamps
userSchema.pre("save", async function (next) {
  try {
    if (!this.userId && this.roles) {
      this.userId = await getNextSequenceValue(this.roles);
    } else if (!this.roles) {
      return next(new Error("Roles is required to generate userId"));
    }
    this.updatedAt = moment().format("DD-MM-YYYY HH:mm");
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = { User, Sequence };

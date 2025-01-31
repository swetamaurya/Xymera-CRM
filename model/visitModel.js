const mongoose = require('mongoose');
const moment = require('moment');

// Visit Schema
const visitSchema = new mongoose.Schema({
  visitId: { type: String },
  visitType: { type: String },
  visitDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // visitManager: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  
  // visitEmployee: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  
  visitChemist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  visitWorkingWith: { type: String, default: 'Alone' }, //  
  visitProduct: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  countVisitFrequency: { type: Number, default: 0},
  frequencyStatus : { type: String ,default: 'In Complete'},
  multiDateFrequencyArray: { type: [String], default: [] },
     visitDate: {
    type: String,
    default: () => moment().format('DD-MM-YYYY'), // Save as DD-MM-YYYY
  },
  visitTime: {
    type: String,
    default: () => moment().format('HH:mm'),
  },
  remark: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Remark' }],
  status: { type: String, default: 'Pending' },
  createdAt: {
    type: String,
    default: () => moment().format('DD-MM-YYYY HH:mm'), // Save as DD-MM-YYYY HH:mm
  },
  updatedAt: {
    type: String,
    default: () => moment().format('DD-MM-YYYY HH:mm'), // Save as DD-MM-YYYY HH:mm
  },
});


// Middleware to format `updatedAt` on save
visitSchema.pre('save', function (next) {
  this.updatedAt = moment().format('DD-MM-YYYY HH:mm'); // Ensure format consistency
  next();
});

const Visit = mongoose.model('Visit', visitSchema);

// Remark Schema
const remarkSchema = new mongoose.Schema({
  visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
  remarkDate: {
    type: String,
    default: () => moment().format('DD-MM-YYYY'), // Save as DD-MM-YYYY
  },
  remarkTime: {
    type: String,
    default: () => moment().format('HH:mm'),
  },
  remarkText: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: {
    type: String, // Use String to ensure consistent formatting
    default: () => moment().format('DD-MM-YYYY HH:mm'),
  },
  updatedAt: {
    type: String,
    default: () => moment().format('DD-MM-YYYY HH:mm'),
  },
});

// Middleware to update `updatedAt` field on save
remarkSchema.pre('save', function (next) {
  this.updatedAt = moment().format('DD-MM-YYYY HH:mm'); // Ensure format consistency
  next();
});

const Remark = mongoose.model('Remark', remarkSchema);

module.exports = { Visit, Remark };

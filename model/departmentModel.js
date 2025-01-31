const mongoose = require('mongoose');
const moment = require("moment")
const DepartmentSchema = new mongoose.Schema({
  name: { type: String },
  createdAt: { 
    type: String, 
    default: () => moment().format('DD-MM-YYYY HH:mm')   
},
updatedAt: { 
    type: String, 
    default: () => moment().format('DD-MM-YYYY HH:mm')   
}
});


  
  DepartmentSchema.pre('save', function (next) {
    this.updatedAt = moment().format('DD-MM-YYYY HH:mm');
    next();
  });
  
const Department = mongoose.model('Department', DepartmentSchema);
 module.exports = Department

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    default: 'admin' 
  },
  password: {
    type: String,
    required: true,
    default: 'admin' 
  }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;

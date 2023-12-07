const mongoose = require('mongoose');

const marksAndCommentsSchema = new mongoose.Schema({
  assignmentName: {
    type: String,
    unique: true,
    required: true
  },
  marks: {
    type: Number,
    default: null
  },
  comment: {
    type: String,
    default: null
  }
});

const MarksAndComments = mongoose.model('MarksAndComments', marksAndCommentsSchema);

module.exports = MarksAndComments;

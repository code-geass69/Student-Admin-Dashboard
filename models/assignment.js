const express = require('express')
const mongoose = require('mongoose')
const assignmentSchema = new mongoose.Schema({
    title: String,
    file: String,
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
const express = require("express");
const bcrypt = require("bcrypt");
// connection to mongodb
const mongoose = require("mongoose");

// creating database schema
const userschema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email_id: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isConfirmed: {
    type: Boolean,
  },
});

module.exports = mongoose.model("user", userschema);

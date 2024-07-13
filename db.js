const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://root:1234@cluster0.qvrn0pr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("connected to database");
  } catch (err) {
    console.log("error");
  }
};

module.exports = connectDB;

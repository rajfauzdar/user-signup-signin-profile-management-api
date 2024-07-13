const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const bodyParser = require("body-parser");

// Middleware
const connectDB = require("./db");
const app = express();
app.use(bodyParser.json());
connectDB();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const port = 3000;
app.use("/api", require("./routes"));
app.listen(port, () => {
  console.log("server is running on port", port);
});

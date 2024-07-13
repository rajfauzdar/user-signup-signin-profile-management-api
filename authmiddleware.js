const jwt = require("jsonwebtoken");
const userModel = require("./index");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.header("Authorization").replace("Bearer ", "");
    console.log(token);
    if (!token) {
      return res.status(401).send({ error: "Authentication required" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    // Find the user associated with the token
    const user = await userModel.findOne({
      email_id: decoded.email_id,
    });
    if (!user) {
      return res.status(401).send({ error: "User not found" });
    }

    // Attach the user to the request object and proceed
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;

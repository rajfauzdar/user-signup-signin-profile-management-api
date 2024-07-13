const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const { hashPassword, comparePassword } = require("./helper");
const usermodel = require("./index");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const signup_controller = async (req, res) => {
  try {
    const { username, email_id, password } = req.body;

    // Validate the required fields
    if (!username) {
      return res.status(400).send({
        success: false,
        message: "username is required",
      });
    }
    if (!email_id) {
      return res.status(400).send({
        success: false,
        message: "email_id is required",
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "password is required",
      });
    }

    // Check if the user already exists
    const existinguser = await usermodel.findOne({ email_id });
    if (existinguser) {
      return res.status(400).send({
        success: false,
        message: "user already exists",
      });
    }

    const userEmail = email_id;

    // Generate confirmation token
    const token = jwt.sign({ email_id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Configure the email transport using nodemailer
    let config = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    };

    let transporter = nodemailer.createTransport(config);

    // Generate the email using Mailgen
    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Raj Fauzdar",
        link: "https://your-app-domain.com/",
      },
    });

    let response = {
      body: {
        name: username,
        intro:
          "Thank you for signing up. Please confirm your email by clicking the link below.",
        action: {
          instructions: "To get started with your account, please click here:",
          button: {
            color: "#22BC66", // Optional action button color
            text: "Confirm your email",
            link: `https://your-app-domain.com/confirm?token=${token}`,
          },
        },
        outro: "Dhanyawad! Have a lovely day.",
      },
    };

    let mail = MailGenerator.generate(response);

    let message = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: "Confirmation email",
      html: mail,
    };

    // Hash the user's password and save the user to the database
    const hashedPassword = await hashPassword(password);
    const user = await new usermodel({
      username,
      email_id,
      password: hashedPassword,
      isConfirmed: false,
    }).save();

    // Send the confirmation email
    transporter
      .sendMail(message)
      .then(() => {
        return res.status(201).send({
          success: true,
          msg: "User added successfully. Please check your email to confirm your account.",
        });
      })
      .catch((error) => {
        return res.status(500).json({ error });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: "Error in API",
      err,
    });
  }
};

const confirmapi = async (req, res) => {
  const { token } = req.query;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user associated with the token
    const user = await usermodel.findOne({ email_id: decoded.email_id });

    if (!user) {
      return res.status(400).send("Invalid token");
    }

    // Confirm the user's email
    user.isConfirmed = true;
    await user.save();

    res.status(200).send("Email confirmed successfully!");
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};

const signin_controller = async (req, res) => {
  try {
    const { email_id, password } = req.body;

    // Validate the required fields
    if (!email_id) {
      return res.status(400).send({
        success: false,
        message: "email_id is required",
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "password is required",
      });
    }

    // Check if the user exists
    const existinguser = await usermodel.findOne({ email_id });
    if (!existinguser) {
      return res.status(400).send({
        success: false,
        message: "user does not exist",
      });
    }

    // Uncomment the below lines if integrating with frontend
    // if(!existinguser.isConfirmed)
    // {
    //   return res.status(400).send({
    //     success: false,
    //     message: "user does not exist",
    //   });
    // }

    // Compare the provided password with the stored hashed password
    const password_status = await comparePassword(
      password,
      existinguser.password
    );
    if (!password_status) {
      return res.status(400).send({
        success: false,
        message: "Incorrect Password",
      });
    }

    // Generate a token for the user
    const token = jwt.sign({ email_id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).send({
      success: true,
      message: "user login successful",
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: "error in api",
      err,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    // Remove the password from the user object before sending the response
    user.password = undefined;
    res.status(200).send({ success: true, user });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "Error retrieving profile", error });
  }
};

module.exports = {
  signup_controller,
  signin_controller,
  getProfile,
  confirmapi,
};

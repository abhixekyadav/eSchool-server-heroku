const User = require("../models/user");
const jwt = require("jsonwebtoken");
// const SES = require("aws-sdk/clients/ses");
const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");
const {
  completeRegistrationParams,
  forgotPasswordParams,
} = require("../utils/email");
const { hashPassword, comparePassword } = require("../utils/auth");

// aws config old
// const ses = new SES({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
//   apiVersion: process.env.AWS_API_VERSION,
// });

// aws config new
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  // apiVersion: process.env.AWS_API_VERSION,
  version: process.env.AWS_API_VERSION,
};
const ses = new AWS.SES(awsConfig);

exports.register = async (req, res) => {
  try {
    // console.log(req.body);
    const { name, email, password } = req.body;
    // validation
    if (!name) return res.status(400).send("Name is required");
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required and should be min 6 characters long");
    }
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).send("Email is taken");

    // hash password
    const hashedPassword = await hashPassword(password);

    // register
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    // console.log("saved user", user);

    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

exports.login = async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;
    // check if our db has user with that email
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("No user found");

    // check password
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).send("Wrong password");

    // create signed token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // return user and token to client, exclude hashed password
    user.password = undefined;
    user.passwordResetCode = undefined;
    // without httpOnly, javascript will get access to cookie in browser
    // so to protect token use true
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true // only works on https
    });

    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

exports.currentUser = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("-password").exec();
    // console.log(user);
    res.json({ ok: true, user: user });
  } catch (err) {
    console.log(err);
  }
};

exports.logout = (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "Signout success!" });
  } catch (err) {
    console.log(err);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log(email);
    // generate unique code
    const shortCode = nanoid(6).toUpperCase();
    // console.log(shortCode);
    // save shortcode as passwordResetCode in db
    let user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    ).exec();
    // console.log(found);
    if (!user) return res.status(400).send("User not found");

    // prepare for email
    const params = forgotPasswordParams(email, shortCode);
    // send

    const emailSent = ses.sendEmail(params).promise();
    emailSent
      .then((data) => {
        console.log(data);
        res.json({ ok: true });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    // // ----test
    // console.log("email, code", email, code);
    // let u = await User.findOne({ email, passwordResetCode: code });
    // console.log("FOUND USER", u);
    // return;
    // // --test

    let u = await User.findOne({ email, passwordResetCode: code });

    if (!u) {
      return res.status(400).send("Email and code combination is incorrect");
    }

    // hash password
    const hashedPassword = await hashPassword(newPassword);

    let user = await User.findOneAndUpdate(
      { email, passwordResetCode: code },
      {
        password: hashedPassword,
        passwordResetCode: "",
      },
      { new: true }
    ).exec();
    // console.log("password reset done", user);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

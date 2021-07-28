const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Auth = require("../Middleware/Auth.js");

const User = require("../Models/urlSchema.js");
const { request, response } = require("express");

const transport = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
  port: 587,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const router = express.Router();

// Signup User
router.route("/signup").post(async (request, response) => {
  const { name, surname, email, password } = request.body;
  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return response.status(409).json({ error: "Email All Ready Exist" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      surname,
      email,
      password: passwordHash,
    });
    await user.save();
    console.log(user._id);

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    console.log(token);
    transport.sendMail({
      to: user.email,
      from: process.env.EMAIL,
      subject: `Signup Successful`,
      html: `
      <h1>Welcome, ${user.name} ${user.surname} To Dark Services</h1>
      <h5>Click on <a href="https://url-shortner-server-1.herokuapp.com/api/url/verify?token=${token}">Link</a> , To Activate Account.</h5>
      <p>Doing The Above Step Help US :)</p>
      `,
    });
    response.status(200).json({ message: "User Registered" });
  } catch (err) {
    response.status(500);
    response.send(err);
  }
});

// Signin User
router.route("/signin").post(async (request, response) => {
  try {
    const { email, password } = request.body;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      return response.status(401).send({ message: "Invalid credentials" });
    } else if (!findUser.confirm) {
      return response.status(403).json({ message: "Verify Email" });
    } else if (
      findUser &&
      (await bcrypt.compare(password, findUser.password))
    ) {
      console.log(findUser._id);
      const genToken = jwt.sign({ id: findUser._id }, process.env.SECRET_KEY);
      response.cookie("jwtToken", genToken, {
        sameSite: "strict",
        expires: new Date(new Date().getTime() + 3600 * 1000),
//         httpOnly: false,
//         secure: true
      });
      let idNo = findUser._id;
      console.log(idNo);
      response.cookie("id", idNo, {
        sameSite: "strict",
        expires: new Date(new Date().getTime() + 3600 * 1000),
        httpOnly: false,
        secure: true
      });
      return response.status(200).json({ message: "Signin Success !" });
    } else {
      return response.status(401).send({ message: "Invalid credentials" });
    }
  } catch (err) {
    response.status(500);
    response.send(err);
  }
});

// Verify Email After Signup
router.route("/verify").get(async (request, response) => {
  try {
    const token = request.query.token;
    if (token) {
      const { id } = jwt.verify(token, process.env.SECRET_KEY);
      await User.updateOne({ _id: id }, { confirm: true });
      response.redirect("https://url-shortner-client.netlify.app/signin");
    } else {
      response.status(401).json({ message: "Invalid Token" });
    }
  } catch (err) {
    response.status(500).send({ message: "Server Error" });
  }
});

//Forgot Password Link Creation
router.route("/reset").post(async (request, response) => {
  const { email } = request.body;
  try {
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      return response.status(401).json({ message: "Register First" });
    }
    const token = jwt.sign({ id: findUser._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    findUser.resetToken = token;
    findUser.expireTime = Date.now() + 3600000;

    await findUser.save();

    transport.sendMail({
      to: findUser.email,
      from: process.env.EMAIL,
      subject: `To Reset Password`,
      html: `
                  <p>You Requested For Password Reset</p>
                  <h5>Click on <a href="https://url-shortner-client.netlify.app/password-reset/${token}">Link</a> , to RESET Password.</h5>
                `,
    });
    response.status(200).json({ message: "Email Send." });
  } catch (error) {
    response.status(500);
    response.send(error);
  }
});

//Password Reset
router.route("/password-reset").post(async (request, response) => {
  const { newPassword, sentToken } = request.body;
  try {
    const findUser = await User.findOne({
      resetToken: sentToken,
      expireTime: { $gt: Date.now() },
    });
    if (!findUser) {
      return response.status(403).json({ message: "Session Expired" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    findUser.password = passwordHash;
    findUser.resetToken = undefined;
    findUser.expireTime = undefined;

    await findUser.save();
    response.status(200).json({ message: "Password Updated" });
  } catch (error) {
    response.status(500);
    response.send(error);
  }
});

// Home Page Auth
router.route("/home").get(Auth, (request, response) => {
  response.send(request.rootUser);
});

module.exports = router;

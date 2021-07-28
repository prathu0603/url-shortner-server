const jwt = require("jsonwebtoken");
const User = require("../Models/urlSchema.js");

const Auth = async (request, response, next) => {
  try {
    const token = request.cookies.jwtToken;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    if (!verifyUser)
      return response.status(401).json({ message: "Login Again" });
    const rootUser = await User.findOne({ _id: verifyUser.id });
    if (!rootUser)
      return response.status(403).json({ message: "User Not Found!" });
    request.rootUser = rootUser;
    console.log(token);
    next();
  } catch (err) {
    response.status(401);
    response.send("Unauthorized, No Token Provided");
  }
};

module.exports = Auth;

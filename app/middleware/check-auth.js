const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../config.json" });
const Cookies = require("cookies");

module.exports = (req, res, next) => {
  try {
    //const token = req.headers["x-access-token"] || req.headers["authorization"];
    // Create a cookies object
    console.log(req.cookies);
    var cookies = new Cookies(req, res);

    const token = cookies.get("token");
    console.log(req.userData);
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    console.log(decoded);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Auth-failed"
    });
  }
};

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  // Check if the token exists
  if (!token) {
    return res.status(400).send("No token provided.");
  }

  // console.log("Received Token:", token); // Debugging token

  // Verify the token directly without splitting
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      // console.error("JWT Verification Error:", err.message); // Debugging error
      return res.status(400).json({ message: "Invalid token." });
    }

    // Attach decoded payload to the request
    req.user = decoded

    // console.log("Decoded User Info:", req.user); // Debugging decoded payload
    next();
  });
};

module.exports = auth;

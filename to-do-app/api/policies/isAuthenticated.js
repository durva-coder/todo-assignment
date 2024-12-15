const jwt = require("jsonwebtoken");

// middleware
module.exports = function (req, res, proceed) {
  try {
    // Get token from Authorization header (e.g., "Bearer <token>")
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    // if not token then redirect to login page
    if (!token) {
      return res.status(400).json({
        stautus: 400,
        data: {},
        err: sails.__("Token.Required"),
      });
    }

    console.log(token);

    // verify jwt authorisation
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);

    // user data
    req.userData = decoded;

    return proceed();
  } catch (error) {
    return res.status(500).json({
      status: 500,
      data: {},
      err: sails.__("Auth.Failed"),
    });
  }
};

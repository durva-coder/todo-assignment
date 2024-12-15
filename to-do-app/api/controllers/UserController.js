/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("sails").models.user;

dotenv.config();

module.exports = {
  // signup api
  signup: async function (req, res) {
    try {
      const { name, email, password } = req.body;

      console.log("User details", req.body);

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          status: 400,
          data: {},
          err: sails.__("Validation.MissingFields"),
        });
      }

      // Check if user already exists
      const findUser = await User.findOne({ email: email });

      if (findUser) {
        return res.status(400).json({
          status: 400,
          data: {},
          err: sails.__("User.AlreadyExists"),
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
      const createUser = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
      }).fetch();

      // Create JWT token
      const token = jwt.sign(
        { email: email, id: createUser.id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" } // Token expiry (1 day)
      );

      console.log("Token", token);

      console.log("createUser", createUser);

      const user = await User.updateOne({ id: createUser.id })
        .set({ auth_token: token })
        .fetch();

      // Remove password from response
      delete user.password;

      // Respond with the created user
      return res.status(201).json({
        status: 201,
        data: user,
        msg: sails.__("User.CreatedSuccessfully"),
      });
    } catch (err) {
      console.error("Signup error:", err);

      // Handle errors gracefully
      return res.status(500).json({
        status: 500,
        data: {},
        err: sails.__("Server.ErrorOccurred"),
      });
    }
  },

  //login api
  login: async function (req, res) {
    try {
      console.log(req.body);

      const { email, password } = req.body;

      // Validate input fields
      if (!email || !password) {
        return res.status(400).json({
          status: 400,
          data: {},
          err: sails.__("Validation.LoginMissingFields"),
        });
      }

      console.log("login", req.body);

      // finding the user through email
      const user = await User.findOne({ email });

      console.log(user);

      // if user not exists
      if (!user) {
        return res.status(400).json({
          status: 400,
          data: {},
          err: sails.__("User.NotExist"),
        });
      }

      // compare the encrypted password and entered password
      const result = await bcrypt.compare(password, user.password);

      if (!result) {
        //password is not a match
        return res.status(400).json({
          status: 400,
          data: {},
          err: sails.__("User.PwdNotMatch"),
        });
      }

      // Generate new JWT token
      const token = jwt.sign(
        { email: user.email, id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" } // Token expiry time
      );

      // Update the user record with the new auth token
      const updatedUser = await User.updateOne({ id: user.id })
        .set({
          auth_token: token,
        })
        .fetch();

      // Remove password from the response
      delete user.password;

      return res.status(200).json({
        status: 200,
        data: updatedUser,
        message: sails.__("User.Login"),
      });
    } catch (err) {
      console.error("Login error:", err);

      // Handle errors gracefully
      return res.status(500).json({
        status: 500,
        data: {},
        err: sails.__("Server.ErrorOccurred"),
      });
    }
  },

  // user logout
  logout: async function (req, res) {
    try {
      console.log(req.userData);

      if (!req.userData || !req.userData.email) {
        return res.status(400).json({
          status: 400,
          data: {},
          err: sails.__("Token.Required"),
        });
      }

      const userId = req.userData.email;

      // Find the user in the database
      const user = await User.findOne({ email: userId });

      if (!user) {
        return res.status(404).json({
          status: 404,
          data: {},
          err: sails.__("User.NotExist"),
        });
      }

      if (!user.auth_token) {
        return res.status(404).json({
          status: 404,
          data: {},
          err: sails.__("User.AlreadyLogout"),
        });
      }

      // Update the user's auth_token to null (logging out the user)
      await User.updateOne({ email: userId }).set({ auth_token: null });

      return res.status(200).json({
        status: 200,
        data: {},
        message: sails.__("User.Logout"),
      });
    } catch (err) {
      console.error("Logout error:", err);

      // Handle errors gracefully
      return res.status(500).json({
        status: 500,
        data: {},
        err: sails.__("Server.ErrorOccurred"),
      });
    }
  },
};

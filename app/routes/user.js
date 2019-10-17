const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Cookies = require("cookies");
require("dotenv").config({ path: "../config.json" });

router.get("/login", (req, res) => {
  res.render("../views/login");
});
router.get("/signup", (req, res) => {
  res.render("../views/signup");
});
//user signup route
router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email }) ///returns array of email
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({ message: "Email exists" });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.redirect("/users/login");
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

//user login route
router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        res.status(401).json({
          message: "Auth failed"
        });
      }

      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }

        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.JWT_KEY, ///private key
            {
              expiresIn: "1h"
            }
          );
          let cookies = new Cookies(req, res, { token });
          // Set the cookie to a value
          cookies.set({ token }, new Date() + 60000);
          console.log(cookies.get("token"));
          return res.status(200).json({
            message: "Auth successful",
            token: token
          });
        }
        return res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

//delete user route
router.delete("/:userId", (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

module.exports = router;

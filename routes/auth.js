const router = require("express").Router();
const CryptoJS = require("crypto-js");
const { json } = require("express");
const jwt = require("jsonwebtoken");
const connection = require("../config/dbConnection");

// Register

router.post("/register", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const encryptedPassword = CryptoJS.AES.encrypt(
    req.body.password,
    process.env.PASSWORD_SEC
  ).toString();

  try {
    // Check if user with the same email or username already exists
    const [existingUserRows] = await connection.execute(
      "SELECT * FROM user WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUserRows.length > 0) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    // Insert the new user
    const [insertedUserRows] = await connection.execute(
      "INSERT INTO user (username, email, password) VALUES (?, ?, ?)",
      [username, email, encryptedPassword]
    );

    res
      .status(201)
      .json({ message: "User registered successfully", insertedUserRows });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while registering the user" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const username = req.body.username;
  try {
    const [data] = await connection.execute(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );
    if (data[0].username.length === 0) {
      return res.status(401).json("Wrong user input");
    }

    const user = data[0];

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SEC
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password) {
      return res.status(401).json("Wrong user input");
    }
    if(req.body.isAdmin===true){
        user.isAdmin=true;
    }
    const accessToken = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user;
    res.status(200).json({ ...others, accessToken });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "An error occurred while logging in" });
  }
});

module.exports = router;

const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const connection = require('../config/dbConnection');

const {verifyToken,verifyTokenAndAuthorization, verifyTokenAndAdmin} = require('./verifyToken');

const router=require('express').Router();

// here we are updating the user 
// now we are using middleware for verify my token 
router.put('/:id', verifyTokenAndAuthorization, async (req, res) => {
    const userId = req.params.id;
    const newData = { ...req.body };

    if (newData.password) {
        newData.password = CryptoJS.AES.encrypt(newData.password, process.env.PASSWORD_SEC).toString();
    }

    try {
        // Update the user in the database
        const [updateResult] = await connection.execute(
            'UPDATE user SET username = ?, email = ?, password = ? WHERE id = ?',
            [newData.username, newData.email, newData.password, userId]
        );
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'An error occurred while updating the user' });
    }
});



// Delete user methode

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
      const userId = req.params.id;
      
      const deleteQuery = "DELETE FROM user WHERE id = ?";
      await connection.execute(deleteQuery, [userId]);
  
      res.status(200).json("User has been deleted");
    } catch (err) {
      console.error("Error in deleting user:", err);
      res.status(500).json("Error in deleting user");
    }
  });
  

// Get user methode
// TODO : why here we are getting isAdmin Null need to check
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
  
      const selectQuery = "SELECT id, username, email, isAdmin, created_at, updated_at FROM user WHERE id = ?";
      const [data] = await connection.execute(selectQuery, [userId]);
        
      if (data.length === 0) {
        res.status(404).json("User not found");
        return;
      }
  
      const user = data[0];
      const { id, ...others } = user;
  
      res.status(200).json(others);
    } catch (err) {
      console.error("Error getting user:", err);
      res.status(500).json("Error in getting user");
    }
  });


// Get all users


router.get("/", verifyTokenAndAdmin, async (req, res) => {
    const isNewQuery = req.query.new === "true";
    try {
      let selectQuery = "SELECT id, username, email, isAdmin, created_at, updated_at FROM user";
  
      if (isNewQuery) {
        selectQuery += " ORDER BY id DESC LIMIT 5"; // Retrieve the 5 most recent users
      }
  
      const [data] = await connection.execute(selectQuery);
  
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json("Error in getting users");
    }
  });

// this function give us total number of user like 10 user in january so we can get it by date 
// we are getting month and total number of user in that month ** for the track of user registration
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
    // Get the current date and the date exactly one year ago
    const currentDate = new Date();
    const lastYear = new Date(currentDate);
    lastYear.setFullYear(currentDate.getFullYear() - 1);
  
    try {
      // SQL query to calculate user registration statistics
      const selectQuery = `
        SELECT
          MONTH(created_at) AS month,      -- Extract month from created_at timestamp
          COUNT(*) AS total                 -- Count total users for each month
        FROM
          user
        WHERE
          created_at >= ?                   -- Filter for registrations in the last year
        GROUP BY
          MONTH(created_at)                 -- Group results by month
      `;
  
      // Execute the query with the last year date as a parameter
      const [data] = await connection.execute(selectQuery, [lastYear]);
  
      // Send the calculated statistics as the response
      res.status(200).json(data);
    } catch (err) {
      // Handle any errors that occur during the query
      console.error("Error getting user registration stats:", err);
      res.status(500).json(err);
    }
  });


// router.use('/register',require('./auth'));
module.exports=router;
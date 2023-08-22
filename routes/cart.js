
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// create a cart

router.post("/", verifyToken, async (req, res) => {
  const userId = req.body.userId;

  try {
    const insertQuery = `
        INSERT INTO cart (user_id)
        VALUES (?)
      `;

    await connection.execute(insertQuery, [userId]);

    res.status(200).json({ message: "Cart created successfully" });
  } catch (err) {
    console.error("Error creating cart:", err);
    res.status(500).json(err);
  }
});

//  here we are updating the Cart
// now we are using middleware for verify user
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  const cartId = req.params.id;
  const updatedData = req.body;

  try {
    let updateQuery = "UPDATE cart SET ";
    const values = [];

    for (const key in updatedData) {
      if (updatedData.hasOwnProperty(key)) {
        updateQuery += `${key} = ?, `;
        values.push(updatedData[key]);
      }
    }

    updateQuery = updateQuery.slice(0, -2); // Remove the trailing comma and space
    updateQuery += " WHERE id = ?";
    values.push(cartId);

    await connection.execute(updateQuery, values);

    res.status(200).json({ message: "Cart updated successfully" });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json(err);
  }
});

// Delete cart

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  const cartId = req.params.id;

  try {
    const deleteQuery = "DELETE FROM cart WHERE id = ?";
    await connection.execute(deleteQuery, [cartId]);

    res.status(200).json("Cart has been deleted");
  } catch (err) {
    console.error("Error deleting cart:", err);
    res.status(500).json(err);
  }
});

// Get User cart method

router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  const userId = req.params.userId;

  try {
    const selectQuery = "SELECT * FROM cart WHERE user_id = ?";
    const [rows] = await connection.execute(selectQuery, [userId]);

    if (rows.length === 0) {
      res.status(404).json("Cart not found");
      return;
    }

    const cart = rows[0];
    res.status(200).json(cart);
  } catch (err) {
    console.error("Error getting cart:", err);
    res.status(500).json("Error in getting cart");
  }
});

// Get all cart of all user this is only accessable by admin

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const selectQuery = "SELECT * FROM cart";
    const [rows] = await connection.execute(selectQuery);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error getting all user carts:", err);
    res.status(500).json(err);
  }
});

module.exports = router;

const connection = require("../config/dbConnection");

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// create a cart

router.post("/", verifyToken, async (req, res) => {
  const userId = req.body.userId;
  const products = req.body.products;

  try {
    // Insert the cart into the Cart table
    const insertCartQuery = "INSERT INTO Cart (userId) VALUES (?)";
    const [insertedCart] = await connection.execute(insertCartQuery, [userId]);

    const cartId = insertedCart.insertId; // Get the generated cart ID

    // Insert the products into the CartProduct table
    for (const product of products) {
      const { productId, quantity } = product;
      const insertCartProductQuery =
        "INSERT INTO CartProduct (cartId, productId, quantity) VALUES (?, ?, ?)";
      await connection.execute(insertCartProductQuery, [
        cartId,
        productId,
        quantity,
      ]);
    }

    res.status(200).json({ message: "Cart created successfully" });
  } catch (err) {
    console.error("Error creating cart:", err);
    res.status(500).json(err);
  }
});

// now we are using middleware for verify user
// Update cart to add, remove, or modify products and quantities
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  const cartId = req.params.id;
  const { action, productId, quantity } = req.body;

  try {
    let updateQuery = "";
    const values = [];

    if (action === "add") {
      // Add a product to the cart
      updateQuery =
        "INSERT INTO CartProduct (cartId, productId, quantity) VALUES (?, ?, ?)";
      values.push(cartId, productId, quantity);
    } else if (action === "remove") {
      // Remove a product from the cart
      updateQuery =
        "DELETE FROM CartProduct WHERE cartId = ? AND productId = ?";
      values.push(cartId, productId);
    } else if (action === "updateQuantity") {
      // Update the quantity of a product in the cart
      updateQuery =
        "UPDATE CartProduct SET quantity = ? WHERE cartId = ? AND productId = ?";
      values.push(quantity, cartId, productId);
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    // Execute the appropriate query
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
    // Delete related rows from CartProduct table first
    const deleteCartProductQuery = "DELETE FROM CartProduct WHERE cartId = ?";
    await connection.execute(deleteCartProductQuery, [cartId]);

    // Now delete the cart from Cart table
    const deleteCartQuery = "DELETE FROM Cart WHERE id = ?";
    await connection.execute(deleteCartQuery, [cartId]);

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
    const selectQuery = "SELECT * FROM cart WHERE userId = ?";
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

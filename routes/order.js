const connection = require("../config/dbConnection");

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// create a order

// Here i'm not handling the quantity of the product because we are not going to update the quantity of the product in the product table
router.post("/", verifyToken, async (req, res) => {
  const userId = req.body.userId;
  const products = req.body.products; // Array of product details
  const amount = req.body.amount;
  const address = JSON.stringify(req.body.address);

  try {
    // Insert the order into the "Order" table
    const insertOrderQuery = `
      INSERT INTO \`orderTable\` (userId, amount, address)
      VALUES (?, ?, ?)
    `;

    const [result] = await connection.execute(insertOrderQuery, [
      userId,
      amount,
      address,
    ]);

    const orderId = result.insertId; // Get the ID of the newly inserted order

    // Insert each product into the "OrderProduct" table
    for (const product of products) {
      const insertProductQuery = `
        INSERT INTO OrderProduct (orderId, productId, quantity)
        VALUES (?, ?, ?)
      `;

      await connection.execute(insertProductQuery, [
        orderId,
        product.productId,
        product.quantity,
      ]);
    }

    res.status(200).json({ message: "Order created successfully" });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json(err);
  }
});

//  here we are updating the order
// now we are using middleware for verify admin
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  const orderId = req.params.id;
  const updatedData = req.body;

  try {
    let updateQuery = "UPDATE `orderTable` SET ";
    const values = [];

    for (const key in updatedData) {
      if (updatedData.hasOwnProperty(key)) {
        updateQuery += `${key} = ?, `;
        values.push(updatedData[key]);
      }
    }

    updateQuery = updateQuery.slice(0, -2); // Remove the trailing comma and space
    updateQuery += " WHERE id = ?";
    values.push(orderId);

    await connection.execute(updateQuery, values);

    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json(err);
  }
});

// Delete Order

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  const orderId = req.params.id;

  try {
    // First, delete the associated records in the orderproduct table
    const deleteOrderProductQuery =
      "DELETE FROM orderproduct WHERE orderId = ?";
    await connection.execute(deleteOrderProductQuery, [orderId]);

    // Now, delete the order itself
    const deleteOrderQuery = "DELETE FROM ordertable WHERE id = ?";
    await connection.execute(deleteOrderQuery, [orderId]);

    res.status(200).json("Order has been deleted");
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json(err);
  }
});

// Get User order method

router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  const userId = req.params.userId;

  try {
    const selectQuery = "SELECT * FROM orderTable WHERE userId = ?";
    const [rows] = await connection.execute(selectQuery, [userId]);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error getting orders:", err);
    res.status(500).json(err);
  }
});

// Get all order of all user this is only accessable by admin

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const selectQuery = "SELECT * FROM orderTable";
    const [rows] = await connection.execute(selectQuery);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error getting all orders:", err);
    res.status(500).json(err);
  }
});

// Get Monthly income

router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  // Get the current date
  const currentDate = new Date();

  // Calculate the date of the last month and the previous month
  const lastMonthDate = new Date(currentDate);
  lastMonthDate.setMonth(currentDate.getMonth() - 1);

  const previousMonthDate = new Date(currentDate);
  previousMonthDate.setMonth(currentDate.getMonth() - 2);

  try {
    // SQL query to calculate monthly income
    const selectQuery = `
        SELECT MONTH(created_at) AS month, SUM(amount) AS total
        FROM orderTable
        WHERE created_at >= ? AND created_at < ?
        GROUP BY month
      `;

    // Execute the query with date range parameters
    const [data] = await connection.execute(selectQuery, [
      previousMonthDate,
      lastMonthDate,
    ]);

    res.status(200).json(data);
  } catch (err) {
    console.error("Error getting monthly income:", err);
    res.status(500).json(err);
  }
});

module.exports = router;

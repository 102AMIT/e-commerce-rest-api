// this is the short hand writting

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// create a order

router.post("/", verifyToken, async (req, res) => {
  const userId = req.body.userId;
  const productData = JSON.stringify(req.body.product);
  const amount = req.body.amount;
  const address = JSON.stringify(req.body.address);

  try {
    const insertQuery = `
        INSERT INTO order_table (user_id, product, amount, address)
        VALUES (?, ?, ?, ?)
      `;

    await connection.execute(insertQuery, [
      userId,
      productData,
      amount,
      address,
    ]);

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
    let updateQuery = "UPDATE order_table SET ";
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
    const deleteQuery = "DELETE FROM order_table WHERE id = ?";
    await connection.execute(deleteQuery, [orderId]);

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
    const selectQuery = "SELECT * FROM order_table WHERE user_id = ?";
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
    const selectQuery = "SELECT * FROM order_table";
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
        FROM order_table
        WHERE created_at >= ? AND created_at < ?
        GROUP BY month
      `;

    // Execute the query with date range parameters
    const [rows] = await connection.execute(selectQuery, [
      previousMonthDate,
      lastMonthDate,
    ]);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error getting monthly income:", err);
    res.status(500).json(err);
  }
});

module.exports = router;

const connection = require("../config/dbConnection");

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// create

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const { title, description, img, size, color, price } = req.body;

  try {
    const insertQuery = `
        INSERT INTO product (title, description, img, size, color, price)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

    await connection.execute(insertQuery, [
      title,
      description,
      img,
      size,
      color,
      price,
    ]);

    res.status(200).json({ message: "Product created successfully" });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json(err);
  }
});

//  here we are updating the product
// now we are using middleware for verify admin
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.params.id;
  const updatedData = req.body;

  try {
    let updateQuery = "UPDATE product SET ";
    const values = [];

    for (const key in updatedData) {
      if (updatedData.hasOwnProperty(key)) {
        updateQuery += `${key} = ?, `;
        values.push(updatedData[key]);
      }
    }
    // we need to do this because when we have to update more than one column(fields) then we have to use comma(,) after every column except the last one -2 remove the last comma and space
    updateQuery = updateQuery.slice(0, -2); // Remove the trailing comma and space
    updateQuery += " WHERE id = ?";
    values.push(productId);

    res.status(200).json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json(err);
  }
});

// Delete user method

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.params.id;

  try {
    const deleteQuery = "DELETE FROM product WHERE id = ?";
    await connection.execute(deleteQuery, [productId]);

    res.status(200).json("Product has been deleted");
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json("Error in deleting product");
  }
});

// Get Product method

router.get("/find/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const selectQuery = "SELECT * FROM product WHERE id = ?";
    const [data] = await connection.execute(selectQuery, [productId]);

    if (data.length === 0) {
      res.status(404).json("Product not found");
      return;
    }

    const product = data[0];
    res.status(200).json(product);
  } catch (err) {
    console.error("Error getting product:", err);
    res.status(500).json("Error in getting product");
  }
});

// Get all Product

router.get("/", async (req, res) => {
  const qNew = req.query.new;

  try {
    // Initialize the base SELECT query
    let selectQuery = `
          SELECT *
          FROM product
      `;

    if (qNew) {
      const newLimit = parseInt(qNew); // Parse qNew into an integer
      if (!isNaN(newLimit)) {
        selectQuery += `
                  ORDER BY created_at DESC
                  LIMIT ${newLimit}
              `;
      } else {
        res.status(400).json("Invalid value for 'new' parameter");
        return;
      }
    }

    // Execute the SQL query
    const [data] = await connection.execute(selectQuery);

    // Send the fetched products in the response
    res.status(200).json(data);
  } catch (err) {
    // Handle errors that occur during the query
    console.error("Error getting products:", err);
    res.status(500).json("Error in getting products");
  }
});

module.exports = router;

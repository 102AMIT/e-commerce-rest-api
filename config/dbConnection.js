const mysql = require("mysql2/promise");

const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Admin123456789!",
    database: "eccomerce",
    port: 3306, // Note the corrected property name
  });
 
module.exports = connection;
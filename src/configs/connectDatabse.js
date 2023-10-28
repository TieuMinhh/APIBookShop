// import mysql from "mysql2/promise";
// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "minbao4869",
//   port: "3306",
//   database: "book_shop",
// });

// export default pool;

import mysql from "mysql2/promise";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER, DB_PORT } from "./config.js";

const pool = mysql.createPool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
});
export default pool;

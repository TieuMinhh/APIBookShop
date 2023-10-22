import { verify } from "jsonwebtoken";
import pool from "../configs/connectDatabse";
import auth from "../middleware/auth";

//Search product and category
let searchProduct = async (req, res) => {
  try {
    console.log("Xin chào");
    let { name } = req.body;
    console.log("body", name);
    let [search] = await pool.execute(
      "select *,CAST((p.price - (p.price * pc.percentage / 100)) AS SIGNED) as price_reducing from product p, product_promotion pc where p.id_promotion = pc.id_promotion and name_product like ?",
      ["%" + name + "%"]
    );
    return res.status(200).json({
      message: search,
    });
  } catch (err) {
    console.log(err);
  }
};

let searchCategory = async (req, res) => {
  try {
    console.log("Xin chào");
    let { name } = req.body;
    console.log("body", name);
    let [search] = await pool.execute(
      "select * from category where name_category like ?",
      ["%" + name + "%"]
    );
    return res.status(200).json({
      message: search,
    });
  } catch (err) {
    console.log(err);
  }
};

let searchProductByCategory = async (req, res) => {
  try {
    console.log("Xin chào");
    let { name } = req.body;
    console.log("body", name);
    let [search] = await pool.execute(
      "select *,CAST((p.price - (p.price * pc.percentage / 100)) AS SIGNED) as price_reducing from category c,product p,product_promotion pc where p.id_promotion = pc.id_promotion and c.id_category = p.id_category and name_category like ?",
      ["%" + name + "%"]
    );
    return res.status(200).json({
      message: search,
    });
  } catch (err) {
    console.log(err);
  }
};

let searchProductByIdCategory = async (req, res) => {
  try {
    let { id_category } = req.body || null;
    console.log(id_category);
    if (id_category === undefined || id_category === null) {
      return res.status(400).json({
        message: "id_category is missing or undefined",
      });
    }

    let [search] = await pool.execute(
      "SELECT *, CAST((p.price - (p.price * pc.percentage / 100)) AS SIGNED) AS price_reducing FROM product p, product_promotion pc WHERE p.id_promotion = pc.id_promotion AND p.id_category = ?",
      [id_category]
    );
    return res.status(200).json({
      message: search,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  searchProduct,
  searchCategory,
  searchProductByCategory,
  searchProductByIdCategory,
};

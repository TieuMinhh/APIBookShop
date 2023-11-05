import { verify } from "jsonwebtoken";
import pool from "../configs/connectDatabse";

import { messageCategory } from "../../message";
//Danh mục
let getCategory = async (req, res) => {
  //thực thi lênh sql
  try {
    let id = req.query.id;
    console.log(id);
    console.log("id query: ", id);
    let response = "";
    if (id === "ALL") {
      [response] = await pool.execute("select * from category");
    } else {
      [response] = await pool.execute(
        "select * from category where id_category=?",
        [id]
      );
    }
    console.log(response);
    return res.status(200).json({ listCategory: response });
  } catch (error) {
    console.log(error);
  }
};

let createNewCategory = async (req, res) => {
  let name_category = req.body.name_category;

  if (!req.file || !name_category) {
    return res.status(200).json({
      errCode: 2,
      message: messageCategory.infosEmpty,
    });
  }

  let logo = req.file.filename;

  try {
    // Kiểm tra xem tên danh mục đã tồn tại trong cơ sở dữ liệu hay chưa
    let [rows, fields] = await pool.execute(
      "SELECT * FROM category WHERE name_category = ?",
      [name_category]
    );

    // Nếu tìm thấy bất kỳ kết quả nào, đó có nghĩa là tên danh mục đã tồn tại
    if (rows.length > 0) {
      return res.status(200).json({
        errCode: 1,
        message: messageCategory.existNameAddCategory,
      });
    }

    // Nếu không tìm thấy bất kỳ kết quả nào, thực hiện thêm mới
    let insert = await pool.execute(
      "INSERT INTO category (name_category, logo) VALUES (?, ?)",
      [name_category, logo]
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errCode: 1,
      message: messageCategory.error,
    });
  }

  return res.status(200).json({
    errCode: 0,
    message: messageCategory.successAddNewCategory,
  });
};

let updateCategory = async (req, res) => {
  let { name_category } = req.body;
  let id_category = req.query.id;
  let update = "";
  let logo = null; // Khởi tạo biến logo với giá trị mặc định là null

  if (req.file && req.file.filename) {
    logo = req.file.filename;
  }

  // Kiểm tra xem thông tin có bị bỏ trống hay không
  if (!name_category) {
    return res.status(200).json({
      errCode: 1,
      message: messageCategory.infosEmpty,
    });
  }

  try {
    // Kiểm tra xem tên danh mục mới đã tồn tại trong cơ sở dữ liệu hay chưa
    let [rows, fields] = await pool.execute(
      "SELECT * FROM category WHERE name_category = ? AND id_category != ?",
      [name_category, id_category]
    );

    // Nếu tìm thấy bất kỳ kết quả nào, đó có nghĩa là tên danh mục đã tồn tại
    if (rows.length > 0) {
      return res.status(200).json({
        errCode: 2,
        message: messageCategory.existNameUpdateCategory,
      });
    }

    // Nếu không tìm thấy bất kỳ kết quả nào, thực hiện câu lệnh UPDATE
    if (logo) {
      update = await pool.execute(
        "UPDATE category SET name_category=?, logo=? WHERE id_category=?",
        [name_category, logo, id_category]
      );
    } else {
      update = await pool.execute(
        "UPDATE category SET name_category=? WHERE id_category=?",
        [name_category, id_category]
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: messageCategory.error,
    });
  }

  return res.status(200).json({
    errCode: 0,
    message: messageCategory.successUpdateCategory,
  });
};

let deleteCategory = async (req, res) => {
  try {
    let { id_category } = req.query; // id trùng tên với id đường dẫn
    console.log(req.query);
    if (!id_category) {
      return res.status(201).json({
        message: messageCategory.error,
      });
    }

    // Kiểm tra xem danh mục có sản phẩm không
    const [rows, fields] = await pool.execute(
      `SELECT COUNT(*) AS productCount FROM product WHERE id_category = ?`,
      [id_category]
    );

    if (rows[0].productCount > 0) {
      return res.status(200).json({
        errCode: 1,
        message: messageCategory.existProductInCategory,
      });
    }

    // Nếu không có sản phẩm, thì tiến hành xoá danh mục
    let del = await pool.execute(`DELETE FROM category WHERE id_category=?`, [
      id_category,
    ]);
  } catch (err) {
    console.log(err);
  }
  return res.status(200).json({
    errCode: 0,
    message: messageCategory.successDeleteCategory,
  });
};

module.exports = {
  getCategory,
  createNewCategory,
  updateCategory,
  deleteCategory,
};

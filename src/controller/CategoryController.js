import { verify } from "jsonwebtoken";
import pool from "../configs/connectDatabse";

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
      message: "Vui lòng không bỏ trống thông tin",
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
        message: "Thêm thất bại. Tên danh mục đã tồn tại",
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
      message: "Đã xảy ra lỗi trong quá trình thêm mới danh mục",
    });
  }

  return res.status(200).json({
    errCode: 0,
    message: "Chúc mừng, bạn đã thêm thành công danh mục mới",
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
      message: "Vui lòng không bỏ trống thông tin",
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
        message: "Sửa đổi không thành công. Tên danh mục đã tồn tại.",
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
      message: "Đã xảy ra lỗi trong quá trình cập nhật danh mục.",
    });
  }

  return res.status(200).json({
    message: "Chúc mừng, bạn đã cập nhật thành công danh mục.",
  });
};

let deleteCategory = async (req, res) => {
  try {
    let { id_category } = req.query; // id trùng tên với id đường dẫn
    console.log(req.query);
    if (!id_category) {
      return res.status(200).json({
        message: "Thất bại rồi",
      });
    }

    // Kiểm tra xem danh mục có sản phẩm không
    const [rows, fields] = await pool.execute(
      `SELECT COUNT(*) AS productCount FROM product WHERE id_category = ?`,
      [id_category]
    );

    if (rows[0].productCount > 0) {
      return res.status(201).json({
        message: "Không thể xoá vì đã có sản phẩm trong danh mục này.",
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
    message: "Chúc mừng bạn đã xóa thành công",
  });
};

module.exports = {
  getCategory,
  createNewCategory,
  updateCategory,
  deleteCategory,
};

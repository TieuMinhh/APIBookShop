import { verify } from "jsonwebtoken";
import pool from "../configs/connectDatabse";
import { messagePublishing } from "../../message";

// Nhà xuất bản
let getNXB = async (req, res) => {
  //thực thi lênh sql
  try {
    let id = req.query.id;
    console.log(id);
    console.log("id query: ", id);
    let response = "";
    if (id === "ALL") {
      [response] = await pool.execute("select * from publishing_company");
    } else {
      [response] = await pool.execute(
        "select * from publishing_company where id_company=?",
        [id]
      );
    }
    console.log(response);
    return res.status(200).json({ listNXB: response });
  } catch (error) {
    console.log(error);
  }
};

let createNewNXB = async (req, res) => {
  let { name_company, phone_company, email_company, address_company } =
    req.body;
  console.log("Body:", req.body);

  // Kiểm tra trường hợp thông tin bị bỏ trống
  if (!name_company || !phone_company || !email_company || !address_company) {
    return res.status(200).json({
      errCode: 1,
      message: messagePublishing.infosEmpty,
    });
  }

  try {
    // Kiểm tra xem tên nhà xuất bản đã tồn tại trong cơ sở dữ liệu hay chưa
    let [rows, fields] = await pool.execute(
      "SELECT * FROM publishing_company WHERE name_company = ?",
      [name_company]
    );

    // Nếu tìm thấy bất kỳ kết quả nào, đó có nghĩa là tên nhà xuất bản đã tồn tại
    if (rows.length > 0) {
      return res.status(200).json({
        errCode: 2,
        message: messagePublishing.existNameAddPublishing,
      });
    }

    // Thêm nhà xuất bản mới nếu không tìm thấy tên nhà xuất bản trong cơ sở dữ liệu
    let insert = await pool.execute(
      "INSERT INTO publishing_company (name_company,phone_company,email_company,address_company) VALUES (?,?,?,?)",
      [name_company, phone_company, email_company, address_company]
    );

    return res.status(200).json({
      errCode: 0,
      message: messagePublishing.successAddNewPublishing,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errCode: 1,
      message: messagePublishing.error,
    });
  }
};

let updateNXB = async (req, res) => {
  let { name_company, phone_company, email_company, address_company } =
    req.body;
  console.log("Body:", req.body);
  let id_company = req.params.id_company;

  // Kiểm tra trường hợp thông tin bị bỏ trống
  if (
    !name_company ||
    !phone_company ||
    !email_company ||
    !address_company ||
    !id_company
  ) {
    return res.status(201).json({
      errCode: 1,
      message: messagePublishing.infosEmpty,
    });
  }

  try {
    // Kiểm tra xem tên nhà xuất bản đã tồn tại trong cơ sở dữ liệu hay chưa
    let [rows, fields] = await pool.execute(
      "SELECT * FROM publishing_company WHERE name_company = ? AND id_company != ?",
      [name_company, id_company]
    );

    // Nếu tìm thấy bất kỳ kết quả nào, đó có nghĩa là tên nhà xuất bản đã tồn tại
    if (rows.length > 0) {
      return res.status(200).json({
        errCode: 2,
        message: messagePublishing.existNameUpdatePublishing,
      });
    }

    // Thực hiện câu lệnh UPDATE
    let update = await pool.execute(
      "UPDATE publishing_company SET name_company=?, phone_company=?, email_company=?, address_company=? WHERE id_company=?",
      [name_company, phone_company, email_company, address_company, id_company]
    );

    return res.status(200).json({
      errCode: 0,
      message: messagePublishing.successUpdatePublishing,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errCode: 1,
      message: messagePublishing.error,
    });
  }
};

let deleteNXB = async (req, res) => {
  let { id_company } = req.params; // id trùng tên với id đường dẫn

  if (!id_company) {
    return res.status(200).json({
      message: messagePublishing.error,
    });
  }

  try {
    // Kiểm tra xem nhà xuất bản đã xuất bản sách trong bảng product hay chưa
    let [productRows, productFields] = await pool.execute(
      "SELECT * FROM product WHERE id_company = ?",
      [id_company]
    );

    // Nếu nhà xuất bản đã xuất bản sách trong bảng product, không thể xóa
    if (productRows.length > 0) {
      return res.status(200).json({
        errCode: 1,
        message: messagePublishing.existProductInPublishing,
      });
    }

    // Nếu không tồn tại trong bảng product, thực hiện xóa nhà xuất bản
    let del = await pool.execute(
      `DELETE FROM publishing_company WHERE id_company=?`,
      [id_company]
    );

    return res.status(200).json({
      errCode: 0,
      message: messagePublishing.successDeletePublishing,
    });
  } catch (err) {
    return res.status(500).json({
      errCode: 1,
      message: messagePublishing.error,
    });
  }
};

module.exports = {
  getNXB,
  createNewNXB,
  updateNXB,
  deleteNXB,
};

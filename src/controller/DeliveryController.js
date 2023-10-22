import { verify } from "jsonwebtoken";
import pool from "../configs/connectDatabse";
import auth from "../middleware/auth";

const getAddressDelivery = async (req, res) => {
  try {
    const id_account = auth.tokenData(req).id_account;

    // Truy vấn địa chỉ giao hàng từ cơ sở dữ liệu dựa trên id tài khoản
    let [response] = await pool.execute(
      "select * from delivery_address where id_account=?",
      [id_account]
    );

    return res.json({
      listAddress: response, // Trả về danh sách địa chỉ giao hàng
    });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

const createAddressDelivery = async (req, res) => {
  try {
    const id_account = auth.tokenData(req).id_account;
    const { name_address, name_receiver, phone_receiver } = req.body;

    // Thực hiện việc tạo địa chỉ giao hàng trong cơ sở dữ liệu
    const [result] = await pool.execute(
      "INSERT INTO delivery_address (id_account, name_address,name_receiver,phone_receiver) VALUES (?,?,?,?)",
      [id_account, name_address, name_receiver, phone_receiver]
    );

    if (result.affectedRows > 0) {
      return res.json({
        message: "Địa chỉ giao hàng đã được tạo thành công.",
      });
    } else {
      return res.json({
        message: "Tạo địa chỉ giao hàng thất bại.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

const updateAddressDelivery = async (req, res) => {
  try {
    let id_account = auth.tokenData(req).id_account;
    let id_address = req.params.id_address;
    let { name_address, name_receiver, phone_receiver } = req.body;

    // Thực hiện truy vấn SQL để cập nhật địa chỉ giao hàng
    const [result] = await pool.execute(
      "UPDATE delivery_address SET name_address = ?, name_receiver = ?, phone_receiver = ? WHERE id_account = ? AND id_address = ?",
      [name_address, name_receiver, phone_receiver, id_account, id_address]
    );

    if (result.affectedRows > 0) {
      return res.json({
        message: "Địa chỉ giao hàng đã được cập nhật thành công.",
      });
    } else {
      return res.json({
        message:
          "Không tìm thấy địa chỉ giao hàng hoặc cập nhật không thành công.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

const deleteAddressDelivery = async (req, res) => {
  try {
    const id_account = auth.tokenData(req).id_account;
    const id_address = req.params.id_address; // Lấy id_address cần xóa từ tham số URL

    // Thực hiện truy vấn SQL để xóa địa chỉ giao hàng
    const [result] = await pool.execute(
      "DELETE FROM delivery_address WHERE id_account = ? AND id_address = ?",
      [id_account, id_address]
    );

    if (result.affectedRows > 0) {
      return res.json({
        message: "Địa chỉ giao hàng đã được xóa thành công.",
      });
    } else {
      return res.json({
        message: "Không tìm thấy địa chỉ giao hàng hoặc xóa không thành công.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

module.exports = {
  getAddressDelivery,
  createAddressDelivery,
  updateAddressDelivery,
  deleteAddressDelivery,
};

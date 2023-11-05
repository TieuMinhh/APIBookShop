import { verify } from "jsonwebtoken";
import pool from "../configs/connectDatabse";
import auth from "../middleware/auth";
import { messageDeliveryAddress } from "../../message";

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

    // Kiểm tra xem thông tin có bị bỏ trống hay không
    if (!name_address || !name_receiver || !phone_receiver) {
      return res.status(200).json({
        errCode: 1,
        message: messageDeliveryAddress.infosEmpty,
      });
    }
    // Thực hiện việc tạo địa chỉ giao hàng trong cơ sở dữ liệu
    const [result] = await pool.execute(
      "INSERT INTO delivery_address (id_account, name_address,name_receiver,phone_receiver) VALUES (?,?,?,?)",
      [id_account, name_address, name_receiver, phone_receiver]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({
        errCode: 0,
        message: messageDeliveryAddress.successAddNewAddressDelivery,
      });
    } else {
      return res.status(200).json({
        errCode: 2,
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
      return res.status(200).json({
        errCode: 0,
        message: messageDeliveryAddress.successUpdateAddressDelivery,
      });
    } else {
      return res.status(200).json({
        errCode: 1,
        message: messageDeliveryAddress.error,
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

    // Kiểm tra xem địa chỉ giao hàng này đã được sử dụng trong bảng order chưa
    const [orderCheck] = await pool.execute(
      "SELECT id_address FROM orders WHERE id_address = ?",
      [id_address]
    );

    // Nếu địa chỉ giao hàng đã được sử dụng trong bảng order, trả về thông báo lỗi
    if (orderCheck.length > 0) {
      return res.status(200).json({
        errCode: 1,
        message: messageDeliveryAddress.usedAddressDelivery,
      });
    }

    // Thực hiện truy vấn SQL để xóa địa chỉ giao hàng nếu không có đơn hàng nào sử dụng
    const [result] = await pool.execute(
      "DELETE FROM delivery_address WHERE id_account = ? AND id_address = ?",
      [id_account, id_address]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({
        errCode: 0,
        message: messageDeliveryAddress.successDeleteAddressDelivery,
      });
    } else {
      return res.status(400).json({
        message: messageDeliveryAddress.error,
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

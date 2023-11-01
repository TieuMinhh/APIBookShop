import { verify } from "jsonwebtoken";
import pool from "../configs/connectDatabse";
import auth from "../middleware/auth";

//Giảm giá sách
let getPromotionProduct = async (req, res) => {
  try {
    let id = req.query.id;
    console.log(id);
    console.log("id promotion: ", id);
    let response = "";
    if (id === "ALL") {
      [response] = await pool.execute("select * from product_promotion");
    } else {
      [response] = await pool.execute(
        "select * from product_promotion where id_promotion=?",
        [id]
      );
    }
    console.log(response);
    return res.status(200).json({ listPromotionProduct: response });
  } catch (error) {
    console.log(error);
  }
};

let createNewPromotionProduct = async (req, res) => {
  let { percentage, start_date, end_date } = req.body;
  console.log("Body:", req.body);

  // Kiểm tra trường hợp thông tin bị bỏ trống
  if (!percentage || !start_date || !end_date) {
    return res.status(200).json({
      errCode: 1,
      message: "Không được bỏ trống thông tin!",
    });
  }

  try {
    // Kiểm tra xem giảm giá sách đã tồn tại trong cơ sở dữ liệu hay chưa
    let [rows, fields] = await pool.execute(
      "SELECT * FROM product_promotion WHERE percentage = ? ",
      [percentage]
    );

    // Nếu tìm thấy bất kỳ kết quả nào, đó có nghĩa là giảm giá sách đã tồn tại
    if (rows.length > 0) {
      return res.status(200).json({
        errCode: 2,
        message: "Thêm thất bại. Giảm giá sách đã tồn tại.",
      });
    }

    // Thêm giảm giá sách mới nếu không tìm thấy trong cơ sở dữ liệu
    let insert = await pool.execute(
      "INSERT INTO product_promotion (percentage, start_date, end_date) VALUES (?,?,?)",
      [percentage, start_date, end_date]
    );

    return res.status(200).json({
      errCode: 0,
      message: "Chúc mừng, ngài đã thêm giảm giá sách thành công.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errCode: 1,
      message: "Đã xảy ra lỗi trong quá trình thêm giảm giá sách.",
    });
  }
};

let updatePromotionProduct = async (req, res) => {
  let { percentage, start_date, end_date } = req.body;
  console.log("Body:", req.body);
  let id_promotion = req.params.id_promotion;

  // Kiểm tra trường hợp thông tin bị bỏ trống
  if (!percentage || !start_date || !end_date) {
    return res.status(200).json({
      errCode: 1,
      message: "Không được bỏ trống thông tin!",
    });
  }

  // Kiểm tra xem phần trăm giảm giá sách đã tồn tại trong cơ sở dữ liệu hay chưa
  try {
    let [rows, fields] = await pool.execute(
      "SELECT * FROM product_promotion WHERE percentage = ? AND id_promotion != ?",
      [percentage, id_promotion]
    );

    // Nếu tìm thấy bất kỳ kết quả nào, đó có nghĩa là phần trăm giảm giá sách đã tồn tại
    if (rows.length > 0) {
      return res.status(200).json({
        errCode: 2,
        message:
          "Sửa đổi không thành công. Phần trăm giảm giá sách đã tồn tại.",
      });
    }

    // Thực hiện câu lệnh UPDATE
    let update = await pool.execute(
      "UPDATE product_promotion SET percentage=?, start_date=?, end_date=? WHERE id_promotion=?",
      [percentage, start_date, end_date, id_promotion]
    );

    return res.status(200).json({
      errCode: 0,
      message:
        "Chúc mừng, bạn đã cập nhật thông tin khuyến mãi sản phẩm thành công.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errCode: 1,
      message: "Đã xảy ra lỗi trong quá trình cập nhật khuyến mãi sản phẩm.",
    });
  }
};

let deletePromotionProduct = async (req, res) => {
  let { id_promotion } = req.params; // id trùng tên với id đường dẫn

  if (!id_promotion) {
    return res.status(200).json({
      message: "Thất bại rồi",
    });
  }

  try {
    // Kiểm tra xem phần trăm giảm giá sách đã được sử dụng trong bảng product hay chưa
    let [productRows, productFields] = await pool.execute(
      "SELECT * FROM product WHERE id_promotion = ?",
      [id_promotion]
    );

    // Nếu phần trăm giảm giá sách đã được sử dụng trong bảng product, không thể xóa
    if (productRows.length > 0) {
      return res.status(200).json({
        errCode: 1,
        message: "Xóa thất bại. Phần trăm giảm giá sách đã được sử dụng.",
      });
    }

    // Nếu không tồn tại trong bảng product, thực hiện xóa phần trăm giảm giá sách
    let del = await pool.execute(
      `DELETE FROM product_promotion WHERE id_promotion=?`,
      [id_promotion]
    );

    return res.status(200).json({
      errCode: 0,
      message: "Chúc mừng, bạn đã xóa phần trăm giảm giá sách thành công.",
    });
  } catch (err) {
    return res.status(500).json({
      errCode: 1,
      message: "Đã xảy ra lỗi trong quá trình xóa phần trăm giảm giá sách.",
    });
  }
};

//Khuyến mãi
let getDiscount = async (req, res) => {
  try {
    let id = req.query.id;
    console.log(id);
    console.log("id discount: ", id);
    let response = "";
    if (id === "ALL") {
      [response] = await pool.execute("select * from discount");
    } else {
      [response] = await pool.execute(
        "select * from discount where discount_id=?",
        [id]
      );
    }
    console.log(response);
    return res.status(200).json({ listDiscount: response });
  } catch (error) {
    console.log(error);
  }
};

let createNewDiscount = async (req, res) => {
  let { discount_code, percentage, start_date, end_date, description } =
    req.body;
  console.log("Minh body:", req.body);

  // Kiểm tra trường hợp thông tin bị bỏ trống
  if (
    !discount_code ||
    !percentage ||
    !start_date ||
    !end_date ||
    !description
  ) {
    return res.status(200).json({
      errCode: 1,
      message: "Không được bỏ trống thông tin!",
    });
  }

  try {
    // Kiểm tra xem mã khuyến mãi đã tồn tại trong cơ sở dữ liệu hay chưa
    let [rows, fields] = await pool.execute(
      "SELECT * FROM discount WHERE discount_code = ?",
      [discount_code]
    );

    // Nếu tìm thấy bất kỳ kết quả nào, đó có nghĩa là mã khuyến mãi đã tồn tại
    if (rows.length > 0) {
      return res.status(200).json({
        errCode: 2,
        message: "Thêm thất bại. Mã khuyến mãi đã tồn tại.",
      });
    }

    // Thêm mã khuyến mãi mới nếu không tìm thấy mã khuyến mãi trong cơ sở dữ liệu
    let insert = await pool.execute(
      "INSERT INTO discount (discount_code,percentage,start_date,end_date,description) VALUES (?,?,?,?,?)",
      [discount_code, percentage, start_date, end_date, description]
    );

    return res.status(200).json({
      errCode: 0,
      message: "Chúc mừng, ngài đã thêm mã khuyến mãi thành công.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errCode: 3,
      message: "Đã xảy ra lỗi trong quá trình thêm mã khuyến mãi.",
    });
  }
};

let updateDiscount = async (req, res) => {
  let { discount_code, percentage, start_date, end_date, description } =
    req.body;

  let discount_id = req.params.discount_id;

  if (
    !discount_code ||
    !percentage ||
    !start_date ||
    !end_date ||
    !description ||
    !discount_id
  ) {
    return res.status(201).json({
      errCode: 1,
      message: "Không được bỏ trống thông tin",
    });
  }

  try {
    // Kiểm tra xem mã khuyến mãi đã tồn tại trong cơ sở dữ liệu hay chưa
    let [rows, fields] = await pool.execute(
      "SELECT * FROM discount WHERE discount_code = ? AND discount_id != ?",
      [discount_code, discount_id]
    );

    // Nếu tìm thấy bất kỳ kết quả nào, đó có nghĩa là mã khuyến mãi đã tồn tại
    if (rows.length > 0) {
      return res.status(200).json({
        errCode: 2,
        message: "Cập nhật thất bại. Mã khuyến mãi đã tồn tại.",
      });
    }

    // Thực hiện câu lệnh UPDATE
    let update = await pool.execute(
      "UPDATE discount SET discount_code=?, percentage=?, start_date=?, end_date=?, description=? WHERE discount_id=?",
      [
        discount_code,
        percentage,
        start_date,
        end_date,
        description,
        discount_id,
      ]
    );

    return res.status(200).json({
      errCode: 0,
      message: "Chúc mừng, bạn đã cập nhật thông tin mã khuyến mãi thành công.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errCode: 1,
      message: "Đã xảy ra lỗi trong quá trình cập nhật mã khuyến mãi.",
    });
  }
};

let deleteDiscount = async (req, res) => {
  let { discount_id } = req.params; // id trùng tên với id đường dẫn

  if (!discount_id) {
    return res.status(200).json({
      message: "Thất bại rồi",
    });
  }

  try {
    // Kiểm tra xem mã giảm giá đã được sử dụng trong bảng order hay chưa
    let [orderRows, orderFields] = await pool.execute(
      "SELECT * FROM `orders` WHERE discount_id = ?",
      [discount_id]
    );

    // Nếu mã giảm giá đã được sử dụng trong bảng order, không thể xóa
    if (orderRows.length > 0) {
      return res.status(200).json({
        errCode: 1,
        message: "Xóa thất bại. Mã giảm giá đã được sử dụng trong đơn hàng.",
      });
    }

    // Nếu không tồn tại trong bảng order, thực hiện xóa mã giảm giá
    let del = await pool.execute(`DELETE FROM discount WHERE discount_id=?`, [
      discount_id,
    ]);

    return res.status(200).json({
      errCode: 0,
      message: "Chúc mừng, bạn đã xóa mã giảm giá thành công.",
    });
  } catch (err) {
    return res.status(500).json({
      errCode: 1,
      message: "Đã xảy ra lỗi trong quá trình xóa mã giảm giá.",
    });
  }
};

let getDiscountByCode = async (req, res) => {
  //thực thi lênh sql
  try {
    let code = req.query.discount_code;
    console.log(code);
    console.log("code : ", code);
    let [response] = await pool.execute(
      "select * from discount where discount_code=?",
      [code]
    );
    console.log(response);
    return res
      .status(200)
      .json({ data: response.length > 0 ? response[0] : {} });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getPromotionProduct,
  createNewPromotionProduct,
  updatePromotionProduct,
  deletePromotionProduct,
  getDiscount,
  createNewDiscount,
  updateDiscount,
  deleteDiscount,
  getDiscountByCode,
};

import { verify } from "jsonwebtoken";
import pool from "../configs/connectDatabse";
import userService from "../services/userService";
import auth from "../middleware/auth";
import mail from "../services/mail";

import { messageUser } from "../../message";

//API login
let handleLogin = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      errCode: 1,
      message: messageUser.infoEmpty,
    });
  }
  console.log("Thông tin: ", req.body);
  //console.log(req.body);
  //Trả về dữ liệu người dùng
  let accessToken = await userService.handleUserLogin(email, password);
  return res.status(200).json({
    // errorCode: 0,
    // message: 'Hello Xiao Ming',
    // email: email,
    // test: 'Đăng nhập thành công'
    errCode: accessToken.errCode,
    message: accessToken.message,
    accessToken: accessToken.user,
    role_id: accessToken.role_id,
  });
};

let handleAdminLogin = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      errCode: 1,
      message: messageUser.infoEmpty,
    });
  }
  console.log("Minh: ", req.body);
  //console.log(req.body);
  //Trả về dữ liệu người dùng
  let accessToken = await userService.handleAdminLogin(email, password);
  return res.status(200).json({
    // errorCode: 0,
    // message: 'Hello Xiao Ming',
    // email: email,
    // test: 'Đăng nhập thành công'
    errCode: accessToken.errCode,
    message: accessToken.message,
    accessToken: accessToken.user,
    role_id: accessToken.role_id,
  });
};

let rateComment = async (req, res) => {
  try {
    let { id_product, star, comment } = req.body;
    let id_account = auth.tokenData(req).id_account;
    console.log("id_product:", id_product, "star", star, "omment", comment);
    console.log("id_account:", id_account);
    let check = await checkTonTaiDanhGia(id_product, id_account);
    console.log(check);
    if (!check) {
      let insert = await pool.execute(
        "insert into rated(id_product,id_account,star,comment,status) values(?,?,?,?,0)",
        [id_product, id_account, star, comment]
      );

      return res.status(200).json({
        // insert: insert,
        message: "Chúc mừng ngài đã thêm thành công",
      });
    } else {
      console.log(check);
      return res.status(200).json({
        // insert: insert,
        message: "Đã bình luận",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

let checkTonTaiDanhGia = async (id_product, id_account) => {
  try {
    let [check] = await pool.execute(
      "select * from rated where id_product=? and id_account=?",
      [id_product, id_account]
    );
    console.log(check[0]);
    if (!check[0]) {
      return false;
    } else {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
};

let getRated = async (req, res) => {
  try {
    let { id_product } = req.query;

    // let insert = await pool.execute('insert into rated(id_product,id_account,star,comment,status) values(?,?,?,?,0)', [id_product, id_account, star, comment])
    let [listRated] = await pool.execute(
      "SELECT * FROM rated r ,account a where id_product=? and r.id_account=a.id_account",
      [id_product]
    );

    return res.status(200).json({
      // insert: insert,
      listRated: listRated,
    });
  } catch (e) {
    console.log(e);
  }
};

let blockAccount = async (req, res) => {
  const { id_account } = req.params;
  const { reason } = req.body;

  try {
    // Lấy email từ cơ sở dữ liệu
    const [rows] = await pool.execute(
      "SELECT email FROM account WHERE id_account = ?",
      [id_account]
    );

    if (rows.length === 0) {
      // Xử lý trường hợp không có hàng được trả về
      return res.status(404).json({
        message: messageUser.notFoundUser,
      });
    }

    const userEmail = rows[0].email;
    console.log("userEmail là:", userEmail);

    // Thực hiện hành động khoá tài khoản tại đây
    await pool.execute("UPDATE account SET status = 1 WHERE id_account = ?", [
      id_account,
    ]);

    // Gửi mail thông báo
    mail.sendNotificationBlock(userEmail, reason); // Sử dụng email lấy được từ cơ sở dữ liệu

    return res.status(200).json({
      message: messageUser.successBlockUser,
    });
  } catch (err) {
    console.log("email là :");
    console.error("Lỗi khi khoá tài khoản:", err);
    return res.status(500).json({
      message: messageUser.error,
    });
  }
};

let unblockAccount = async (req, res) => {
  const { id_account } = req.params;
  const { reason } = req.body;

  try {
    // Lấy email từ cơ sở dữ liệu
    const [rows] = await pool.execute(
      "SELECT email FROM account WHERE id_account = ?",
      [id_account]
    );

    if (rows.length === 0) {
      // Xử lý trường hợp không có hàng được trả về
      return res.status(404).json({
        message: messageUser.notFoundUser,
      });
    }
    const userEmail = rows[0].email;
    console.log("userEmail là :", userEmail);

    // Thực hiện hành động khoá tài khoản tại đây
    await pool.execute("UPDATE account SET status = 0 WHERE id_account = ?", [
      id_account,
    ]);

    // Gửi mail thông báo
    mail.sendNotificationUnblock(userEmail, reason); // Sử dụng email lấy được từ cơ sở dữ liệu

    return res.status(200).json({
      message: messageUser.successUnBlockUser,
    });
  } catch (err) {
    console.error(messageUser.error, err);
    return res.status(500).json({
      message: messageUser.error,
    });
  }
};

module.exports = {
  handleLogin,
  handleAdminLogin,
  rateComment,
  getRated,
  blockAccount,
  unblockAccount,
};

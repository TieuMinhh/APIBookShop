import pool from "../configs/connectDatabse";
import bcrypt from "bcryptjs";
import userService from "../services/userService";
import auth from "../middleware/auth";
const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
  return new Promise((resolve, reject) => {
    try {
      let hashPassword = bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (error) {
      reject(error);
    }
  });
};

//Đăng ký tài khoản
let createNewUser = async (req, res) => {
  // let { email, password, name, phone, address } = req.body;
  let { email, password, phone } = req.body;
  // let avatar = req.file.filename;
  //bắt lỗi trống thông tin
  if (!email && !password && !phone) {
    return res.status(400).json({
      errCode: 1,
      message: "Tài khoản hoặc mật khẩu bị bỏ trống",
    });
  }

  //Kiểm tra mail có trong csdl
  let checkEmail = await userService.checkUserEmail(email);
  console.log(checkEmail);
  if (!checkEmail) {
    //băm cái mật khẩu ra trăm mảnh
    let hashPasswordFromBcrypt = await hashUserPassword(password);
    //thực thi lênh sql
    await pool.execute(
      "insert into account (email,password,phone) values (?,?,?)",
      [email, hashPasswordFromBcrypt, phone]
    );
    // console.log(hashPasswordFromBcrypt);
    return res.status(200).json({
      errCode: 0,
      message: "Đăng ký thành công",
      password: hashPasswordFromBcrypt,
    });
  } else {
    return res.status(400).json({
      errCode: 2,
      message: "Email đã được đăng ký",
    });
  }
};

//Đổi mật khẩu
let handleOldPassword = (id_account) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [checkCurrentPassword] = await pool.execute(
        "select password from account where id_account=?",
        [id_account]
      );
      resolve(checkCurrentPassword[0].password);
    } catch (err) {
      reject(err);
    }
  });
};

let changePassword = async (req, res) => {
  try {
    let { oldPassword, newPassword, confirmPassword } = req.body; //Nhập 1 password cũ, 1 password mới

    let hashPasswordFromBcrypt = ""; // mã hóa password mới
    let id_account = auth.tokenData(req).id_account;
    let currentPassword = await handleOldPassword(id_account);
    console.log(oldPassword, newPassword, confirmPassword, id_account);
    let check = bcrypt.compareSync(oldPassword, currentPassword);
    console.log(check);
    if (!check) {
      return res.status(202).json({
        message: "Mật khẩu cũ không hợp lệ!",
      });
    }

    if (newPassword.trim() != confirmPassword.trim()) {
      return res.status(201).json({
        message: "Mật khẩu không khớp!",
      });
    }
    //if(oldPassword == )
    else if (newPassword.trim() != "" && confirmPassword.trim() != "") {
      newPassword = newPassword.trim();
      hashPasswordFromBcrypt = await hashUserPassword(newPassword);
      newPassword = hashPasswordFromBcrypt;
      await pool.execute("update account set password=? where id_account=?", [
        newPassword,
        id_account,
      ]);
      return res.status(200).json({
        message: "Đổi mật khẩu thành công!",
      });
    } else {
      return res.status(500).json({
        message: "Không được bỏ trống mật khẩu!",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

let handleUpdate = (name, phone, address, avatar, id_account) => {
  return new Promise(async (resolve, reject) => {
    try {
      let update = await pool.execute(
        "update account set name=?,phone=?,address=?,avatar=? where id_account=?",
        [name, phone, address, avatar, id_account]
      );
      resolve(update);
    } catch (err) {
      reject(err);
    }
  });
};

let updateInfo = async (req, res) => {
  try {
    let { name, phone, address } = req.body;
    let { id_account } = req.params;
    console.log(name, phone, address, id_account);

    // Kiểm tra xem thông tin có bị bỏ trống hay không
    if (!name || !phone || !address) {
      return res.status(400).json({
        message: "Không được bỏ trống thông tin",
      });
    }

    // Tiếp tục xử lý nếu không có thông tin bị bỏ trống
    let update = await pool.execute(
      "update account set name=?,phone=?,address=? where id_account=?",
      [name, phone, address, id_account]
    );
    return res.status(200).json({
      message: "Cập nhật thông tin thành công!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình cập nhật thông tin.",
    });
  }
};

let getListAccount = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let [list] = await pool.execute(
        "select * from account a,role r where a.role_id=r.role_id and r.role_id=0"
      );
      resolve(list);
    } catch (err) {
      reject(err);
    }
  });
};

let listAccount = async (req, res) => {
  try {
    let list = await getListAccount();
    return res.status(200).json({ listAccount: list });
  } catch (err) {
    console.log(err);
  }
};

let getInfo = async (req, res) => {
  try {
    let [info] = await pool.execute(
      "select * from account where id_account=?",
      [auth.tokenData(req).id_account]
    );
    if (info) {
      return res.status(200).json({
        userInfo: info[0],
      });
    } else {
      return res.status(400).json({
        message: "không thành công",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

let changePasswordNew = async (req, res) => {
  try {
    let { newPassword, newPassword2 } = req.body; //Nhập 1 password cũ, 1 password mới

    let hashPasswordFromBcrypt = ""; // mã hóa password mới
    let id_account = req.params.id_account;

    console.log(newPassword, newPassword2, id_account);

    if (newPassword.trim() != newPassword2.trim()) {
      return res.status(200).json({
        message: "Mật khẩu không khớp!",
      });
    }
    //if(oldPassword == )
    else if (newPassword.trim() != "" && newPassword2.trim() != "") {
      newPassword = newPassword.trim();
      hashPasswordFromBcrypt = await hashUserPassword(newPassword);
      newPassword = hashPasswordFromBcrypt;
      await pool.execute("update account set password=? where id_account=?", [
        newPassword,
        id_account,
      ]);
      return res.status(200).json({
        message: "Đổi mật khẩu thành công!",
      });
    } else {
      return res.status(500).json({
        message: "Vui lòng không được bỏ trống mật khẩu!",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createNewUser,
  changePassword,
  hashUserPassword,
  updateInfo,
  listAccount,
  getInfo,
  changePasswordNew,
};

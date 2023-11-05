import pool from "../configs/connectDatabse";
import bcrypt from "bcryptjs";
import { createJWTTest } from "../middleware/JWTAction";
import { messageUser } from "../../message";

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};

      // check email tồn tại
      let isExist = await checkUserEmail(email);

      if (isExist) {
        const [rows] = await pool.execute(
          "SELECT * FROM account where email=?",
          [email]
        );

        // Kiểm tra trạng thái tài khoản
        if (rows[0].status === 1) {
          userData.errCode = 3;
          userData.message = messageUser.blockEmail;
          return resolve(userData);
        }

        // So sánh password
        let check = bcrypt.compareSync(password, rows[0].password);

        if (check) {
          let data = { ...rows[0] }; // lấy object
          userData.errCode = 0;
          userData.message = messageUser.successLogin;
          userData.role_id = data.role_id;
          delete data["password"]; // bỏ cái password nhạy cảm
          userData.user = createJWTTest(data);
        } else {
          userData.errCode = 2;
          userData.message = messageUser.wrongPassword;
        }
      } else {
        userData.errCode = 1;
        userData.message = messageUser.notExistEmail;
      }
      resolve(userData);
    } catch (error) {
      reject(error);
    }
  });
};

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await pool.execute(
        "SELECT count(*) as count FROM account where email=?",
        [userEmail]
      );
      console.log({ ...rows[0] });
      let check = rows[0].count > 0;
      if (check) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let handleAdminLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};

      //check email tồn tại
      let isExist = await checkAdminEmail(email);
      if (isExist) {
        const [rows] = await pool.execute(
          "SELECT * FROM account where email=? and role_id=1",
          [email]
        );
        // console.log('>>>CHeck', password, rows[0].password);

        //So sánh password
        let check = bcrypt.compareSync(password, rows[0].password);

        if (check) {
          let data = { ...rows[0] }; //lấy object
          //let data = rows[0]
          userData.errCode = 0;
          userData.message = messageUser.successLogin;
          userData.role_id = data.role_id;

          // delete user.password;
          delete data["password"]; // bỏ cái password nhạy cảm
          userData.user = createJWTTest(data); //đổi dữ liệu ng dùng thành tokten
          //userData.user = createJWTTest(data)
          // console.log(userData.user);
        } else {
          userData.errCode = 2;
          userData.message = messageUser.wrongPassword;
        }
      } else {
        userData.errCode = 1;
        userData.message = messageUser.notExistEmail;
      }
      resolve(userData);
    } catch (error) {
      reject(error);
    }
  });
};

let checkAdminEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await pool.execute(
        "SELECT count(*) as count FROM account where email=? and role_id=1",
        [userEmail]
      );
      console.log({ ...rows[0] });
      let check = rows[0].count > 0;
      if (check) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  handleUserLogin,
  checkUserEmail,
  handleAdminLogin,
  checkAdminEmail,
};

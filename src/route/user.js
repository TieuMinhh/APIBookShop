import express from "express";
import UserController from "../controller/UserController";
import APIController from "../controller/APIController";
import MailController from "../controller/MailController";
import path from "path";
import multer from "multer";
let router = express.Router();
import auth from "../middleware/auth";

const storage = multer.diskStorage({
  destination: "./src/public/image/",
  filename: (req, file, cb) =>
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ),
});

const upload = multer({
  storage: storage,
});

const userRoute = (app) => {
  //Lấy tất cả danh sách tài khoản khách hàng
  router.get("/admin/account", auth.authenAdmin, UserController.listAccount);

  // Customer
  router.get("/account/info", auth.authenUser, UserController.getInfo);
  //Đăng ký tài khoản
  router.post("/account/signup", UserController.createNewUser);

  //login
  router.post("/login", APIController.handleLogin);

  //API sửa thông tin cá nhân
  router.put(
    "/update_info/:id_account",
    auth.authenUser,
    UserController.updateInfo
  );

  //API cập nhật avatar
  router.post(
    "/update-avatar/:id_account",
    auth.authenUser,
    upload.single("avatar"),
    UserController.updateAvatar
  );

  //Đổi mật khẩu
  router.post("/change-password", UserController.changePassword);

  //Quên mật khẩu
  router.post("/forgot-password", MailController.forgotPassword);

  //Xác nhận mã xác minh
  router.post("/confirm/:id_account", MailController.confirm);

  //Reset mật khẩu
  router.post(
    "/change-password-new/:id_account",
    UserController.changePasswordNew
  );

  return app.use("/api/", router);
};

export default userRoute;

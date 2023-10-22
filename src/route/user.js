import express from "express";
import UserController from "../controller/UserController";
import APIController from "../controller/APIController";
import MailController from "../controller/MailController";

let router = express.Router();
import auth from "../middleware/auth";

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

  return app.use("/api/v1/", router);
};

export default userRoute;

import express from "express";

import APIController from "../controller/APIController";
import UserController from "../controller/UserController";
import CartController from "../controller/CartController";
import MailController from "../controller/MailController";
import OrderController from "../controller/OrderController";
let router = express.Router();
import path from "path";
import auth from "../middleware/auth";
import multer from "multer";
import appRoot from "app-root-path";
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

const storageMobile = multer.diskStorage({
  destination: "./src/public/image/",
  filename: (req, file, cb) =>
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        path.extname(file.originalname) +
        ".jpg"
    ),
});

const uploadMobile = multer({
  storage: storage,
});

const initAPIRoute = (app) => {
  // Customer
  router.get("/account/info", UserController.getInfo);
  //Đăng ký tài khoản
  router.post(
    "/account/signup",
    // uploadMobile.single("avatar"),
    UserController.createNewUser
  );

  //login
  router.post("/login", APIController.handleLogin);

  //Đổi mật khẩu
  router.post("/change-password", UserController.changePassword);
  router.post(
    "/change-password-new/:id_account",
    UserController.changePasswordNew
  );

  //Quên mật khẩu
  router.post("/forgot-password", MailController.forgotPassword);

  //Xác nhận mã xác minh
  router.post("/confirm/:id_account", MailController.confirm);

  //APi đánh giá năng lực
  router.get("/account/xemDanhGia?:id_product", APIController.getRated);
  router.post("/account/rating", APIController.rateComment);

  //API giỏ hàng

  //Xem danh sách sản phẩm trong giỏ hàng
  router.post(
    "/account/cart",
    //  auth.authenUser,
    CartController.getCart
  );
  // Tăng/giảm số lượng sản phẩm trong giỏ hàng
  router.put(
    "/account/decrement-product-from-cart/:id_product",
    CartController.DecrementProductFromCart
  );
  router.put(
    "/account/increment-product-from-cart/:id_product",
    CartController.IncrementProductFromCart
  );

  //Thêm vào giỏ hàng
  router.post(
    "/add-to-cart/:id_product",
    //auth.authenUser,
    CartController.addProduct
  );

  //Xóa sản phẩm trong giỏ hàng
  router.delete(
    "/remove-from-cart/:id_product",
    // auth.authenUser,
    CartController.deleteProductFromCart
  );

  //API đặt hàng mới hoàn toàn
  router.post("/order-pay", OrderController.datHangNew);

  //API sửa thông tin cá nhân
  router.put(
    "/update_info/:id_account",
    // auth.authenUser,
    UserController.updateInfo
  );

  //API lịch sử đơn đặt hàng
  router.get(
    "/account/order-history-by-status/:id_account/:status",
    auth.authenUser,
    OrderController.orderHistory
  );
  router.get(
    "/account/order-history-by-account/:id_account",
    auth.authenUser,
    OrderController.orderAccount
  );
  // router.get('/account/lichsudathang/:id_account/:status', OrderController.updateStatus)

  //Xem đon đặt hàng
  router.get("/order", auth.authenUser, OrderController.getOrder);

  //Xem danh sách địa chỉ đặt hàng
  router.get(
    "/delivery-address",
    auth.authenUser,
    OrderController.getAddressDelivery
  );
  //Tạo thêm địa chỉ giao hàng
  router.post(
    "/create-delivery-address",
    auth.authenUser,
    OrderController.createAddressDelivery
  );
  //Chỉnh sửa địa chỉ giao hàng
  router.post(
    "/update-delivery-address/:id_address",
    auth.authenUser,
    OrderController.updateAddressDelivery
  );
  //Xoá địa chỉ giao hàng
  router.delete(
    "/delete-delivery-address/:id_address",
    auth.authenUser,
    OrderController.deleteAddressDelivery
  );

  //Thanh toán đơn hàng
  router.post("/pay", auth.authenUser, CartController.pay);

  // Tìm kiếm sản phẩm và danh mục
  router.post("/search-product", UserController.searchProduct);
  router.post("/search-category", UserController.searchCategory);
  router.post(
    "/search-product-by-category",
    UserController.searchProductByCategory
  );
  router.post(
    "/search-product-by-id-category",
    UserController.searchProductByIdCategory
  );

  //---------------Admin----------------------------
  //Lấy tất cả danh sách tài khoản khách hàng
  router.get("/admin/account", UserController.listAccount); //auth.authenAdmin

  //Mã giảm giá
  router.get("/discount?:id", APIController.getDiscount);
  router.post(
    "/admin/create-discount",
    //auth.authenAdmin,
    APIController.createNewDiscount
  );
  router.post(
    "/admin/update-discount/:discount_id",
    //auth.authenAdmin,
    APIController.updateDiscount
  );
  router.delete(
    "/admin/delete-discount/:discount_id",
    //auth.authenAdmin,
    APIController.deleteDiscount
  );
  router.get(
    "/get-discount-by-code",
    //auth.authenUser,
    APIController.getDiscountByCode
  );

  //Xem chi tiết sản phẩm theo id_product
  router.get("/detail-product?:id", APIController.getDetail_1_Product);

  //Sản phẩm
  router.get("/admin/product?:id", APIController.getDetailProduct); // lấy tất cả sản phẩm theo danh mục
  router.post(
    "/admin/createNewProduct",
    upload.single("images"),
    //auth.authenAdmin,
    APIController.createNewProduct
  );
  router.post(
    "/admin/updateProduct/:id_product",
    upload.single("images"),
    //auth.authenAdmin,
    APIController.updateProduct
  );
  router.delete(
    "/admin/deleteProduct/:id_product",
    //auth.authenAdmin,
    APIController.deleteProduct
  );

  //Nhà xuất bản
  router.get("/admin/publishing-company?:id", APIController.getNXB);
  router.post(
    "/admin/create-nxb",
    //auth.authenAdmin,
    APIController.createNewNXB
  );
  router.post(
    "/admin/update-nxb/:id_company",
    //auth.authenAdmin,
    APIController.updateNXB
  );
  router.delete(
    "/admin/delete-nxb/:id_company",
    //auth.authenAdmin,
    APIController.deleteNXB
  );

  //Giảm giá sách
  router.get("/admin/promotion-product?:id", APIController.getPromotionProduct);
  router.post(
    "/admin/create-promotion-product",
    //auth.authenAdmin,
    APIController.createNewPromotionProduct
  );
  router.post(
    "/admin/update-promotion-product/:id_promotion",
    //auth.authenAdmin,
    APIController.updatePromotionProduct
  );
  router.delete(
    "/admin/delete-promotion-product/:id_promotion",
    //auth.authenAdmin,
    APIController.deletePromotionProduct
  );

  // Phan trang
  router.get("/category-by-pages?:page", APIController.getCategoryByPages);
  router.get("/product-by-pages?:page", APIController.getProductByPages);

  //Danh mục
  router.get("/category?:id", APIController.getCategory);
  router.post(
    "/admin/create-category",
    //auth.authenAdmin,
    upload.single("logo"),
    APIController.createNewCategory
  );
  router.post(
    "/admin/update-category?:id",
    //auth.authenAdmin,
    upload.single("logo"),
    APIController.updateCategory
  );
  router.delete(
    "/admin/delete-category?:id_category",
    //auth.authenAdmin,
    APIController.deleteCategory
  );

  //Đơn hàng
  router.get("/admin/get-orders", OrderController.getOrderNew); //auth.authenAdmin
  router.get("/admin/detail-order/:id_order", OrderController.getDetailOrder);
  // router.get("/admin/detail/:id_order", OrderController.detail);
  router.post("/admin/confirm-order/:id_order", OrderController.xacNhanDonHang);
  router.post(
    "/admin/complete-order/:id_order",
    OrderController.hoanThanhDonHang
  );
  router.post("/admin/cancel-order/:id_order", OrderController.huyDonHang);

  //Đăng nhập của admin
  router.post("/admin/login", APIController.handleAdminLogin);

  //Doanh số
  router.get("/admin/revenue-year/:year", OrderController.xemDoanhSo);

  //Doanh số theo tháng
  router.get(
    "/admin/revenue-month/:month/:year",
    OrderController.xemDoanhSoThang
  );

  router.get("/most-by-product", OrderController.mostBuyProduct);
  router.get("/most-reducing-product", OrderController.mostReducingProduct);
  // router.get('/admin/deleteProduct/:id_product', (req) => {
  //     console.log('Hello');
  // }
  // )

  return app.use("/api/v1/", router);
};

export default initAPIRoute;

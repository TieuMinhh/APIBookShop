import express from "express";
import CartController from "../controller/CartController";

let router = express.Router();
import auth from "../middleware/auth";

const cartRoute = (app) => {
  //Xem danh sách sản phẩm trong giỏ hàng
  router.post("/account/cart", auth.authenUser, CartController.getCart);

  //Thêm vào giỏ hàng
  router.post(
    "/add-to-cart/:id_product",
    auth.authenUser,
    CartController.addProduct
  );

  //Xóa sản phẩm trong giỏ hàng
  router.delete(
    "/remove-from-cart/:id_product",
    auth.authenUser,
    CartController.deleteProductFromCart
  );

  // Tăng/giảm số lượng sản phẩm trong giỏ hàng
  router.put(
    "/account/decrement-product-from-cart/:id_product",
    auth.authenUser,
    CartController.DecrementProductFromCart
  );

  router.put(
    "/account/increment-product-from-cart/:id_product",
    auth.authenUser,
    CartController.IncrementProductFromCart
  );

  return app.use("/api/", router);
};

export default cartRoute;

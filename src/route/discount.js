import express from "express";
import DiscountController from "../controller/DiscountController";
let router = express.Router();
import auth from "../middleware/auth";

const discountRoute = (app) => {
  //Mã giảm giá
  router.get("/discount?:id", DiscountController.getDiscount);
  router.post(
    "/admin/create-discount",
    auth.authenAdmin,
    DiscountController.createNewDiscount
  );
  router.post(
    "/admin/update-discount/:discount_id",
    auth.authenAdmin,
    DiscountController.updateDiscount
  );
  router.delete(
    "/admin/delete-discount/:discount_id",
    auth.authenAdmin,
    DiscountController.deleteDiscount
  );
  router.get(
    "/get-discount-by-code",
    auth.authenUser,
    DiscountController.getDiscountByCode
  );

  //Giảm giá sách
  router.get(
    "/admin/promotion-product?:id",
    DiscountController.getPromotionProduct
  );
  router.post(
    "/admin/create-promotion-product",
    auth.authenAdmin,
    DiscountController.createNewPromotionProduct
  );
  router.post(
    "/admin/update-promotion-product/:id_promotion",
    auth.authenAdmin,
    DiscountController.updatePromotionProduct
  );
  router.delete(
    "/admin/delete-promotion-product/:id_promotion",
    auth.authenAdmin,
    DiscountController.deletePromotionProduct
  );

  return app.use("/api/v1/", router);
};

export default discountRoute;

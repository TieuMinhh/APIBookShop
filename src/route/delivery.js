import express from "express";
import DeliveryController from "../controller/DeliveryController";
let router = express.Router();
import auth from "../middleware/auth";

const deliveryRoute = (app) => {
  //Xem danh sách địa chỉ đặt hàng
  router.get(
    "/delivery-address",
    auth.authenUser,
    DeliveryController.getAddressDelivery
  );
  //Tạo thêm địa chỉ giao hàng
  router.post(
    "/create-delivery-address",
    auth.authenUser,
    DeliveryController.createAddressDelivery
  );
  //Chỉnh sửa địa chỉ giao hàng
  router.post(
    "/update-delivery-address/:id_address",
    auth.authenUser,
    DeliveryController.updateAddressDelivery
  );
  //Xoá địa chỉ giao hàng
  router.delete(
    "/delete-delivery-address/:id_address",
    auth.authenUser,
    DeliveryController.deleteAddressDelivery
  );

  return app.use("/api/v1/", router);
};

export default deliveryRoute;

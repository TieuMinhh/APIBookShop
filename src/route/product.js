import express from "express";
import ProductController from "../controller/ProductController";
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

const productRoute = (app) => {
  //Xem chi tiết sản phẩm theo id_product
  router.get("/detail-product?:id", ProductController.getDetail_1_Product);

  //Sản phẩm
  router.get("/admin/product?:id", ProductController.getDetailProduct); // lấy tất cả sản phẩm theo danh mục
  router.post(
    "/admin/createNewProduct",
    upload.single("images"),
    auth.authenAdmin,
    ProductController.createNewProduct
  );
  router.post(
    "/admin/updateProduct/:id_product",
    upload.single("images"),
    auth.authenAdmin,
    ProductController.updateProduct
  );
  router.delete(
    "/admin/deleteProduct/:id_product",
    auth.authenAdmin,
    ProductController.deleteProduct
  );
  router.get("/most-by-product", ProductController.mostBuyProduct);
  router.get("/most-reducing-product", ProductController.mostReducingProduct);
  return app.use("/api/v1/", router);
};

export default productRoute;

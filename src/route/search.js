import express from "express";
import SearchController from "../controller/SearchController";
let router = express.Router();

const searchRoute = (app) => {
  // Tìm kiếm sản phẩm và danh mục
  router.post("/search-product", SearchController.searchProduct);
  router.post("/search-category", SearchController.searchCategory);
  router.post(
    "/search-product-by-category",
    SearchController.searchProductByCategory
  );
  router.post(
    "/search-product-by-id-category",
    SearchController.searchProductByIdCategory
  );

  return app.use("/api/v1/", router);
};

export default searchRoute;

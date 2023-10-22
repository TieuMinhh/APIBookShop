import express from "express";
import PaginationController from "../controller/PaginationController";

let router = express.Router();

const paginationRoute = (app) => {
  router.get(
    "/category-by-pages?:page",
    PaginationController.getCategoryByPages
  );
  router.get("/product-by-pages?:page", PaginationController.getProductByPages);
  return app.use("/api/v1/", router);
};

export default paginationRoute;

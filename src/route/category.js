import express from "express";
import CategoryController from "../controller/CategoryController";
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

const categoryRoute = (app) => {
  router.get("/category?:id", CategoryController.getCategory);
  router.post(
    "/admin/create-category",
    auth.authenAdmin,
    upload.single("logo"),
    CategoryController.createNewCategory
  );
  router.post(
    "/admin/update-category?:id",
    auth.authenAdmin,
    upload.single("logo"),
    CategoryController.updateCategory
  );
  router.delete(
    "/admin/delete-category?:id_category",
    auth.authenAdmin,
    CategoryController.deleteCategory
  );
  return app.use("/api/", router);
};

export default categoryRoute;

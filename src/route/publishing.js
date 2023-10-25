import express from "express";
import PublishingController from "../controller/PublishingController";
let router = express.Router();
import auth from "../middleware/auth";

const publishingRoute = (app) => {
  //Nhà xuất bản
  router.get("/admin/publishing-company?:id", PublishingController.getNXB);
  router.post(
    "/admin/create-nxb",
    auth.authenAdmin,
    PublishingController.createNewNXB
  );
  router.post(
    "/admin/update-nxb/:id_company",
    auth.authenAdmin,
    PublishingController.updateNXB
  );
  router.delete(
    "/admin/delete-nxb/:id_company",
    auth.authenAdmin,
    PublishingController.deleteNXB
  );

  return app.use("/api/", router);
};

export default publishingRoute;

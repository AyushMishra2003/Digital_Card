import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  addOperator,
  getOperator,
  updateOperator,
  updateStatus,
} from "../controller/Operator.controller.js";
import { deleteCoupon } from "../controller/CouponController.js";

const operatorRoute = Router();

operatorRoute.post("/", upload.single("operatorPhoto"), addOperator);
operatorRoute.get("/", getOperator);
operatorRoute.put("/:id", updateOperator);
operatorRoute.put("/operatorStatus/:id", updateStatus);

export default operatorRoute;

import { Router } from "express";
import {
  addFeedBack,
  deleteFeedBack,
  getFeedBack,
} from "../controller/FeedBack.controller.js";

const feedbackRouter = Router();

feedbackRouter.post("/", addFeedBack);
feedbackRouter.get("/", getFeedBack);
feedbackRouter.delete("/", deleteFeedBack);

export default feedbackRouter;

import { Router } from "express";
import { getGroup } from "../controllers/groupController";

const router: Router = Router();

router.get("/group/:id", getGroup);

export default {
  routes: router,
};

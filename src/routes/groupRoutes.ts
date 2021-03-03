import { Router } from "express";
import { getGroup, getAllGantt } from "../controllers/groupController";

const router: Router = Router();

router.get("/group/:id", getGroup);
router.get("/group/:id/gantt", getAllGantt);

export default {
  routes: router,
};

import { Router } from "express";
import { getNotifications } from "../controllers/notificationController";

const router: Router = Router();

router.get("/notifications/:userId", getNotifications);

export default {
  routes: router,
};

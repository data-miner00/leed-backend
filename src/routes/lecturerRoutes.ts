import { Router } from "express";
import { getLecturer } from "../controllers/lecturerController";

const router: Router = Router();

router.get("lecturer/:id", getLecturer);

export default {
  routes: router,
};

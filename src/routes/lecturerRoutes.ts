import { Router } from "express";
import { getLecturer, getSubjects } from "../controllers/lecturerController";

const router: Router = Router();

router.get("/lecturer/:id", getLecturer);
router.get("/lecturer/:id/subjects", getSubjects);

export default {
  routes: router,
};

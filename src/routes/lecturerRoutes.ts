import { Router } from "express";
import {
  getAssignments,
  getLecturer,
  getSubjects,
} from "../controllers/lecturerController";

const router: Router = Router();

router.get("/lecturer/:id", getLecturer);
router.get("/lecturer/:id/subjects", getSubjects);
router.post("/lecturer/:id/assignments", getAssignments); // The id is not used

export default {
  routes: router,
};

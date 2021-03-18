import { Router } from "express";
import {
  getAssignment,
  setAssignment,
  getSomeDetails,
  getSomeDetailsLecturer,
} from "../controllers/assignmentController";

const router: Router = Router();

router.get("/assignment/:id", getAssignment);
router.post("/assignment", setAssignment);
router.post("/assignment/overview", getSomeDetails);
router.get("/assignment/:lecturerId/overview", getSomeDetailsLecturer);
// router.post("/assignment/:id/upload", );

export default {
  routes: router,
};

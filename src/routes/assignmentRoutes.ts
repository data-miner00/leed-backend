import { Router } from "express";
import {
  getAssignment,
  setAssignment,
  getSomeDetails,
  getSomeDetailsLecturer,
  assignmentQuestionUpload,
  assignmentSubmit,
} from "../controllers/assignmentController";
import multer from "multer";
import { assignmentStorage, questionStorage } from "../middleware/multer";

const router: Router = Router();

router.get("/assignment/:id", getAssignment);
router.post("/assignment", setAssignment);
router.post("/assignment/overview", getSomeDetails);
router.get("/assignment/:lecturerId/overview", getSomeDetailsLecturer);
router.post(
  "/assignment/:id/upload",
  multer({ storage: assignmentStorage }).single("docs"),
  assignmentSubmit
);
router.post(
  "/assignment/:id/ques/upload",
  multer({ storage: questionStorage }).single("ques"),
  assignmentQuestionUpload
);

export default {
  routes: router,
};

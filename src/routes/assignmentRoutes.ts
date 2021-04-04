import { Router } from "express";
import {
  getAssignment,
  setAssignment,
  getSomeDetails,
  getSomeDetailsLecturer,
  assignmentQuestionUpload,
  assignmentSubmit,
  downloadAssignmentQuestion,
  downloadStudentAssignment,
  supplyAssignmentData,
  updateAssignment,
} from "../controllers/assignmentController";
import multer from "multer";
import { assignmentStorage, questionStorage } from "../middleware/multer";

const router: Router = Router();

router.get("/assignment/:id", getAssignment);
router.post("/assignment", setAssignment);
router.post("/assignment/overview", getSomeDetails);
router.get("/assignment/:lecturerId/overview", getSomeDetailsLecturer);
router.post(
  "/assignment/:id/upload/ques",
  multer({ storage: questionStorage }).single("quest"),
  assignmentQuestionUpload
);
router.post(
  "/assignment/:id/upload/:groupId",
  multer({ storage: assignmentStorage }).single("docs"),
  assignmentSubmit
);

router.get("/assignment/submitted/:filename", downloadStudentAssignment);
router.get("/assignment/question/:filename", downloadAssignmentQuestion);
router.get("/assignment/:id/data", supplyAssignmentData);
router.patch("/assignment/:id", updateAssignment);

export default {
  routes: router,
};

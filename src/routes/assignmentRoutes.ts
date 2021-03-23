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
} from "../controllers/assignmentController";
import multer from "multer";
import { assignmentStorage, questionStorage } from "../middleware/multer";
import path from "path";

const router: Router = Router();

router.get("/assignment/:id", getAssignment);
router.post("/assignment", setAssignment);
router.post("/assignment/overview", getSomeDetails);
router.get("/assignment/:lecturerId/overview", getSomeDetailsLecturer);
router.post(
  "/assignment/:id/upload/:groupId",
  multer({ storage: assignmentStorage }).single("docs"),
  assignmentSubmit
);
router.post(
  "/assignment/:id/upload/ques",
  multer({ storage: questionStorage }).single("ques"),
  assignmentQuestionUpload
);
router.get("/assignment/submitted/:filename", downloadStudentAssignment);
router.get("/assignment/question/:filename", downloadAssignmentQuestion);

router.get("/test", function (req, res, next) {
  // fs.readdir(
  //   path.join(__dirname, "../../", "uploads", "assignments"),
  //   function (err, files) {
  //     res.send(files);
  //   }
  // );
  const pathh = path.join(__dirname, "../../", "uploads", "assignments");
  const file = path.join(pathh, "1.jpg");
  console.log(file);
  res.download(file);
});

export default {
  routes: router,
};

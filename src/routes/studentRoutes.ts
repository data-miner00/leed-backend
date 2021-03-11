import { Router } from "express";
import {
  addStudent,
  getAllStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  getStudentsAvatar,
} from "../controllers/studentController";

const router: Router = Router();

router.post("/student", addStudent);
router.get("/students", getAllStudents);
router.get("/student/:id", getStudent);
router.put("/student/:id", updateStudent);
router.delete("/student/:id", deleteStudent);
router.post("/student/avatar", getStudentsAvatar);

export default {
  routes: router,
};

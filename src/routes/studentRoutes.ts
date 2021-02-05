import { Router } from "express";
import {
  addStudent,
  getAllStudents,
  getStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController";

const router: Router = Router();

router.post("/student", addStudent);
router.get("/students", getAllStudents);
router.get("/student/:id", getStudent);
router.put("/student/:id", updateStudent);
router.delete("/student/:id", deleteStudent);

export default {
  routes: router,
};

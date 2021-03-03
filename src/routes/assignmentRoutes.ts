import { Router } from "express";
import {
  getAssignment,
  setAssignment,
  getSomeDetails,
} from "../controllers/assignmentController";

const router: Router = Router();

router.get("/assignment/:id", getAssignment);
router.post("/assignment", setAssignment);
router.post("/assignment/overview", getSomeDetails);

export default {
  routes: router,
};

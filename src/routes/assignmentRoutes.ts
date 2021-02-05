import { Router } from "express";
import { getAssignment } from "../controllers/assignmentController";

const router: Router = Router();

router.get("/assignment/:id", getAssignment);

export default {
  routes: router,
};

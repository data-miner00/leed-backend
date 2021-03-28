import { Router } from "express";
import { getSubject, getSubjects } from "../controllers/subjectController";

const router: Router = Router();

router.get("/subject/:code", getSubject);
router.post("/subject", getSubjects);

export default {
  routes: router,
};

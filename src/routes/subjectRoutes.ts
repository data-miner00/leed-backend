import { Router } from "express";
import { getSubject } from "../controllers/subjectController";

const router: Router = Router();

router.get("/subject/:code", getSubject);

export default {
  routes: router,
};

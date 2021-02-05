import { Router } from "express";
import { verifyCredentials } from "../controllers/credentialController";

const router: Router = Router();

router.post("/login", verifyCredentials);

export default {
  routes: router,
};

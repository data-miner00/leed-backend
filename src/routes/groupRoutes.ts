import { Router } from "express";
import {
  getGroup,
  getAllGantt,
  getGroupMembers,
  createGroup,
  addGantt,
  addBooking,
  getBookings,
  joinGroup,
  matchmake,
} from "../controllers/groupController";

const router: Router = Router();

router.get("/group/:id", getGroup);
router.get("/group/:id/gantt", getAllGantt);
router.get("/group/:id/members", getGroupMembers);
router.post("/group/create", createGroup);
router.post("/group/:id/gantt/create", addGantt);
router.post("/group/:id/booking", addBooking);
router.get("/group/:id/booking", getBookings);
router.post("/group/join", joinGroup);
router.post("/group/matchmake", matchmake);

export default {
  routes: router,
};

import { Router } from "express";
import {
  getGroup,
  getAllGantt,
  getGroupMembers,
  addGroup,
  addGantt,
  addBooking,
  getBookings,
} from "../controllers/groupController";

const router: Router = Router();

router.get("/group/:id", getGroup);
router.get("/group/:id/gantt", getAllGantt);
router.get("/group/:id/members", getGroupMembers);
router.post("/group/create", addGroup);
router.post("/group/:id/gantt/create", addGantt);
router.post("/group/:id/booking", addBooking);
router.get("/group/:id/booking", getBookings);

export default {
  routes: router,
};

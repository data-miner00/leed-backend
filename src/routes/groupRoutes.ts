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
  getGroupAndAssignment,
  changeGroupAvailability,
  updateGantt,
  deleteGantt,
  getChatMessages,
  getCode,
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
router.get("/group/:id/extended/v1", getGroupAndAssignment);
router.get("/group/:id/chats", getChatMessages);
router.patch("/group/:id/availability", changeGroupAvailability);

router.patch("/group/:id/gantt/:ganttId", updateGantt);
router.delete("/group/:id/gantt/:ganttId", deleteGantt);

router.get("/group/:id/code", getCode);

export default {
  routes: router,
};

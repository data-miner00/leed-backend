import express, { Application, Request, Response, NextFunction } from "express";
import configs from "./config";
import { db as firebase } from "./database";
import cors from "cors";
import bodyParser from "body-parser";
import schedule from "node-schedule";

import studentRoutes from "./routes/studentRoutes";
import credentialRoutes from "./routes/credentialRoutes";
import lecturerRoutes from "./routes/lecturerRoutes";
import assignmentRoutes from "./routes/assignmentRoutes";
import groupRoutes from "./routes/groupRoutes";
import subjectRoutes from "./routes/subjectRoutes";
import notificationRoutes from "./routes/notificationRoutes";

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use("/api", studentRoutes.routes);
app.use("/api", credentialRoutes.routes);
app.use("/api", lecturerRoutes.routes);
app.use("/api", assignmentRoutes.routes);
app.use("/api", groupRoutes.routes);
app.use("/api", subjectRoutes.routes);
app.use("/api", notificationRoutes.routes);

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  res.send("hello");
});

let serverWeek = 12;
schedule.scheduleJob("0 0 0 * * 1", () => {
  // Increment week number
  serverWeek++;

  // Reset discussion time and bookings
  firebase
    .firestore()
    .collection("groups")
    .get()
    .then((groups) => {
      groups.forEach((doc) => {
        // Reset time
        doc.ref.update({
          confirmedTime: {},
        });
        // Remove existing bookings
        doc.ref
          .collection("booking")
          .get()
          .then((bookings) => {
            bookings.forEach((idoc) => {
              idoc.ref.delete();
            });
          });
      });
    });
});

app.get("/api/week", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send({ serverWeek });
});

app.listen(configs.port, (): void => console.log("Server ready"));

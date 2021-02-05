import express, { Application, Request, Response, NextFunction } from "express";
import configs from "./config";
import cors from "cors";
import bodyParser from "body-parser";

import studentRoutes from "./routes/studentRoutes";
import credentialRoutes from "./routes/credentialRoutes";
import lecturerRoutes from "./routes/lecturerRoutes";
import assignmentRoutes from "./routes/assignmentRoutes";
import groupRoutes from "./routes/groupRoutes";
import subjectRoutes from "./routes/subjectRoutes";

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

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("hello");
});

app.listen(configs.port, (): void => console.log("Server ready"));

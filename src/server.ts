import express, { Application, Request, Response, NextFunction } from "express";
import configs from "./config";
import cors from "cors";
import multer from "multer";
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, originalname);
  },
});
app.use(multer({ storage }).array("docs"));

app.use("/api", studentRoutes.routes);
app.use("/api", credentialRoutes.routes);
app.use("/api", lecturerRoutes.routes);
app.use("/api", assignmentRoutes.routes);
app.use("/api", groupRoutes.routes);
app.use("/api", subjectRoutes.routes);

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  res.send("hello");
});

app.post("/upload", async (req: Request, res: Response, next: NextFunction) => {
  console.dir(req.files);
});

app.listen(configs.port, (): void => console.log("Server ready"));

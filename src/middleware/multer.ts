import multer from "multer";
import path from "path";
import { Request } from "express";

export const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("uploads", "assignments"));
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, originalname);
  },
});

export const questionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("uploads", "questions"));
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, originalname);
  },
});

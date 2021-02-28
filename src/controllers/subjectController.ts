import { db as firebase } from "../database";
import { Request, Response, NextFunction } from "express";

const firestore = firebase.firestore();

export const getSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subjectCode = req.params.code;
    const subjectRef = firestore.collection("subjects").doc(subjectCode);
    const subjectData = await subjectRef.get();

    if (subjectData.exists) {
      res.status(200).send(subjectData.data());
    } else {
      res.status(404).send("Data not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

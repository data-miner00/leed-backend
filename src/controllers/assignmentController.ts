import { db as firebase } from "../database";
import { Request, Response, NextFunction } from "express";

const firestore = firebase.firestore();

export const getAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignmentId = req.params.id;
    const assignmentRef = firestore.collection("assignments").doc(assignmentId);
    const assignmentData = await assignmentRef.get();

    if (assignmentData.exists) {
      res.status(200).send(assignmentData.data());
    } else {
      res.status(404).send("Assignment with the given ID not found");
    }
  } catch (error) {
    res.send(400).send(error.message);
  }
};

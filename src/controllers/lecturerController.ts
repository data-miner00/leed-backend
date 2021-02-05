import { db as firebase } from "../database";
import { Request, Response, NextFunction } from "express";

const firestore = firebase.firestore();

export const getLecturer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const staffId = req.params.id;
    const lecturer = await firestore.collection("lecturer").doc(staffId);
    const data = await lecturer.get();

    if (data.exists) {
      res.status(200).send(data.data());
    } else {
      res.status(404).send("Data not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

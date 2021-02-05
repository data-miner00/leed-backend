import { db as firebase } from "../database";
import { Request, Response, NextFunction } from "express";

const firestore = firebase.firestore();

export const addGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    await firestore.collection("groups").doc().set(data);
    res.send("Record saved");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const group = await firestore.collection("groups").doc(groupId);
    const data = await group.get();

    if (data.exists) {
      res.status(200).send(data.data());
    } else {
      res.status(404).send("Data not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

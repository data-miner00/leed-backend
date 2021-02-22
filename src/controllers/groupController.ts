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
    res.status(200).send("Record saved");
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
    const groupRef = firestore.collection("groups").doc(groupId);
    const groupSnapshot = await groupRef.get();
    const groupData = groupSnapshot.data();

    if (groupSnapshot.exists) {
      const ganttRef = firestore
        .collection("groups")
        .doc(groupId)
        .collection("gantts");
      const ganttSnapshot = await ganttRef.get();

      if (ganttSnapshot.docs.length > 0) {
        const ganttData: Array<Object> = [];

        ganttSnapshot.forEach((doc) => {
          ganttData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        const data = {
          ...groupData,
          gantts: ganttData,
        };

        res.status(200).send(data);
      } else {
        res.status(200).send(groupData);
      }
    } else {
      res.status(404).send("Data not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getAllGantt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const ganttRef = firestore
      .collection("groups")
      .doc(groupId)
      .collection("gantts");
    const ganttSnapshot = await ganttRef.get();

    const ganttData: Array<Object> = [];

    ganttSnapshot.forEach((doc) => {
      ganttData.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).send(ganttData);
  } catch (error) {
    console.error(error);
  }
};

export const addGantt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const gantt = req.body;

    await firestore
      .collection("groups")
      .doc(groupId)
      .collection("gantts")
      .doc()
      .set(gantt);

    res.status(200).send("Created");
  } catch (error) {
    console.error(error);
  }
};

import { db as firebase } from "../database";
import { Request, Response, NextFunction } from "express";
import { timestampToDate, timestampGetTime } from "../utils";

const firestore = firebase.firestore();

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId: string = req.params.userId;
    const query = firestore
      .collection("notifications")
      .where("recipients", "array-contains", userId)
      .orderBy("createdAt", "desc")
      .limit(25);
    const querySnapshot = await query.get();
    const notifications: Object[] = [];
    querySnapshot.forEach((doc) => {
      const {
        actor,
        actorName,
        actorAvatarUri,
        createdAt,
        message,
        recipients,
        type,
      } = doc.data();
      notifications.push({
        actor,
        actorName,
        actorAvatarUri,
        message,
        type,
        createdDate: timestampToDate(createdAt),
        createdTime: timestampGetTime(createdAt),
      });
    });

    console.log(notifications);
    res.status(200).send(notifications);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

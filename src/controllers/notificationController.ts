import { db as firebase } from "../database";
import { Request, Response, NextFunction } from "express";
import { timestampToDate, timestampGetTime } from "../utils";

const firestore = firebase.firestore();

/**
 *  Get a list of notifications with 25 items max of a user.
 *
 *  @param {string} req.params.userId
 *
 *  @returns {Array<Object>}
 *  Array
 *    {
 *      actor: string,
 *      actorName: string,
 *      actorAvatarUri: string,
 *      message: string,
 *      type: string,
 *      createdDate: string,
 *      createdTime: string
 *    }
 */
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

    res.status(200).send(notifications);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

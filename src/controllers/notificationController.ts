import { db as firebase } from "../database";
import { Request, Response, NextFunction } from "express";

const firestore = firebase.firestore();

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //
};

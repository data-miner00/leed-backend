import { db as firebase } from "../database";
import { Request, Response, NextFunction } from "express";
import { MD5 } from "jshashes";

const firestore = firebase.firestore();

export const verifyCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const credentials = req.body;
    const userCredential = await firestore
      .collection("credentials")
      .doc(credentials.userId);
    const data = await userCredential.get();

    if (!data.exists) {
      res.status(404).send("User with the given ID not found");
    } else {
      const inputPasswordHashed = new MD5().hex(credentials.password);
      const actualPasswordHashed = data.data()!.passwordHashed;
      const isPasswordMatch = inputPasswordHashed === actualPasswordHashed;

      if (isPasswordMatch) {
        res.status(200).send("Authenticated");
      } else res.status(403).send("Forbidden");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

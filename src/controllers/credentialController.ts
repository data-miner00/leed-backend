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
    const userCredentialRef = firestore
      .collection("credentials")
      .doc(credentials.userId);
    const userCredentialData = await userCredentialRef.get();

    if (!userCredentialData.exists) {
      res.status(404).send("User with the given ID not found");
    } else {
      /* temporary code */
      let { passwordHashed, userType } = userCredentialData.data()!;
      userType = userType == "student" ? "students" : userType;
      /* ============== */

      const inputPasswordHashed = new MD5().hex(credentials.password);
      const actualPasswordHashed = passwordHashed;
      const isPasswordMatch = inputPasswordHashed === actualPasswordHashed;

      if (isPasswordMatch) {
        const userDetailsRef = firestore
          .collection(userType)
          .doc(credentials.userId);
        const userDetailsData = await userDetailsRef.get();
        const formattedData = userDetailsData.data()!;
        formattedData.userId = credentials.userId;
        formattedData.userType = userType;

        res.status(200).send(formattedData);
      } else res.status(403).send("Forbidden");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

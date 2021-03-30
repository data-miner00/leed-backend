import { db as firebase } from "../database";
import { Request, Response, NextFunction } from "express";

const firestore = firebase.firestore();

/**
 *  Query lecturer's info by their staff id.
 *
 *  @param {string} id (as of staff id)
 *
 *  @returns {Object}
 *  {
 *    avatarUri: string,
 *    email: string,
 *    faculty: string,
 *    name: string,
 *    phoneNo: string,
 *    subjectsId: Array<string>
 *  }
 */
export const getLecturer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const staffId = req.params.id;
    const lecturerRef = firestore.collection("lecturer").doc(staffId);
    const lecturerData = await lecturerRef.get();

    if (lecturerData.exists) {
      res.status(200).send(lecturerData.data());
    } else {
      res.status(404).send("lecturer not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Query lecturer's subjects by their id
 *
 *  @param {string} id (as of staff id)
 *
 *  @returns {Array<string>} (as of subject's Ids)
 *
 */
export const getSubjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lecturerId = req.params.id;
    const lecturerRef = firestore.collection("lecturer").doc(lecturerId);
    const lecturerSnapshot = await lecturerRef.get();
    const { subjectsId } = lecturerSnapshot.data()!;
    res.status(200).send(subjectsId);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Query lecturer's assignments by their coursesCode.
 *
 *  @param {Array<string>} req.body.subjectsCode
 */
export const getAssignments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { subjectsCode } = req.body;
    const assignmentsQuery = firestore
      .collection("assignments")
      .where("subjectCode", "in", subjectsCode);
    const querySnapshot = await assignmentsQuery.get();
    const assignmentsId: [][] = [];
    querySnapshot.forEach((doc) => {
      const { _assignmentsId } = doc.data()!;
      assignmentsId.push(_assignmentsId);
    });
    res.status(200).send(assignmentsId.flat());
  } catch (error) {
    res.status(400).send(error.message);
  }
};

import { db as firebase, FieldPath } from "../database";
import { Request, Response, NextFunction } from "express";

const firestore = firebase.firestore();

export const getSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subjectCode = req.params.code;
    const subjectRef = firestore.collection("subjects").doc(subjectCode);
    const subjectData = await subjectRef.get();

    if (subjectData.exists) {
      res.status(200).send(subjectData.data());
    } else {
      res.status(404).send("Data not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Get a list of subjects.
 *
 *  @param {Array<string>} req.body (array of subjectCodes)
 *
 */
export const getSubjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subjectsId = req.body;
    const subjectsQuery = firestore
      .collection("subjects")
      .where(FieldPath.documentId(), "in", subjectsId);
    const querySnapshot = await subjectsQuery.get();

    type Subject = {
      code: string;
      lecturerId: string;
      assignmentsId: string;
      description: string;
      studentsCount: number;
      name: string;
    };

    const subjects: Subject[] = [];
    querySnapshot.forEach(async (doc) => {
      const {
        name,
        lecturerId,
        assignmentsId,
        description,
        studentsCount,
      } = doc.data()!;
      subjects.push({
        code: doc.id,
        name,
        lecturerId,
        assignmentsId,
        description,
        studentsCount,
      });
    });

    const subjectsV2 = await (async (subjects: Array<Subject>) => {
      let queries = [];
      for (let i = 0; i < subjects.length; i++) {
        const lecturerRef = firestore
          .collection("lecturer")
          .doc(subjects[i].lecturerId);
        const lecturerSnapshot = await lecturerRef.get();
        const lecturerName = lecturerSnapshot.data()!.name;
        queries.push({ ...subjects[i], lecturerName });
      }
      return Promise.all(queries);
    })(subjects);

    res.status(200).send(subjectsV2);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

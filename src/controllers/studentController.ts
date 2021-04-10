import { db as firebase, FieldPath, FieldValue } from "../database";
import Student from "../models/Student";
import { Request, Response, NextFunction } from "express";

const firestore = firebase.firestore();

export const addStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    await firestore.collection("students").doc().set(data);
    res.send("Record saved!");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getAllStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentsRef = firestore.collection("students");
    const studentsData = await studentsRef.get();
    const studentsArray: Student[] = [];
    if (studentsData.empty) {
      res.status(404).send("No student record found");
    } else {
      studentsData.forEach((doc) => {
        const student = new Student(
          doc.data().name,
          doc.data().id,
          doc.data().subjectsId,
          doc.data().groupsId,
          doc.data().email
        );
        studentsArray.push(student);
      });
      res.send(studentsArray);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const studentRef = firestore.collection("students").doc(id);
    const studentData = await studentRef.get();
    if (!studentData.exists) {
      res.status(404).send("Student with the given ID not found");
    } else {
      res.status(200).send(studentData.data());
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const updateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const studentRef = firestore.collection("students").doc(id);
    await studentRef.update(data);
    res.send("Student record updated successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const deleteStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    await firestore.collection("students").doc(id).delete();
    res.send("Record deleted successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getStudentsAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentsId: string[] = req.body;
    const studentsQuery = firestore
      .collection("students")
      .where(FieldPath.documentId(), "in", studentsId);
    const studentsSnapshot = await studentsQuery.get();
    const studentAvatarMap: any = {};
    studentsSnapshot.forEach((doc) => {
      const { name, avatarUri } = doc.data();
      studentAvatarMap[doc.id] = { name, avatarUri };
    });
    console.log(studentAvatarMap);
    res.status(200).send(studentAvatarMap);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getStudentGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.params.id;
    const studentRef = firestore.collection("students").doc(studentId);
    const studentSnapshot = await studentRef.get();
    const { groupsId } = studentSnapshot.data()!;

    res.status(200).send(groupsId);
  } catch (error) {
    res.status(404).send(error.message);
  }
};

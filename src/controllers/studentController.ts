import { db as firebase } from "../database";
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
    const students = await firestore.collection("students");
    const data = await students.get();
    const studentsArray: Student[] = [];
    if (data.empty) {
      res.status(404).send("No student record found");
    } else {
      data.forEach((doc) => {
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
    const student = await firestore.collection("students").doc(id);
    const data = await student.get();
    if (!data.exists) {
      res.status(404).send("Student with the given ID not found");
    } else {
      res.status(200).send(data.data());
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
    const student = await firestore.collection("students").doc(id);
    await student.update(data);
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

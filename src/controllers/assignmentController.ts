import { db as firebase, FieldPath } from "../database";
import { Request, Response, NextFunction } from "express";

const firestore = firebase.firestore();

export const getAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignmentId = req.params.id;
    const assignmentRef = firestore.collection("assignments").doc(assignmentId);
    const assignmentData = await assignmentRef.get();
    if (assignmentData.exists) {
      res.status(200).send(assignmentData.data());
    } else {
      res.status(404).send("Assignment with the given ID not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const setAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignmentId = req.body.id;
    delete req.body.id;
    const assignmentRef = firestore.collection("assignments").doc(assignmentId);
    await assignmentRef.set(req.body);
    res.status(200).send("ok");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getSomeDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { subjectsId, groupsId } = req.body;
    const subjectsRef = firestore
      .collection("subjects")
      .where(FieldPath.documentId(), "in", subjectsId);
    const groupsRef = firestore
      .collection("groups")
      .where(FieldPath.documentId(), "in", groupsId);

    const subjectsSnapshot = await subjectsRef.get();
    const groupsSnapshot = await groupsRef.get();

    type Subject = {
      id: string;
      studentsCount: number;
      name: string;
      description: string;
      assignmentsId: string[];
      lecturerId: string;
    };

    type Group = {
      id: string;
      assignmentId: string;
      isOpen: boolean;
      leaderId: string;
      membersId: string[];
    };

    const subjects: Subject[] = [];
    const groups: Group[] = [];
    const assignments: Object[] = [];

    subjectsSnapshot.forEach((doc) => {
      const {
        studentsCount,
        name,
        description,
        assignmentsId,
        lecturerId,
      } = doc.data();
      subjects.push({
        id: doc.id,
        studentsCount,
        name,
        description,
        assignmentsId,
        lecturerId,
      });
    });

    const assignmentsId: string[] = subjects.map((s) => s.assignmentsId).flat();
    const assignmentsRef = firestore
      .collection("assignments")
      .where(FieldPath.documentId(), "in", assignmentsId);
    const assignmentsSnapshot = await assignmentsRef.get();

    groupsSnapshot.forEach((doc) => {
      const { assignmentId, isOpen, leaderId, membersId } = doc.data();
      groups.push({
        id: doc.id,
        assignmentId,
        isOpen,
        leaderId,
        membersId,
      });
    });

    assignmentsSnapshot.forEach((doc) => {
      const { subjectCode, assignNo } = doc.data();

      const groupId =
        groups.find((g) =>
          subjects
            .find((s) => s.id == subjectCode)
            ?.assignmentsId.includes(g.assignmentId)
        )?.id || "";

      assignments.push({
        subjectCode,
        subjectTitle: subjects.find((s) => s.id == subjectCode)!.name,
        assignNo,
        groupId,
        assignmentId: doc.id,
      });
      if (groupId != "") {
        const indexInGroups = groups.map((g) => g.id).indexOf(groupId);
        groups.splice(indexInGroups, 1);
      }
    });
    console.log(assignments);
    res.status(200).send(assignments);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

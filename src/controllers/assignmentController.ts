import { db as firebase, FieldPath, FieldValue, Timestamp } from "../database";
import { Request, Response, NextFunction } from "express";
import transporter from "../nodemailer";
import { generate } from "short-uuid";
import {
  dateToTimestamp,
  getStringMonth,
  getAMPM,
  timestampToDate2,
} from "../utils";
import path from "path";

const firestore = firebase.firestore();

/**
 *  Get assignment details by its id.
 *
 *  @param {string} id (as assignment id)
 *
 *  @returns {Object}
 *
 *  {
 *    assignNo: number,
 *    description: string,
 *    dueDate: string,
 *    language: string,
 *    maxStudent: number,
 *    subjectCode: string,
 *    filename: string,
 *    title: string
 *  }
 */
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
      const data = assignmentData.data();
      const { dueDate } = assignmentData.data()!;
      data!.dueDate = timestampToDate2(dueDate);
      res.status(200).send(data);
    } else {
      res.status(404).send("Assignment with the given ID not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Create assignment for a course. (VERIFIED)
 *
 *  @param {Object} req.body
 *  {
 *    assignNo: number,
 *    description: string,
 *    dueDate: string,
 *    language: string,
 *    maxStudent: string,
 *    subjectCode: string,
 *    title?: string,
 *  }
 *
 *  @logic
 *  After receiving the subjectCode, the subject for this assignment
 *  was able to be identified.
 *
 *  Create a random id for the assignment and save to database with
 *  the provided req.body.
 *
 *  Replace the string due date by Firebase Timestamp object.
 *
 *  Update the subject item by adding the new assignment id into the
 *  assignmentsId array.
 */
export const setAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subjectCode = req.body.subjectCode;
    const assignmentId = generate();
    const assignmentRef = firestore.collection("assignments").doc(assignmentId);
    const stringDate = req.body.dueDate;
    req.body.dueDate = dateToTimestamp(stringDate);
    await assignmentRef.set(req.body);
    const subjectRef = firestore.collection("subjects").doc(subjectCode);
    await subjectRef.update({
      assignmentsId: FieldValue.arrayUnion(assignmentId),
    });
    res.status(200).send("ok");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Get some details to show at the 'assignments' screen in front-end for
 *  student. BUGGED
 *
 *  @param {string} req.body
 *
 *  {
 *    subjectsId: string[],  // student's joined subject
 *    groupsId: string[]     // student's already formed assignment group
 *  }
 *
 *  @logic
 *  Perform a lot of complex computations just to get
 *
 *  @returns {Array<Object>}
 *
 *  Array
 *    {
 *      subjectCode: string,
 *      subjectTitle: string,
 *      assignmentId: string,
 *      assignNo: number,
 *      groupId: string,
 *      language: string
 *    }
 *
 */
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
      const { subjectCode, assignNo, language, filename } = doc.data();

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
        language,
        assignmentId: doc.id,
        filename,
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

/**
 *  Calls after students have submitted an assignment.
 *
 *  @param {string} req.params.id
 *  @param {string} req.params.groupId
 *
 *
 *  @logic
 *  Getting some details of leader to set a notification and then
 *  update the group assignment status to submitted, with filename,
 *  and submission time.
 *
 */
// Student submit assignment
export const assignmentSubmit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignmentId = req.params.id;
    const groupId = req.params.groupId;
    const groupRef = firestore.collection("groups").doc(groupId);
    const groupSnapshot = await groupRef.get();
    const assignmentRef = firestore.collection("assignments").doc(assignmentId);
    const assignmentSnapshot = await assignmentRef.get();
    const { membersId, leaderId } = groupSnapshot.data()!;
    const { assignNo, subjectCode } = assignmentSnapshot.data()!;
    const date = new Date();
    // Query basic info of leader
    const leaderSnapshot = await firestore
      .collection("students")
      .doc(leaderId)
      .get();
    const { avatarUri, name } = leaderSnapshot.data()!;

    // Create notification
    await firestore
      .collection("notifications")
      .doc()
      .set({
        actor: leaderId,
        actorAvatarUri: avatarUri,
        actorName: name,
        createdAt: Timestamp.fromDate(date),
        message: `Assignment #${assignNo} for subject ${subjectCode} has been submitted by
      ${name} on ${getStringMonth(
          date.getMonth()
        )} ${date.getDate()}, ${date.getHours()}
      ${getAMPM(date.getHours())}.`,
        type: "assignmentSubmit",
        recipients: membersId,
      });

    // Update assignment status
    await groupRef.update({
      submissionStatus: true,
      submissionDate: Timestamp.fromDate(date), // can change to fieldvalue
      filename: req.file.originalname,
    });
    console.log(req.file);
    res.status(200).send("Success");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Lecturer uploads the assignment question.
 *
 *  @param {string} req.params.id assignmentId
 *
 *  @logic
 *
 *  Update the assignment's document about the filename
 *
 *  Query the students that are participating this subject.
 *
 *  Get the participating student's id into an array.
 *
 *  Create new notifications based on info gathered.
 */
// Lecturer upload assignment
export const assignmentQuestionUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //
    const assignmentId = req.params.id;
    const assignmentRef = firestore.collection("assignments").doc(assignmentId);
    const { subjectCode, assignNo } = (await assignmentRef.get()).data()!;
    const subjectRef = firestore.collection("subjects").doc(subjectCode);
    const { name, lecturerId } = (await subjectRef.get()).data()!;
    const lecturerRef = firestore.collection("lecturer").doc(lecturerId);
    const lecturerData = (await lecturerRef.get()).data()!;
    await assignmentRef.update({
      filename: req.file.originalname,
    });
    const studentQuery = firestore
      .collection("students")
      .where("subjectsId", "array-contains", subjectCode);
    const querySnapshot = await studentQuery.get();
    const involvedStudentsId: Array<string> = [];
    querySnapshot.forEach((doc) => {
      involvedStudentsId.push(doc.id);
    });
    await firestore
      .collection("notifications")
      .doc()
      .set({
        actor: lecturerId,
        actorAvatarUri: lecturerData.avatarUri,
        actorName: lecturerData.name,
        recipients: involvedStudentsId,
        createdAt: FieldValue.serverTimestamp(),
        message: `${lecturerData.name} has uploaded assignment question for ${subjectCode} ${name} Assignment ${assignNo}!
      Please check the download link of the question document.`,
        type: "assignmentRelease",
      });
    res.status(200).send("Ok");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Same thing for student's assignments view, but this is
 *  for lecturer's view.
 *
 *  @param {string} req.params.id
 *
 *  @returns {Object}
 *
 *  {
 *    assignmentId: string,
 *    assignNo: number,
 *    subjectCode: string,
 *    subjectTitle: string
 *  }
 *
 *  @logic
 *  Using the lecturer id, query the subjects that is being taught.
 *  From there store the subject's code and name in an array.
 *  Store the array of assignments of that particular course into an
 *  array as well.
 *  Flatten the array of assignmentsId to query for each of them.
 *  Parse the details obtained so far into the return object as shown
 *  above.
 *
 */
export const getSomeDetailsLecturer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lecturerId = req.params.lecturerId;
    const subjectQuery = firestore
      .collection("subjects")
      .where("lecturerId", "==", lecturerId);
    const querySnapshot = await subjectQuery.get();
    const allAssignmentsId: [][] = [];
    const subjects: { id: string; name: string }[] = [];
    const someDetails: Object[] = [];
    querySnapshot.forEach((doc) => {
      const { assignmentsId, name } = doc.data()!;
      allAssignmentsId.push(assignmentsId);
      subjects.push({
        id: doc.id,
        name,
      });
    });
    console.log(allAssignmentsId);
    const assignmentsQuery = firestore
      .collection("assignments")
      .where(FieldPath.documentId(), "in", allAssignmentsId.flat());
    const aQuerySnapshot = await assignmentsQuery.get();
    aQuerySnapshot.forEach((doc) => {
      const { subjectCode, assignNo } = doc.data()!;
      someDetails.push({
        assignmentId: doc.id,
        subjectCode,
        subjectTitle: subjects.find((s) => s.id == subjectCode)?.name,
        assignNo,
      });
    });

    res.status(200).send(someDetails);
  } catch (error) {
    res.status(400).send(error.message);
  }
  // let mailOptions = {
  //   from: "noreply2708@gmail.com",
  //   to: "pkay_@live.com",
  //   subject: "Testing and Testing",
  //   text: "It works",
  // };

  // transporter.sendMail(mailOptions, (err, data) => {
  //   if (err) {
  //     res.status(400).send(err);
  //   } else {
  //     res.status(200).send("Email sent!!!");
  //   }
  // });
};

/**
 *  Download assignments uploaded by students.
 *
 *  @param {string} req.params.filename
 *
 *  @returns {File}
 */
export const downloadStudentAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filename = req.params.filename;
    console.log(filename);
    const absolutePath = path.join(
      __dirname,
      "../../",
      "uploads",
      "assignments"
    );
    const filepath = path.join(absolutePath, filename);
    res.status(200).download(filepath);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Download assignment questions uploaded by lecturer.
 *
 *  @param {string} req.params.filename
 *
 *  @returns {File}
 */
export const downloadAssignmentQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filename = req.params.filename;
    console.log(filename);
    const absolutePath = path.join(__dirname, "../../", "uploads", "questions");
    const filepath = path.join(absolutePath, filename);
    res.status(200).download(filepath);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Query the group assignment statistics for lecturer analysis page.
 *
 *  @param {string} req.params.id assignmentsId
 *
 *  @returns {Object}
 *
 *  {
 *    dataset1: Array,    // Group member distribution
 *    dataset2: Array,    // Assignment submission rate
 *    studentsCount: number // total number of students enrolled in course
 *    subjectCode: string,
 *    subjectTitle: string,
 *    assignNo: number
 *  }
 */
export const supplyAssignmentData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignmentId = req.params.id;
    const assignmentRef = firestore.collection("assignments").doc(assignmentId);
    const assignmentSnapshot = await assignmentRef.get();
    const { maxStudent, subjectCode, assignNo } = assignmentSnapshot.data()!;
    const subjectRef = firestore.collection("subjects").doc(subjectCode);
    const subjectSnapshot = await subjectRef.get();
    const { studentsCount, subjectTitle } = subjectSnapshot.data()!;

    const dataset1 = await (async (maxStudent: number) => {
      let queries = [];
      for (let i = maxStudent; i > 0; i--) {
        const groupQuery = firestore
          .collection("groups")
          .where("assignmentId", "==", assignmentId)
          .where("membersCount", "==", i);
        const querySnapshot = await groupQuery.get();
        const size = querySnapshot.size;
        queries.push({ name: `${i} Member(s)`, value: size });
      }
      return Promise.all(queries);
    })(maxStudent);

    const dataset2 = await (async () => {
      const groupsQuery = firestore
        .collection("groups")
        .where("assignmentId", "==", assignmentId);
      const querySnapshot = await groupsQuery.get();
      const totalGroupsCount: number = querySnapshot.size;
      let submitted: number = 0;
      querySnapshot.forEach((doc) => {
        const { submissionStatus } = doc.data()!;
        if (submissionStatus) submitted++;
      });
      return [
        { name: "Submitted", value: submitted },
        { name: "Not submitted", value: totalGroupsCount - submitted },
      ];
    })();

    res
      .status(200)
      .send({
        dataset1,
        studentsCount,
        dataset2,
        subjectCode,
        subjectTitle,
        assignNo,
      });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Update assignment details. Only usable by lecturer.
 *
 *  @param {string} req.params.id assignmentId
 *
 *  @param {Object} req.body
 *
 *  {
 *    description: string,
 *    dueDate: string,
 *    language: string,
 *    maxStudent: number,
 *  }
 */
export const updateAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignmentId = req.params.id;
    const updatedDetails = req.body;
    const { dueDate } = req.body!;
    updatedDetails.dueDate = dateToTimestamp(dueDate);
    await firestore
      .collection("assignments")
      .doc(assignmentId)
      .update(updatedDetails);
    res.status(200).send("Successfully updated assignment!");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

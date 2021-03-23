import { db as firebase, FieldPath, FieldValue } from "../database";
import { Request, Response, NextFunction } from "express";
import { generate } from "short-uuid";
import { bookingAlgorithm, randomPop } from "../utils";

const firestore = firebase.firestore();

export const createGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      assignmentId,
      studentId,
    }: { assignmentId: string; studentId: string } = req.body;
    const newGroupId = generate();

    // Creating group with info
    await firestore.collection("groups").doc(newGroupId).set({
      assignmentId,
      isOpen: true,
      leaderId: studentId,
      membersCount: 1,
      membersId: [],
    });

    // Update groupsId reference array of student
    await firestore
      .collection("students")
      .doc(studentId)
      .update({
        groupsId: FieldValue.arrayUnion(newGroupId),
      });

    // TODO: Notification
    // TODO: Email

    res.status(200).send("Group created");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const groupRef = firestore.collection("groups").doc(groupId);
    const groupSnapshot = await groupRef.get();
    const groupData = groupSnapshot.data();

    res.status(200).send(groupData);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getAllGantt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const ganttRef = firestore
      .collection("groups")
      .doc(groupId)
      .collection("gantts")
      .orderBy("createdAt", "asc");
    const ganttSnapshot = await ganttRef.get();

    const ganttData: Array<Object> = [];

    ganttSnapshot.forEach((doc) => {
      ganttData.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).send(ganttData);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const addGantt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.body.id;
    const gantt = req.body;
    gantt.createdAt = FieldValue.serverTimestamp();

    await firestore
      .collection("groups")
      .doc(groupId)
      .collection("gantts")
      .doc()
      .set(gantt);

    res.status(200).send("Created");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getGroupMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const groupRef = firestore.collection("groups").doc(groupId);
    const groupSnapshot = await groupRef.get();
    const groupData = groupSnapshot.data();
    let groupMembersId: Array<String> = [];
    if (groupData!.membersId)
      groupMembersId = [groupData!.leaderId, ...groupData!.membersId];
    else groupMembersId = [groupData!.leaderId];
    const studentsRef = firestore
      .collection("students")
      .where(FieldPath.documentId(), "in", groupMembersId);
    const membersSnapshot = await studentsRef.get();
    const members: Array<Object> = [];
    membersSnapshot.forEach((doc) => {
      const { name, avatarUri } = doc.data();
      members.push({
        id: doc.id,
        name,
        avatarUri,
      });
    });
    res.status(200).send(members);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const addBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    let notUsedEverytime = [];
    const { memberId, startTime, endTime, day } = req.body;

    const groupRef = firestore.collection("groups").doc(groupId);
    const groupSnapshot = await groupRef.get();
    const memberBookingRef = groupRef.collection("booking");
    const query = memberBookingRef.where("memberId", "==", memberId);
    const querySnapshot = await query.get();
    console.log(groupId);

    if (querySnapshot.empty) {
      const completeData: any = {
        memberId,
        sunday: {},
        monday: {},
        tuesday: {},
        wednesday: {},
        thursday: {},
        friday: {},
        saturday: {},
        updatedAt: FieldValue.serverTimestamp(),
      };

      completeData[day].startTime = startTime;
      completeData[day].endTime = endTime;

      const memberBookingSnapshot = await memberBookingRef.get();
      if (!memberBookingSnapshot.empty) {
        memberBookingSnapshot.forEach((doc) => {
          notUsedEverytime.push(doc.data());
        });
      }
      await memberBookingRef.doc().set(completeData);
      notUsedEverytime.push(completeData);
      // const registeredMembersCount = await memberBookingRef
      //   .get()
      //   .then((snap) => snap.size);
      const groupSize = groupSnapshot.data()!.membersId.length + 1;

      const registeredMembersCount = notUsedEverytime.length;

      if (registeredMembersCount === groupSize) {
        await groupRef.update({
          confirmedTime: bookingAlgorithm(notUsedEverytime),
        });
      } else console.log("so deep");
      console.log("first");
      console.log(notUsedEverytime);
    } else {
      const dataId: string = querySnapshot.docs[0].id;

      const completeData: any = {
        updatedAt: FieldValue.serverTimestamp(),
      };
      completeData[`${day}.startTime`] = startTime;
      completeData[`${day}.endTime`] = endTime;

      await memberBookingRef.doc(dataId).update({
        ...completeData,
      });
      console.log("second");
    }
    res.status(200).send("hi");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const bookingRef = firestore
      .collection("groups")
      .doc(groupId)
      .collection("booking");
    const bookingSnapshot = await bookingRef.get();
    const bookingData: Array<Object> = [];
    bookingSnapshot.forEach((doc) => {
      bookingData.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).send(bookingData);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const joinGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Requester details
    const {
      studentId,
      groupId,
      email,
    }: { studentId: string; groupId: string; email: string } = req.body;

    const groupRef = firestore.collection("groups").doc(groupId);
    const groupSnapshot = await groupRef.get();
    if (groupSnapshot.exists) {
      const {
        isOpen,
        assignmentId,
        membersCount,
        membersId,
        leaderId,
      } = groupSnapshot.data()!;
      if (isOpen) {
        const membersAffectedRef = firestore
          .collection("students")
          .where(FieldPath.documentId(), "in", [...membersId, leaderId]);
        const query = await membersAffectedRef.get();
        const affectedEmails: string[] = [];
        query.forEach((doc) => {
          const { email } = doc.data()!;
          affectedEmails.push(email);
        });

        const assignmentRef = firestore
          .collection("assignments")
          .doc(assignmentId);
        const assignmentSnapshot = await assignmentRef.get();
        const { maxStudent } = assignmentSnapshot.data()!;
        const willMembersCount = membersCount + 1;
        if (willMembersCount < maxStudent) {
          await groupRef.update({
            membersId: FieldValue.arrayUnion(studentId),
            membersCount: willMembersCount,
          });
        } else {
          await groupRef.update({
            membersId: FieldValue.arrayUnion(studentId),
            membersCount: willMembersCount,
            isOpen: false,
          });
        }

        await firestore
          .collection("students")
          .doc(studentId)
          .update({
            groupsId: FieldValue.arrayUnion(groupId),
          });

        // Send Emails
        // Send Notifications
        res.status(200).send("ok");
      } else {
        res
          .status(403)
          .send("The group is eihter full or unavailable. Try another one.");
      }
    } else {
      res.status(404).send("The group does not exist");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

let matchmakeQueue: {
  assignmentId: string;
  studentId: string;
  email: string;
}[] = [];
export const matchmake = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      assignmentId,
      studentId,
      email,
    }: { assignmentId: string; studentId: string; email: string } = req.body;
    matchmakeQueue.push({ assignmentId, studentId, email });
    const assignmentRef = firestore.collection("assignments").doc(assignmentId);
    const assignmentSnapshot = await assignmentRef.get();
    const { maxStudent } = assignmentSnapshot.data()!;

    const sameAssignment = matchmakeQueue.filter(
      (request) => request.assignmentId === assignmentId
    );
    if (sameAssignment.length == maxStudent) {
      matchmakeQueue = matchmakeQueue.filter(
        (request) => request.assignmentId !== assignmentId
      );
      const newGroupId = generate();
      const studentsId = sameAssignment.map((s) => s.studentId);

      // Update students groupIds
      studentsId.forEach(async (id) => {
        await firestore
          .collection("students")
          .doc(id)
          .update({
            groupsId: FieldValue.arrayUnion(newGroupId),
          });
      });

      // Randomly select leader
      const randomized = randomPop(studentsId);

      // Create new group
      await firestore.collection("groups").doc(newGroupId).set({
        assignmentId,
        isOpen: false,
        leaderId: randomized.removedItem,
        membersId: randomized.arr,
        isSubmitted: false,
      });

      const emails = sameAssignment.map((s) => s.email);
      console.log(emails);
    }

    res.status(200).send("Placed into queue.");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getGroupAndAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const groupRef = firestore.collection("groups").doc(groupId);
    const groupSnapshot = await groupRef.get();
    const {
      leaderId,
      membersId,
      filename,
      submissionStatus,
      submissionDate,
      assignmentId,
    } = groupSnapshot.data()!;
    const assignmentRef = firestore.collection("assignments").doc(assignmentId);
    const assignmentSnapshot = await assignmentRef.get();
    const leaderSnapshot = await firestore
      .collection("students")
      .doc(leaderId)
      .get();
    const { id, name, avatarUri } = leaderSnapshot.data()!;
    const membersRef = firestore
      .collection("students")
      .where(FieldPath.documentId(), "in", membersId);
    const membersSnapshot = await membersRef.get();
    const members: Object[] = [];

    membersSnapshot.forEach((doc) => {
      const { id, name, avatarUri } = doc.data()!;
      members.push({
        id,
        name,
        avatarUri,
      });
    });
    const {
      assignNo,
      description,
      dueDate,
      maxStudent,
      assignmentDoc,
      subjectCode,
    } = assignmentSnapshot.data()!;

    const subjectTitle: string = await (async (subjectCode: string) => {
      const subjectSnapshot = await firestore
        .collection("subjects")
        .doc(subjectCode)
        .get();
      return subjectSnapshot.data()!.name;
    })(subjectCode);

    res.status(200).send({
      leader: {
        id,
        name,
        avatarUri,
      },
      members,
      filename: filename || "",
      submissionStatus,
      assignNo,
      description,
      dueDate,
      maxStudent,
      assignmentDoc,
      subjectCode,
      subjectTitle,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const openGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    await firestore.collection("groups").doc(groupId).update({
      isOpen: true,
    });
    res.status(200).send("Opened");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const closeGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    await firestore.collection("groups").doc(groupId).update({
      isOpen: false,
    });
    res.status(200).send("Group closed");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

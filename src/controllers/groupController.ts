import { db as firebase, FieldPath, FieldValue } from "../database";
import { Request, Response, NextFunction } from "express";
import { generate } from "short-uuid";
import { bookingAlgorithm, randomPop, timestampToDate } from "../utils";
import transporter from "../nodemailer";

const firestore = firebase.firestore();

/**
 *  Create an assignment group for students. VERIFIED
 *
 *  @param {Object} req.body
 *
 *  {
 *    assignmentId: string,
 *    studentId: string
 *  }
 *
 *  @logic
 *
 *  Generate a unique Id for the group.
 *
 *  Create a group with default info in database.
 *
 *  Update the student's groupsId array.
 *
 *
 */
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
      submissionStatus: false,
    });

    // Update groupsId reference array of student
    await firestore
      .collection("students")
      .doc(studentId)
      .update({
        groupsId: FieldValue.arrayUnion(newGroupId),
      });

    res.status(200).send("Group created");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Retrieves the informations of a group.
 *
 *  @param {string} req.params.id groupId
 *
 *  @returns {Object}
 *
 *  {
 *    assignmentId: string,
 *    confirmedTime: {
 *      day: string,
 *      endTime: number,
 *      startTime: number
 *    },
 *    filename: string,
 *    isOpen: boolean,
 *    leaderId: string,
 *    membersCount: number,
 *    membersId: Array<string>
 *    submissionDate: Timestamp
 *    submissionStatus: boolean
 *  }
 *
 */
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

/**
 *  Get all the gantts within a group.
 *
 *  @param {string} req.params.id groupId
 *
 *  @returns {Array<Object>}
 *  Array
 *    {
 *      ganttId: string,
 *      id: string            // groupId lol
 *      activity: string,
 *      assigneeId: string,
 *      deadline: string,
 *      from: number,
 *      to: number
 *    }
 */
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
        ganttId: doc.id,
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

/**
 *  Updates a gantt activity details.
 *
 *  @param {string} req.params.id groupId
 *  @param {string} req.params.ganttId ganttId
 *  @param {Object} req.body
 *  {
 *    *
 *  }
 *
 */
export const updateGantt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const ganttId = req.params.ganttId;
    const ganttRef = firestore
      .collection("groups")
      .doc(groupId)
      .collection("gantts")
      .doc(ganttId);
    await ganttRef.update(req.body);

    res.status(200).send("replaced");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Deletes a gantt activity of a group.
 *
 *  @param {string} req.params.id groupId
 *  @param {string} req.params.ganttId ganttId
 *
 *
 */
export const deleteGantt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const ganttId = req.params.ganttId;
    const ganttRef = firestore
      .collection("groups")
      .doc(groupId)
      .collection("gantt")
      .doc(ganttId);

    await ganttRef.delete();

    res.status(200).send("deleted!");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *
 */
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

/**
 *  Students join an assignment group that already exists in
 *  the assgienmtne given.
 *
 *  @param {Object} req.body
 *  {
 *    studentId: string,
 *    groupId: string,
 *    email: string,
 *    assignmentId: string
 *  }
 *
 *  @logic
 *
 *  Check to see whether the target group belongs to the same assignment.
 *
 *  Check to see if the group is still available for joining.
 *
 *  Extract emails of the affected students.
 *
 *  Check member count after adding the new member.
 *
 *  Update group information.
 *
 *  Update reference to requester.
 *
 *  Send notifications and emails to the affected students.
 *
 */
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
    const senderAssignmentId = req.body.assignmentId;
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

      if (assignmentId !== senderAssignmentId) {
        return res.status(400).send("The assignment id does not match");
      }

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
        const {
          maxStudent,
          assignNo,
          subjectCode,
        } = assignmentSnapshot.data()!;
        const willMembersCount = membersCount + 1;

        // If after adding a student, still have place, just update normally
        // Else if full set isOpen to false
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

        const requesterRef = firestore.collection("students").doc(studentId);
        // Update reference to requester document
        await requesterRef.update({
          groupsId: FieldValue.arrayUnion(groupId),
        });

        // Send Notifications
        const requesterSnapshot = await requesterRef.get();
        const { name, avatarUri } = requesterSnapshot.data()!;
        await firestore
          .collection("notifications")
          .doc()
          .set({
            type: "userJoin",
            actor: studentId,
            actorName: name,
            actorAvatarUri: avatarUri,
            message: `A friend had joined your assignment group for ${subjectCode} 
          Assignment ${assignNo}. Welcome him/her!`,
            createdAt: FieldValue.serverTimestamp(),
            recipients: [...membersId, leaderId],
          });

        // Send Emails
        let mailOptions = {
          from: "noreply2708@gmail.com",
          to: "pkay_@live.com",
          subject: "Testing and Testing",
          text: "It works",
        };

        transporter.sendMail(mailOptions, (err, data) => {});

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
      isOpen,
    } = groupSnapshot.data()!;
    const assignmentRef = firestore.collection("assignments").doc(assignmentId);
    const assignmentSnapshot = await assignmentRef.get();
    const leaderSnapshot = await firestore
      .collection("students")
      .doc(leaderId)
      .get();
    const { id, name, avatarUri } = leaderSnapshot.data()!;
    const members: Object[] = [];

    if (membersId && membersId.length > 0) {
      const membersRef = firestore
        .collection("students")
        .where(FieldPath.documentId(), "in", membersId);
      const membersSnapshot = await membersRef.get();

      membersSnapshot.forEach((doc) => {
        const { id, name, avatarUri } = doc.data()!;
        members.push({
          id,
          name,
          avatarUri,
        });
      });
    }
    const {
      assignNo,
      description,
      dueDate,
      maxStudent,
      assignmentDoc,
      subjectCode,
      language,
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
      assignmentId,
      dueDate: timestampToDate(dueDate),
      language,
      maxStudent,
      assignmentDoc,
      subjectCode,
      subjectTitle,
      isOpen,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const changeGroupAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const isOpen = req.body;
    await firestore.collection("groups").doc(groupId).update({
      isOpen,
    });
    res.status(200).send("Group set");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getChatMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const messagesRef = firestore
      .collection("groups")
      .doc(groupId)
      .collection("messages")
      .limit(25);
    const messagesSnapshot = await messagesRef.get();
    const messages: Object[] = [];
    messagesSnapshot.forEach((doc) => {
      messages.push({
        ...doc.data(),
        id: doc.id,
      });
    });
    res.status(200).send(messages);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

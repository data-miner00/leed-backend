import { db as firebase, FieldPath, FieldValue } from "../database";
import { Request, Response, NextFunction } from "express";
import { generate } from "short-uuid";
import { bookingAlgorithm, randomPop, timestampToDate } from "../utils";
import transporter from "../nodemailer";

import path from "path";
import fs from "fs";

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
      assignNo,
    }: { assignmentId: string; studentId: string; assignNo: number } = req.body;
    const newGroupId = generate();

    // Creating group with info
    await firestore.collection("groups").doc(newGroupId).set({
      assignmentId,
      isOpen: true,
      leaderId: studentId,
      membersCount: 1,
      membersId: [],
      submissionStatus: false,
      assignNo,
    });

    // Update groupsId reference array of student
    await firestore
      .collection("students")
      .doc(studentId)
      .update({
        groupsId: FieldValue.arrayUnion(newGroupId),
      });

    // Send the newgroupID to front end to update the UI
    res.status(200).send(newGroupId);
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
    const ganttId = generate();
    await firestore
      .collection("groups")
      .doc(groupId)
      .collection("gantts")
      .doc(ganttId)
      .set(gantt);

    res.status(200).send(ganttId);
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
 *
 *  {
 *    activity: string,
 *    assigneeId: string,
 *    deadline: string,
 *    from: number,
 *    to: number
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
 *  Get some details of group members.
 *
 *  @param {string} req.params.id groupId
 *
 *  @logic
 *
 *  Get the group info.
 *
 *  Check whether the group is only one people (leader).
 *
 *  Query all details of the members in the group.
 *
 *  @returns {Array<Object>}
 *  Array
 *    {
 *      id: string,
 *      name: string,
 *      avatarUri: string
 *    }
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

/**
 *  Add a discussion time booking.
 *
 *  @param {string} req.params.id groupId
 *  @param {Object} req.body
 *
 *  {
 *    memberId: string,
 *    startTime: number,
 *    endTime: number,
 *    day: string
 *  }
 *
 *  @logic
 *
 */
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

/**
 *  Retrieves all discussion booking data of a group.
 *
 *  @param {string} req.params.id groupId
 *
 *  @return {Array<Object>}
 *  Array
 *    {
 *      id: string,
 *      monday: {},
 *      tuesday: {},
 *      wednesday: {},
 *      thursday: {},
 *      friday: {},
 *      saturday: {},
 *      sunday: {},
 *      memberId: string,
 *      updatedAt: Timestamp
 *    }
 */
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
      console.log(isOpen);
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
        // Send 'user joined' email to existing members
        {
          let mailOptions = {
            from: "noreply2708@gmail.com",
            to: affectedEmails,
            subject: `New Group Member [${subjectCode}] A${assignNo}`,
            text: "A new friend has joined! Check him/her out now!",
          };

          transporter.sendMail(mailOptions, (err, data) => {
            if (err) console.error(err);
            console.log(data);
          });
        }

        // Send 'joined successfully' to user that request for join
        let mailOptions = {
          from: "noreply2708@gmail.com",
          to: email,
          subject: `Successfully Joined [${subjectCode}] A${assignNo}`,
          text:
            "Congratulations, you have successfully join the abovementioned assignment group!",
        };

        transporter.sendMail(mailOptions, (err, data) => {
          if (err) console.error(err);
          console.log(data);
        });

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

/**
 *  Matchmake students who wish to participate for group assignment.
 *
 *  @param {}
 */
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
    const { maxStudent, subjectCode, assignNo } = assignmentSnapshot.data()!;
    console.log(matchmakeQueue);
    res.status(200).send("Placed into queue.");
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
      const randomized = randomPop([...studentsId]);

      // Create new group
      await firestore.collection("groups").doc(newGroupId).set({
        assignmentId,
        isOpen: false,
        leaderId: randomized.removedItem,
        membersId: randomized.arr,
        submissionStatus: false,
        studentsCount: maxStudent,
        assignNo,
      });

      await firestore
        .collection("notifications")
        .doc()
        .set({
          type: "groupJoin",
          actor: "0xFFFFFF",
          actorName: "System",
          actorAvatarUri:
            "https://pbs.twimg.com/profile_images/1300994011251879936/aiDyq1Yz_400x400.jpg",
          message: `Your matchmaking request for joining group assignment of ${subjectCode} 
          Assignment ${assignNo} has been successful! Go ahead and find out who is your new friends!`,
          createdAt: FieldValue.serverTimestamp(),
          recipients: studentsId,
        });

      const emails = sameAssignment.map((s) => s.email);
      console.log(emails);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Serves data for the group and assignment info that used by both
 *  students and users.
 *
 *  @param {string} req.params.id groupId
 *
 *  @logic
 *  Get the group's info.
 *  Get the assignment's info.
 *  Get the leader's info.
 *  Get the member's info. (?)
 *
 *
 *
 *  @returns {Object}
 *
 *  {
 *    leader: {
 *      id: string,
 *      name: string,
 *      avatarUri: string,
 *    },
 *    members: Array<Obejct>,
 *    filename: string,
 *    submissionStatus: boolean,
 *    assignNo: number,
 *    description: string,
 *    assignmentId: string,
 *    dueDate: string,
 *    language: string,
 *    maxStudent: number,
 *    assignmentDoc: string,
 *    subjectCode: string,
 *    subjectTitle: string,
 *    isOpen: boolean,
 *  }
 */
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
    const { name, avatarUri } = leaderSnapshot.data()!;
    const members: Object[] = [];

    if (membersId && membersId.length > 0) {
      const membersRef = firestore
        .collection("students")
        .where(FieldPath.documentId(), "in", membersId);
      const membersSnapshot = await membersRef.get();

      membersSnapshot.forEach((doc) => {
        const { name, avatarUri } = doc.data()!;
        members.push({
          id: doc.id,
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
      subjectCode,
      language,
    } = assignmentSnapshot.data()!;
    const assignmentDoc = assignmentSnapshot.data()!.filename;

    const subjectTitle: string = await (async (subjectCode: string) => {
      const subjectSnapshot = await firestore
        .collection("subjects")
        .doc(subjectCode)
        .get();
      return subjectSnapshot.data()!.name;
    })(subjectCode);

    res.status(200).send({
      leader: {
        id: leaderId,
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

/**
 *  Change the group isOpen status.
 *
 *  @param {string} req.params.id groupId
 *  @param {{ isOpen: boolean }} req.body.isOpen new isOpen state.
 *
 *  @logic
 *  Perform update on group's availability based on the newest
 *  isOpen state.
 */
export const changeGroupAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const groupId = req.params.id;
    const { isOpen } = req.body;
    await firestore.collection("groups").doc(groupId).update({
      isOpen,
    });
    res.status(200).send("Group set");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

/**
 *  Get the chat messages for the assign group by groupId.
 *
 *  @param {string} req.params.id groupId
 *
 *  @returns {Array<Object>} Array of wrapped messages.
 */
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
      .orderBy("createdAt", "asc")
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

export const getCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const groupId = req.params.id;

  const pathToFile = path.join("uploads", "code", `${groupId}.file`);

  fs.access(pathToFile, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(200).send("// Type away!");
    }
    fs.readFile(pathToFile, "utf8", (err, data) => {
      if (err) return console.error(err);
      console.log(data);
      res.status(200).send(data);
    });
  });
};

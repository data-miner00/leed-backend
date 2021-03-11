import { db as firebase, FieldPath, FieldValue } from "../database";
import { Request, Response, NextFunction } from "express";
import { generate } from "short-uuid";
import { bookingAlgorithm } from "../utils";

const firestore = firebase.firestore();

export const addGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const creatorId = req.body.id;
    const newGroupId = generate();
    await firestore.collection("groups").doc(newGroupId).set(data);

    const creatorRef = firestore.collection("students").doc(creatorId);
    const creatorData = (await creatorRef.get()).data();
    if (creatorData!.hasOwnProperty("groupsId"))
      await firestore
        .collection("students")
        .doc(creatorId)
        .update({
          groupsId: [newGroupId, ...creatorData!.groupsId],
        });
    else
      await firestore
        .collection("students")
        .doc(creatorId)
        .update({
          groupsId: [newGroupId],
        });
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

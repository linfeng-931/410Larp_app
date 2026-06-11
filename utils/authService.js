import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  runTransaction,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  collection,
  query,
  where,
  writeBatch,
  orderBy,
  limit,
  startAfter,
  deleteField,
} from "firebase/firestore";
import { savePassword, getPassword } from "./secureStorage";

export const checkSignUp = async (email, password, extraData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      displayName: extraData.displayName,
      firstName: extraData.firstName,
      lastName: extraData.lastName,
      gender: extraData.gender,
      birthday: extraData.birthday,
      phone: extraData.phone,
      photoURL: extraData.profilePhoto || "",
      createdAt: serverTimestamp(),
      appointments: [],
      coupon: [],
      organizedGroups: [],
      joinedGroups: [],
      chatRooms: [],
      lastRead: {},
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const checkPersonalDetailUpdate = async (extraData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("用戶未登入");

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      displayName: extraData.displayName,
      firstName: extraData.firstName,
      lastName: extraData.lastName,
      gender: extraData.gender,
      birthday: extraData.birthday,
      photoURL: extraData.profilePhoto || "",
      updatedAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const checkContactUpdate = async (extraData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("用戶未登入");

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      phone: extraData,
      updatedAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const checkSignIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await savePassword("user_pwd", password);

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

export const fetchUserData = async () => {
  const user = auth.currentUser;
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("找不到文件！");
    }
  }
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const checkDeleteAccount = async (password) => {
  const user = auth.currentUser;
  if (!user) throw new Error("no-user");

  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    console.log("重新驗證成功");

    await deleteUserAndBookings(user.uid);

    const userDocRef = doc(db, "users", user.uid);
    await deleteDoc(userDocRef);
    console.log("Firestore 資料已刪除");

    await deleteUser(user);
    console.log("Auth 帳號已刪除");
    return true;
  } catch (error) {
    console.error("checkDeleteAccount 發生錯誤:", error.code);

    if (error.code === "auth/wrong-password") {
      throw new Error("密碼錯誤，請重新輸入");
    } else if (error.code === "auth/requires-recent-login") {
      throw new Error("登入逾時，請重新登入後再執行刪除");
    }

    throw error;
  }
};

const deleteUserAndBookings = async (userId) => {
  const batch = writeBatch(db);
  if (!userId) throw new Error("userId-is-required");

  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((document) => {
    batch.delete(document.ref);
  });

  await batch.commit();
  console.log("相關預約已成功刪除");
};

export const changeUserPassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error("用戶未登入");

  try {
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );

    await reauthenticateWithCredential(user, credential);
    console.log("重新驗證成功");

    await updatePassword(user, newPassword);
    await savePassword("user_pwd", newPassword);

    return true;
  } catch (error) {
    throw error;
  }
};

export const checkCreateReservation = async (bookingData) => {
  const {
    userId,
    date,
    time,
    title,
    originPrice,
    totalPrice,
    userName,
    duration,
    hostName,
    otherRequire,
    people,
    address,
  } = bookingData;

  const [h, m] = time.split(":").map(Number);
  const startTimeValue = h + m / 60;
  const endTimeValue = startTimeValue + duration;

  const safeDate = date.replace(/\//g, "-");
  const safeTitle = title.replace(/\//g, "-");
  const slotId = `${safeDate}_${time}_${safeTitle}`;

  const slotRef = doc(db, "bookings", slotId);
  const userRef = doc(db, "users", userId);

  try {
    await runTransaction(db, async (transaction) => {
      const slotSnap = await transaction.get(slotRef);
      if (slotSnap.exists()) {
        throw new Error("occupied");
      }

      transaction.set(slotRef, {
        status: "booked",
        userId: userId,
        userName: userName,
        originPrice: originPrice,
        totalPrice: totalPrice,
        createdAt: serverTimestamp(),
        date: date,
        time: time,
        title: title,
        people: people,
        address: address,
        hostName: hostName,
        otherRequire: otherRequire,
        startTimeValue,
        endTimeValue,
      });

      transaction.update(userRef, {
        appointments: arrayUnion({
          bookingId: slotId,
          date: date,
          time: time,
          title: title,
          people: people,
          address: address,
          startTimeValue,
          endTimeValue,
          bookedAt: new Date().toISOString(),
        }),
      });
    });
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const subscribeUserData = (callback) => {
  const user = auth.currentUser;
  if (!user) return null;

  const docRef = doc(db, "users", user.uid);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    },
    (error) => {
      if (error.code === "permission-denied") {
        console.log("監聽權限已移除 (用戶已登出)");
      } else {
        console.error("監聽失敗:", error);
      }
    },
  );

  return unsubscribe;
};

// 建立揪團
export const createGroupEvent = async (groupData) => {
  const {
    userId,
    hostPhotoURL = "",
    storyId,
    title,
    startDate,
    endDate,
    currentPeople,
    neededPeople,
    selectVerify,
    otherRequire,
  } = groupData;

  const groupId = `group_${Date.now()}_${userId}`;
  const chatRoomDocRef = doc(collection(db, "chatRooms"));
  const chatRoomId = chatRoomDocRef.id;

  const groupRef = doc(db, "groups", groupId);
  const userRef = doc(db, "users", userId);

  try {
    await runTransaction(db, async (transaction) => {
      transaction.set(groupRef, {
        groupId: groupId,
        hostId: userId,
        hostPhotoURL: hostPhotoURL,
        storyId: storyId,
        title: title,
        startDate: startDate,
        endDate: endDate,
        currentPeople: currentPeople,
        neededPeople: neededPeople,
        selectVerify: selectVerify,
        otherRequire: otherRequire,
        status: "open",
        participants: [userId],
        createdAt: serverTimestamp(),
      });

      transaction.set(chatRoomDocRef, {
        storyID: storyId,
        groupID: groupId,
        userId: [userId],
        message: [],
      });

      transaction.update(userRef, {
        organizedGroups: arrayUnion(groupId),
        joinedGroups: arrayUnion(groupId),
        chatRooms: arrayUnion(chatRoomId),
      });
    });
    return { success: true, groupId, chatRoomId };
  } catch (error) {
    console.error("建立揪團失敗:", error);
    throw error;
  }
};

export const fetchGroupsList = async (lastDoc = null) => {
  try {
    const groupsRef = collection(db, "groups");
    let q = query(
      groupsRef,
      where("status", "==", "open"),
      orderBy("startDate", "asc"),
      limit(10),
    );

    if (lastDoc) {
      q = query(
        groupsRef,
        where("status", "==", "open"),
        orderBy("startDate", "asc"),
        startAfter(lastDoc),
        limit(10),
      );
    }

    const snapshot = await getDocs(q);
    const fetchedGroups = [];
    snapshot.forEach((doc) => {
      fetchedGroups.push({ id: doc.id, ...doc.data() });
    });
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return { fetchedGroups, lastVisible };
  } catch (error) {
    console.error("抓取揪團失敗:", error);
    throw error;
  }
};

export const joinGroupEvent = async (groupId, userId) => {
  const groupRef = doc(db, "groups", groupId);
  const userRef = doc(db, "users", userId);

  try {
    let resultType = "";
    await runTransaction(db, async (transaction) => {
      const groupSnap = await transaction.get(groupRef);
      if (!groupSnap.exists()) throw new Error("該揪團不存在或已關閉");

      const groupData = groupSnap.data();

      if (groupData.participants && groupData.participants.includes(userId)) {
        throw new Error("您已經是此揪團的成員囉！");
      }

      if (groupData.selectVerify) {
        const pendingUsers = groupData.pendingApprovals || [];
        if (pendingUsers.includes(userId)) {
          throw new Error("您已送出過審查申請，請靜候團長回覆。");
        }

        const todayStr = new Date().toISOString().split("T")[0];

        transaction.update(groupRef, {
          pendingApprovals: arrayUnion(userId),
          [`applyDates.${userId}`]: todayStr,
        });
        resultType = "verify";
      } else {
        const remainingSlots = groupData.neededPeople || 0;
        if (remainingSlots <= 0) {
          throw new Error("非常抱歉！就在剛剛該揪團人數已滿！");
        }

        const newNeededPeople = remainingSlots - 1;
        transaction.update(groupRef, {
          neededPeople: newNeededPeople,
          participants: arrayUnion(userId),
          status: newNeededPeople === 0 ? "filled" : "open",
        });

        transaction.update(userRef, {
          joinedGroups: arrayUnion(groupId),
        });
        resultType = "direct";
      }
    });

    return { success: true, type: resultType };
  } catch (error) {
    throw error;
  }
};

// 修正：補齊了原本因結構斷裂而缺失的 } 括號
export const fetchUserChatRooms = async (chatRoomIds) => {
  if (!chatRoomIds || chatRoomIds.length === 0) return [];

  try {
    const roomPromises = chatRoomIds.map(async (roomId) => {
      const roomRef = doc(db, "chatRooms", roomId);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        return { id: roomSnap.id, ...roomSnap.data() };
      }
      return null;
    });

    const resolvedRooms = await Promise.all(roomPromises);
    return resolvedRooms.filter((room) => room !== null);
  } catch (error) {
    console.error("fetchUserChatRooms 發生錯誤:", error);
    throw error;
  }
};

export const fetchMyOrganizedGroups = async (userId) => {
  try {
    const groupsRef = collection(db, "groups");
    const q = query(
      groupsRef,
      where("hostId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    const fetchedGroups = [];
    snapshot.forEach((doc) => {
      fetchedGroups.push({ id: doc.id, ...doc.data() });
    });
    return fetchedGroups;
  } catch (error) {
    console.error("抓取個人揪團失敗:", error);
    throw error;
  }
};

export const subscribeUserChatRooms = (chatRoomIds, callback) => {
  if (!chatRoomIds || chatRoomIds.length === 0) {
    callback([]);
    return () => {};
  }

  const roomsMap = {};

  const unsubscribes = chatRoomIds.map((roomId) => {
    const roomRef = doc(db, "chatRooms", roomId);

    return onSnapshot(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          roomsMap[roomId] = { id: snapshot.id, ...snapshot.data() };
        } else {
          delete roomsMap[roomId];
        }
        const updatedRoomsList = Object.values(roomsMap);
        callback(updatedRoomsList);
      },
      (error) => {
        console.error(`監聽聊天室 ${roomId} 失敗:`, error);
      },
    );
  });

  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
};

export const updateRoomLastRead = async (userId, roomId) => {
  if (!userId || !roomId) return;
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`lastRead.${roomId}`]: serverTimestamp(),
    });
  } catch (error) {
    console.error("更新最後讀取時間失敗:", error);
  }
};

export const formatMessageTime = (firestoreTimestamp) => {
  if (!firestoreTimestamp) return "";
  const msgDate = firestoreTimestamp.toDate
    ? firestoreTimestamp.toDate()
    : new Date(firestoreTimestamp);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  );
  const compareDate = new Date(
    msgDate.getFullYear(),
    msgDate.getMonth(),
    msgDate.getDate(),
  );

  if (compareDate.getTime() === today.getTime()) {
    const hours = String(msgDate.getHours()).padStart(2, "0");
    const minutes = String(msgDate.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  } else if (compareDate.getTime() === yesterday.getTime()) {
    return "昨天";
  } else {
    const month = msgDate.getMonth() + 1;
    const date = msgDate.getDate();
    return `${month}/${date}`;
  }
};

export const subscribeSingleChatRoom = (roomId, callback) => {
  if (!roomId) return () => {};

  const roomRef = doc(db, "chatRooms", roomId);

  return onSnapshot(
    roomRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data.message || []);
      } else {
        console.log("該聊天室不存在");
        callback([]);
      }
    },
    (error) => {
      console.error(`監聽聊天室 ${roomId} 失敗:`, error);
    },
  );
};

export const sendChatMessage = async (roomId, userId, content) => {
  if (!roomId || !userId || !content.trim()) return;

  const roomRef = doc(db, "chatRooms", roomId);
  const newMsg = {
    content: content,
    user: userId,
    time: new Date(),
  };

  try {
    await updateDoc(roomRef, {
      message: arrayUnion(newMsg),
    });
  } catch (error) {
    console.error("發送新訊息至資料庫失敗:", error);
    throw error;
  }
};

export const deleteGroup = async (groupId) => {
  try {
    await deleteDoc(doc(db, "groups", groupId));
    return true;
  } catch (error) {
    console.error("刪除揪團失敗:", error);
    throw error;
  }
};

export const fetchPendingApplicantsDetails = async (myGroups) => {
  const applicants = [];
  try {
    for (const group of myGroups) {
      const pendingUids = group.pendingApprovals || [];
      const applyDates = group.applyDates || {};
      for (const uid of pendingUids) {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          applicants.push({
            groupId: group.id,
            groupTitle: group.title,
            applicantId: uid,
            applicantData: userDoc.data(),
            applyDate:
              applyDates[uid] || new Date().toISOString().split("T")[0],
          });
        }
      }
    }
    return applicants.sort(
      (a, b) => new Date(b.applyDate) - new Date(a.applyDate),
    );
  } catch (error) {
    console.error("抓取審查名單失敗:", error);
    throw error;
  }
};

export const fetchChatRoomMembersProfile = async (roomId) => {
  if (!roomId) return {};

  try {
    const roomRef = doc(db, "chatRooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      console.log("找不到該聊天室文件");
      return {};
    }

    const roomData = roomSnap.data();
    const userIds = roomData.userId || [];

    if (userIds.length === 0) return {};

    const profilePromises = userIds.map(async (uid) => {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          uid: uid,
          photoURL: userData.photoURL || "",
          displayName: userData.displayName || "神祕使用者",
        };
      }
      return null;
    });

    const resolvedProfiles = await Promise.all(profilePromises);

    const profilesMap = {};
    resolvedProfiles.forEach((profile) => {
      if (profile) {
        profilesMap[profile.uid] = {
          photoURL: profile.photoURL,
          displayName: profile.displayName,
        };
      }
    });

    return profilesMap;
  } catch (error) {
    console.error("fetchChatRoomMembersProfile 發生錯誤:", error);
    throw error;
  }
};

export const joinChatRoom = async (chatRoomId, userId) => {
  if (!chatRoomId || !userId) {
    throw new Error("缺少聊天室 ID 或使用者 ID");
  }

  const roomRef = doc(db, "chatRooms", chatRoomId);
  const userRef = doc(db, "users", userId);

  try {
    await runTransaction(db, async (transaction) => {
      const roomSnap = await transaction.get(roomRef);
      if (!roomSnap.exists()) {
        throw new Error("該聊天室不存在");
      }

      const roomData = roomSnap.data();
      if (roomData.userId && roomData.userId.includes(userId)) {
        throw new Error("您已經在此聊天室中囉！");
      }

      transaction.update(roomRef, {
        userId: arrayUnion(userId),
      });

      transaction.update(userRef, {
        chatRooms: arrayUnion(chatRoomId),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("加入聊天室失敗:", error);
    throw error;
  }
};

export const processJoinRequest = async (groupId, applicantId, isApproved) => {
  const groupRef = doc(db, "groups", groupId);

  try {
    await runTransaction(db, async (transaction) => {
      const groupSnap = await transaction.get(groupRef);
      if (!groupSnap.exists()) throw new Error("該揪團不存在或已刪除");

      const groupData = groupSnap.data();
      const pending = groupData.pendingApprovals || [];

      if (!pending.includes(applicantId)) {
        throw new Error("該申請 nonexistent 或已被處理");
      }

      const newPending = pending.filter((id) => id !== applicantId);

      if (isApproved) {
        const needed = groupData.neededPeople || 0;
        if (needed <= 0) throw new Error("此揪團人數已滿！無法再同意申請。");

        const newNeeded = needed - 1;
        transaction.update(groupRef, {
          pendingApprovals: newPending,
          participants: arrayUnion(applicantId),
          neededPeople: newNeeded,
          status: newNeeded === 0 ? "filled" : "open",
          [`applyDates.${applicantId}`]: deleteField(),
        });
      } else {
        transaction.update(groupRef, {
          pendingApprovals: newPending,
          [`applyDates.${applicantId}`]: deleteField(),
        });
      }
    });
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const fetchChatRoomIdByGroupId = async (groupId) => {
  if (!groupId) throw new Error("缺少揪團 ID");

  try {
    const chatRoomsRef = collection(db, "chatRooms");
    const q = query(chatRoomsRef, where("groupID", "==", groupId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("找不到此揪團對應的聊天室");
    }

    const roomDoc = querySnapshot.docs[0];
    return roomDoc.id;
  } catch (error) {
    console.error("fetchChatRoomIdByGroupId 發生錯誤:", error);
    throw error;
  }
};

export const leaveChatRoom = async (roomId, userId) => {
  if (!roomId || !userId) {
    throw new Error("缺少聊天室 ID 或使用者 ID");
  }

  try {
    const batch = writeBatch(db);

    const userRef = doc(db, "users", userId);
    const roomRef = doc(db, "chatRooms", roomId);
    batch.update(userRef, {
      chatRooms: arrayRemove(roomId),
    });

    batch.update(roomRef, {
      userId: arrayRemove(userId),
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("刪除/退出聊天室失敗:", error);
    throw error;
  }
};

export const subscribeMyOrganizedGroups = (userId, callback) => {
  const groupsRef = collection(db, "groups");
  const q = query(
    groupsRef,
    where("hostId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const fetchedGroups = [];
      snapshot.forEach((doc) => {
        fetchedGroups.push({ id: doc.id, ...doc.data() });
      });
      callback(fetchedGroups);
    },
    (error) => {
      console.error("即時監聽個人揪團失敗:", error);
    },
  );
};

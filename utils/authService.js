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
  onSnapshot,
  collection,
  query,
  where,
  writeBatch,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { savePassword, getPassword } from "./secureStorage";
import { use } from "react";

export const checkSignUp = async (email, password, extraData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // useEffect(() => {
    //   const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
    //     const data = doc.data();
    //     setEvents(data.appointments);
    //   });

    //   return () => unsubscribe();
    // }, [user.uid]);

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
      email: extraData.email,
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
      createdAt: serverTimestamp(),
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

    // 刪除 bookings 對應資料
    console.log(user.uid);
    await deleteUserAndBookings(user.uid);

    // 刪除使用者 Firestore 資料
    const userDocRef = doc(db, "users", user.uid);
    await deleteDoc(userDocRef);
    console.log("Firestore 資料已刪除");

    // 刪除使用者
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
    // console.error("預約 Transaction 失敗:", error);
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
      // 當登出時，這裡會被觸發
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

  // 揪團 ID
  const groupId = `group_${Date.now()}_${userId}`;

  const chatRoomDocRef = doc(collection(db, "chatRooms"));
  const chatRoomId = chatRoomDocRef.id;

  const groupRef = doc(db, "groups", groupId);
  const userRef = doc(db, "users", userId);

  try {
    await runTransaction(db, async (transaction) => {
      // 建立揪團資料
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
        status: "open", // open, full, closed 等狀態
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
        chatRooms: arrayUnion(chatRoomId)
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
      where("status", "==", "open"), // 僅抓取開放中的揪團
      orderBy("startDate", "asc"), // 依開始日期排序
      limit(10), // 每次 10 筆
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

      // 判斷是否需要審查
      if (groupData.selectVerify) {
        const pendingUsers = groupData.pendingApprovals || [];
        if (pendingUsers.includes(userId)) {
          throw new Error("您已送出過審查申請，請靜候團長回覆。");
        }
        transaction.update(groupRef, {
          pendingApprovals: arrayUnion(userId),
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
          status: newNeededPeople === 0 ? "filled" : "open", // 人數若歸零，直接改變狀態為 filled
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

export const subscribeUserChatRooms = (chatRoomIds, callback) => {
  if (!chatRoomIds || chatRoomIds.length === 0) {
    callback([]);
    return () => {};
  }

  // 用來存放每個聊天室最新狀態的暫存物件
  const roomsMap = {};

  // 訂閱所有個別的聊天室
  const unsubscribes = chatRoomIds.map((roomId) => {
    const roomRef = doc(db, "chatRooms", roomId);

    return onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        // 將更新的資料寫入暫存
        roomsMap[roomId] = { id: snapshot.id, ...snapshot.data() };
      } else {
        delete roomsMap[roomId];
      }
      
      const updatedRoomsList = Object.values(roomsMap);
      
      // 進行重新渲染
      callback(updatedRoomsList);
    }, (error) => {
      console.error(`監聽聊天室 ${roomId} 失敗:`, error);
    });
  });

  // 回傳一個綜合的解除監聽函式
  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
};

export const updateRoomLastRead = async (userId, roomId) => {
  if (!userId || !roomId) return;
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`lastRead.${roomId}`]: serverTimestamp()
    });
  } catch (error) {
    console.error("更新最後讀取時間失敗:", error);
  }
};

export const formatMessageTime = (firestoreTimestamp) => {
  if (!firestoreTimestamp) return "";
  const msgDate = firestoreTimestamp.toDate ? firestoreTimestamp.toDate() : new Date(firestoreTimestamp);
  
  const now = new Date();

  // 比較日期
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const compareDate = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());

  // 回傳對應格式
  if (compareDate.getTime() === today.getTime()) {
    // 今天
    const hours = String(msgDate.getHours()).padStart(2, '0');
    const minutes = String(msgDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } else if (compareDate.getTime() === yesterday.getTime()) {
    // 昨天
    return "昨天";
  } else {
    // 超過昨天
    const month = msgDate.getMonth() + 1;
    const date = msgDate.getDate();
    return `${month}/${date}`;
  }
};

export const subscribeSingleChatRoom = (roomId, callback) => {
  if (!roomId) return () => {};
  
  const roomRef = doc(db, "chatRooms", roomId);
  
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback(data.message || []);
    } else {
      console.log("該聊天室不存在");
      callback([]);
    }
  }, (error) => {
    console.error(`監聽聊天室 ${roomId} 失敗:`, error);
  });
};

export const sendChatMessage = async (roomId, userId, content) => {
  if (!roomId || !userId || !content.trim()) return;

  const roomRef = doc(db, "chatRooms", roomId);
  const newMsg = {
    content: content,
    user: userId,
    time: new Date()
  };

  try {
    await updateDoc(roomRef, {
      message: arrayUnion(newMsg)
    });
  } catch (error) {
    console.error("發送新訊息至資料庫失敗:", error);
    throw error;
  }
};

// 聊天室存取使用者資料
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
          displayName: userData.displayName || "神祕使用者"
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
          displayName: profile.displayName
        };
      }
    });

    return profilesMap;
  } catch (error) {
    console.error("fetchChatRoomMembersProfile 發生錯誤:", error);
    throw error;
  }
};

//加入聊天室
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
        userId: arrayUnion(userId)
      });

      transaction.update(userRef, {
        chatRooms: arrayUnion(chatRoomId)
      });
    });

    return { success: true };
  } catch (error) {
    console.error("加入聊天室失敗:", error);
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
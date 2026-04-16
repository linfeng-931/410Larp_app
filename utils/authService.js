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

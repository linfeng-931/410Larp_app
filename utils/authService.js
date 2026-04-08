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
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
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
      email: extraData.email,
      appointments: [],
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
      appointments: [],
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
      createdAt: serverTimestamp(),
      appointments: [],
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

export const checkDeleteAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("no-user");

  try {
    const userDocRef = doc(db, "users", user.uid);
    await deleteDoc(userDocRef);
    console.log("Firestore 資料已刪除");

    await user.delete();
    console.log("Auth 帳號已刪除");

    return true;
  } catch (error) {
    console.error("checkDeleteAccount 發生錯誤:", error.code);
    throw error;
  }
};

export const changeUserPassword = async (newPassword, currentPasswordInput = null) => {
  const user = auth.currentUser;
  if (!user) throw new Error("用戶未登入");

  try {
    const savedPassword = currentPasswordInput || await getPassword("user_pwd");
    console.log("嘗試使用本地密碼重新驗證...");

    if (!savedPassword) {
      throw { code: 'auth/requires-recent-login' };
    }

    const credential = EmailAuthProvider.credential(user.email, savedPassword);
    
    try {
      await reauthenticateWithCredential(user, credential);
    } catch (reauthError) {
      console.error("重新驗證失敗：", reauthError.code);
      if (reauthError.code === 'auth/wrong-password') {
        throw new Error("舊密碼錯誤，請重新輸入");
      }
      throw reauthError;
    }

    await updatePassword(user, newPassword);

    await savePassword("user_pwd", newPassword);
    
    return true;
  } catch (error) {
    throw error;
  }
};

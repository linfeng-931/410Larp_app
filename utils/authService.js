import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

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

export const checkSignIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

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

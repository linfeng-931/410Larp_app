import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

export const signUp = async (email, password, extraData) => {
  try {
    const response = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    await firestore().collection("users").doc(response.user.uid).set({
      uid: response.user.uid,
      displayName: extraData.displayName,
      firstName: extraData.firstName,
      lastName: extraData.lastName,
      gender: extraData.gender,
      birthday: extraData.birthday,
      phone: extraData.phone,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return response.user;
  } catch (error) {
    throw error;
  }
};

export const login = (email, password) =>
  auth().signInWithEmailAndPassword(email, password);

export const resetPassword = (email) => auth().sendPasswordResetEmail(email);

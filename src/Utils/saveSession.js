import { db } from "../Backend/firebase-init";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const saveSession = async (user) => {
  if (!user) return;

  try {
    const deviceInfo = navigator.userAgent; // you can later use library to parse device name

    await addDoc(
      collection(db, "userSessions", user.uid, "sessions"),
      {
        device: deviceInfo,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        isActive: true,
      }
    );
  } catch (error) {
    console.log("Session error:", error);
  }
};
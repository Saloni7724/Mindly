import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../Backend/firebase-init";

export const getuserDetail = async (userId) => {
  const userCollection = collection(db, "users");
  const queryIntent = query(userCollection, where("user_id", "==", userId));
  const userDataSnapShots = await getDocs(queryIntent);
  const userData = userDataSnapShots.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return userData ? userData : undefined;
};

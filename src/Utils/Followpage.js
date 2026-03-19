import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../Backend/firebase-init";

/**
 * FOLLOW USER
 */
const followpage = async (follower_id, followee_id) => {
  try {

    // ❌ self-follow
    if (follower_id === followee_id) {
      console.log("❌ You cannot follow yourself");
      return false;
    }

    // ✅ Use unique ID to avoid duplicates
    const followDocId = `${follower_id}_${followee_id}`;
    const followRef = doc(db, "Follower", followDocId);

    // 🔍 Check if already exists
    const followersRef = collection(db, "Follower");

    const q = query(
      followersRef,
      where("follower_id", "==", follower_id),
      where("followee_id", "==", followee_id)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.log("⚠ Already following");
      return true;
    }

    // ✅ Insert follow data
    const followData = {
      follow_id: followDocId,
      follower_id,
      followee_id,
      followed_on: new Date().toISOString(),
    };

    await setDoc(followRef, followData);

    console.log("✅ Follow added");
    return true;

  } catch (error) {
    console.log("❌ Follow ERROR:", error.message);
    return false;
  }
};


/**
 * CHECK FOLLOW STATUS
 */
const checkfollow = async (follower_id, followee_id) => {
  try {
    const followersRef = collection(db, "Follower");

    const q = query(
      followersRef,
      where("follower_id", "==", follower_id),
      where("followee_id", "==", followee_id)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

  } catch (error) {
    console.log("❌ CHECK FOLLOW ERROR:", error.message);
    return false;
  }
};


/**
 * UNFOLLOW USER (OPTIONAL BUT BEST PRACTICE)
 */
const unfollow = async (follower_id, followee_id) => {
  try {

    const followersRef = collection(db, "Follower");

    const q = query(
      followersRef,
      where("follower_id", "==", follower_id),
      where("followee_id", "==", followee_id)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("⚠ No follow record found");
      return false;
    }

    const deletePromises = snapshot.docs.map((docItem) =>
      deleteDoc(doc(db, "Follower", docItem.id))
    );

    await Promise.all(deletePromises);

    console.log("✅ Unfollow success");
    return true;

  } catch (error) {
    console.log("❌ Unfollow ERROR:", error.message);
    return false;
  }
};

export { followpage, checkfollow, unfollow };
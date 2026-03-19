
import { collection, query, where, getDocs, deleteDoc} from "firebase/firestore";
import { db } from "../Backend/firebase-init";

export const unfollow = async (follower_id, followee_id) => {
  try {
    // Reference to the Follower collection
    const followersRef = collection(db, "Follower");

    // Query to find the document with matching follower_id and followee_id
    const q = query(
      followersRef,
      where("follower_id", "==", follower_id),
      where("followee_id", "==", followee_id)
    );

    // Execute the query
    const querySnapshot = await getDocs(q);

    // Check if a matching document exists and delete it
    if (!querySnapshot.empty) {
      // Assume only one matching follow record exists
      const followDoc = querySnapshot.docs[0];
      await deleteDoc(followDoc.ref);
      console.log(`Successfully deleted follow record with follower_id: ${follower_id} and followee_id: ${followee_id}`);
      return true;
    } else {
      console.log("No matching follow record found.");
      return false;
    }
  } catch (error) {
    console.log("ERROR-DELETING-FOLLOWER", error.message);
    return false;
  }
};

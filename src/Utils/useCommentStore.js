import { create } from "zustand";
import { db } from "../Backend/firebase-init";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";

const useCommentStore = create((set, get) => ({
  commentIds: [],
  commentsStore: [],
  isLoading: false,
  fetchCommentsInfo: async (newCommentIds) => {
    const { commentIds, commentsStore } = get();

    // Filter out the commentIds that have already been fetched
    const idsToFetch = newCommentIds.filter((id) => !commentIds.includes(id));
    if (idsToFetch.length === 0) {
      return set({
        isLoading: false,
      });
    }

    set({ isLoading: true });

    try {
      const docRef = collection(db, "Comments");
      const queryData = query(docRef, where("commentId", "in", idsToFetch));
      const data = await getDocs(queryData);
      const result = [];

      data.forEach((doc) => {
        result.push({ id: doc.id, ...doc.data() });
      });

      if (result.length > 0) {
        // Add new commentIds to the existing list, remove duplicates
        const updatedCommentIds = [
          ...new Set([...commentIds, ...newCommentIds]), // Merge and remove duplicates
        ];

        // Merge new comments with the existing ones based on commentId
        const updatedCommentsStore = [
          ...commentsStore,
          ...result.filter(
            (newComment) =>
              !commentsStore.some(
                (existingComment) =>
                  existingComment.commentId === newComment.commentId
              )
          ),
        ];

        // Update the Zustand store state
        return set({
          commentIds: updatedCommentIds,
          commentsStore: updatedCommentsStore,
          isLoading: false,
        });
      } else {
        // If no new comments found, keep existing state
        return set({
          isLoading: false,
        });
      }
    } catch (error) {
      console.log("Error in fetchCommentsInfo:", error.message);
      return set({
        isLoading: false,
      });
    }
  },
  deleteComment: async (commentId) => {
    const { commentIds, commentsStore } = get();
    const updatedCommentIds = commentIds.filter((id) => id !== commentId);

    // Remove from commentsStore
    const updatedCommentsStore = commentsStore.filter(
      (comment) => comment.commentId !== commentId
    );
    try {
      const commentDocRef = collection(db, "Comments");
      const queryData = query(
        commentDocRef,
        where("commentId", "==", commentId)
      );
      const querySnapshot = await getDocs(queryData);

      if (!querySnapshot.empty) {
        const commentDoc = querySnapshot.docs[0];
        await deleteDoc(doc(db, "Comments", commentDoc.id)); // Delete the comment from Firebase
      }

      // Update Zustand store with the new state after deletion
      set({
        commentIds: updatedCommentIds,
        commentsStore: updatedCommentsStore,
      });
    } catch (error) {
      console.log("Error in removeComment:", error.message);
    }
  },
  setcommentsStore: (newCommentsStoreValue, newCommentIds) => {
    const { commentIds, commentsStore } = get();
    return set({
      commentIds: newCommentIds ? newCommentIds : commentIds,
      commentsStore: newCommentsStoreValue
        ? newCommentsStoreValue
        : commentsStore,
      isLoading: false,
    });
  },
}));

export default useCommentStore;
